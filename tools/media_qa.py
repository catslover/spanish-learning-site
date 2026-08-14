#!/usr/bin/env python3
"""Media QA helper for Spanish curriculum assets.

Checks local audio availability and metadata, and optionally transcribes clips
with faster-whisper when the project media QA environment is installed.
"""

from __future__ import annotations

import argparse
import difflib
import json
import re
import subprocess
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

try:
    from mutagen import File as MutagenFile
except Exception:  # pragma: no cover - reported in output
    MutagenFile = None


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data" / "audio-manifest.json"
DEFAULT_REPORT = ROOT / "data" / "media-qa" / "u1-1-audio-qa-report.json"


def normalize_text(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = text.lower()
    text = text.replace("¿", "").replace("?", "").replace("¡", "").replace("!", "")
    text = re.sub(r"[^a-z0-9ñáéíóúü\s]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def audio_metadata(path: Path) -> dict:
    result = {
        "exists": path.exists(),
        "durationSeconds": None,
        "mimeType": None,
        "sizeBytes": path.stat().st_size if path.exists() else None,
        "metadataOk": False,
        "metadataError": None,
    }
    if not path.exists():
        result["metadataError"] = "File does not exist."
        return result

    if MutagenFile is not None:
        try:
            audio = MutagenFile(path)
            if audio and audio.info:
                result["durationSeconds"] = round(float(audio.info.length), 3)
                result["mimeType"] = getattr(audio, "mime", [None])[0]
                result["metadataOk"] = True
                return result
        except Exception as exc:
            result["metadataError"] = f"mutagen: {exc}"

    try:
        output = subprocess.check_output(["afinfo", str(path)], text=True, stderr=subprocess.STDOUT)
        match = re.search(r"estimated duration: ([0-9.]+) sec", output)
        if match:
            result["durationSeconds"] = round(float(match.group(1)), 3)
            result["metadataOk"] = True
    except Exception as exc:
        result["metadataError"] = f"afinfo: {exc}"

    return result


def duration_flag(expected: str, duration: float | None) -> str | None:
    if duration is None:
        return "missing_duration"
    if duration < 0.25:
        return "too_short_to_be_valid"
    if len(expected) > 45 and duration < 1.2:
        return "long_text_short_audio"
    if len(expected) > 100 and duration < 2.5:
        return "very_long_text_short_audio"
    return None


def load_transcriber(model_name: str, compute_type: str):
    try:
        from faster_whisper import WhisperModel
    except Exception as exc:
        raise RuntimeError(
            "faster-whisper is not installed. Run .media-qa-venv/bin/python -m pip install faster-whisper"
        ) from exc
    return WhisperModel(model_name, device="cpu", compute_type=compute_type, download_root=str(ROOT / ".media-qa-cache"))


def transcribe(model, path: Path) -> dict:
    segments, info = model.transcribe(
        str(path),
        language="es",
        beam_size=5,
        vad_filter=False,
        condition_on_previous_text=False,
    )
    text = " ".join(segment.text.strip() for segment in segments).strip()
    return {
        "text": text,
        "language": getattr(info, "language", None),
        "languageProbability": round(float(getattr(info, "language_probability", 0.0)), 3),
    }


def compare(expected: str, observed: str) -> dict:
    expected_norm = normalize_text(expected)
    observed_norm = normalize_text(observed)
    ratio = difflib.SequenceMatcher(None, expected_norm, observed_norm).ratio() if expected_norm or observed_norm else 0
    return {
        "expectedNormalized": expected_norm,
        "observedNormalized": observed_norm,
        "similarity": round(ratio, 3),
        "textMatchLikely": ratio >= 0.72,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Check Spanish curriculum audio assets.")
    parser.add_argument("--manifest", default=str(MANIFEST), help="Path to audio manifest JSON.")
    parser.add_argument("--output", default=str(DEFAULT_REPORT), help="Path to write QA report JSON.")
    parser.add_argument("--transcribe", action="store_true", help="Run faster-whisper transcription checks.")
    parser.add_argument("--model", default="tiny", help="faster-whisper model name, e.g. tiny or base.")
    parser.add_argument("--compute-type", default="int8", help="faster-whisper compute type.")
    parser.add_argument("--limit", type=int, default=0, help="Limit clips for a smoke test.")
    args = parser.parse_args()

    manifest_path = (ROOT / args.manifest).resolve() if not Path(args.manifest).is_absolute() else Path(args.manifest)
    manifest = json.loads(manifest_path.read_text())
    items = manifest["items"][: args.limit or None]

    model = None
    if args.transcribe:
        model = load_transcriber(args.model, args.compute_type)

    report_items = []
    for item in items:
        path = ROOT / item["file"]
        meta = audio_metadata(path)
        item_report = {
            "id": item["id"],
            "group": item["group"],
            "file": item["file"],
            "placement": item["placement"],
            "expectedText": item["expectedText"],
            "expectedEnglish": item.get("expectedEnglish"),
            "reviewPriority": item.get("reviewPriority", "normal"),
            "metadata": meta,
            "flags": [],
        }
        flag = duration_flag(item["expectedText"], meta["durationSeconds"])
        if flag:
            item_report["flags"].append(flag)
        if not meta["exists"]:
            item_report["flags"].append("missing_file")
        if meta["sizeBytes"] is not None and meta["sizeBytes"] < 800:
            item_report["flags"].append("very_small_file")

        if model and meta["exists"]:
            tx = transcribe(model, path)
            item_report["transcription"] = tx
            item_report["textComparison"] = compare(item["expectedText"], tx["text"])
            if not item_report["textComparison"]["textMatchLikely"]:
                item_report["flags"].append("transcription_text_mismatch")

        report_items.append(item_report)

    summary = {
        "manifestVersion": manifest.get("version"),
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "itemsChecked": len(report_items),
        "totalManifestItems": len(manifest["items"]),
        "missingFiles": sum("missing_file" in item["flags"] for item in report_items),
        "durationWarnings": sum(any(flag.endswith("short_audio") or flag == "too_short_to_be_valid" for flag in item["flags"]) for item in report_items),
        "transcriptionEnabled": bool(model),
        "transcriptionWarnings": sum("transcription_text_mismatch" in item["flags"] for item in report_items),
    }
    output = (ROOT / args.output).resolve() if not Path(args.output).is_absolute() else Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({"summary": summary, "items": report_items}, ensure_ascii=False, indent=2))
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
