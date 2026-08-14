#!/usr/bin/env python3
"""Generate Spanish curriculum audio locally."""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL = ROOT / "tools" / "tts-models" / "es" / "es_MX" / "ald" / "medium" / "es_MX-ald-medium.onnx"
DEFAULT_CONFIG = ROOT / "tools" / "tts-models" / "es" / "es_MX" / "ald" / "medium" / "es_MX-ald-medium.onnx.json"
DEFAULT_ESPEAK_DATA = Path(".media-qa-venv/lib/python3.9/site-packages/piper/espeak-ng-data")
PIPER = ROOT / ".media-qa-venv" / "bin" / "piper"
DEFAULT_APPLE_SPANISH_VOICE = "Paulina"
DEFAULT_APPLE_VOWEL_RATE = "115"


def generate_piper(text: str, output: Path, length_scale: str = "1.18") -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env["ESPEAK_DATA_PATH"] = str(DEFAULT_ESPEAK_DATA)
    command = [
        str(PIPER),
        "-m",
        str(DEFAULT_MODEL),
        "-c",
        str(DEFAULT_CONFIG),
        "-f",
        str(output),
        "--length-scale",
        length_scale,
        "--sentence-silence",
        "0.08",
    ]
    subprocess.run(command, input=text, text=True, check=True, env=env, cwd=ROOT)


def generate_apple_voice(text: str, output: Path, voice: str, rate: str) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_aiff = Path(temp_dir) / f"{output.stem}.aiff"
        temp_wav = Path(temp_dir) / f"{output.stem}.wav"
        subprocess.run(["say", "-v", voice, "-r", rate, "-o", str(temp_aiff), text], check=True, cwd=ROOT)
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@24000", str(temp_aiff), str(temp_wav)], check=True, cwd=ROOT)
        validate_audio_duration(temp_wav)
        temp_wav.replace(output)


def validate_audio_duration(path: Path, minimum_seconds: float = 0.2) -> None:
    output = subprocess.check_output(["afinfo", str(path)], text=True, stderr=subprocess.STDOUT)
    match = re.search(r"estimated duration: ([0-9.]+) sec", output)
    duration = float(match.group(1)) if match else 0
    if duration < minimum_seconds:
        raise RuntimeError(f"Generated audio is silent or too short: {path} ({duration:.3f}s)")


def generate_vowels(voice: str, rate: str, use_piper: bool, length_scale: str) -> None:
    use_apple_voice = not use_piper and shutil.which("say") and shutil.which("afconvert")
    for vowel in ["a", "e", "i", "o", "u"]:
        output = ROOT / "media" / "u1-1-pronunciation" / "vowels" / f"{vowel}.wav"
        if use_apple_voice:
            generate_apple_voice(vowel, output, voice, rate)
        else:
            generate_piper(vowel, output, length_scale)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate local Spanish audio.")
    parser.add_argument("--text", help="Spanish text to synthesize.")
    parser.add_argument("--output", help="Output WAV path.")
    parser.add_argument("--length-scale", default="1.18")
    parser.add_argument("--voice", default=DEFAULT_APPLE_SPANISH_VOICE, help="macOS Spanish voice for vowel generation.")
    parser.add_argument("--rate", default=DEFAULT_APPLE_VOWEL_RATE, help="macOS speech rate for vowel generation.")
    parser.add_argument("--vowels", action="store_true", help="Regenerate U1.1 vowel clips.")
    parser.add_argument("--piper-vowels", action="store_true", help="Force Piper for vowels instead of the macOS Spanish voice.")
    args = parser.parse_args()

    if args.vowels:
        generate_vowels(args.voice, args.rate, args.piper_vowels, args.length_scale)
        return 0

    if not args.text or not args.output:
        parser.error("--text and --output are required unless --vowels is used.")
    generate_piper(args.text, ROOT / args.output, args.length_scale)
    return 0


if __name__ == "__main__":
    sys.exit(main())
