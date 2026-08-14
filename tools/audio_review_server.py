#!/usr/bin/env python3
"""Local preview server with a repository save endpoint for audio review."""

from __future__ import annotations

import json
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SUBMISSION_PATH = ROOT / "data" / "media-qa" / "u1-1-audio-review-submission.json"
ALLOWED_PATH = "/api/audio-review/submission"


class AudioReviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        origin = self.headers.get("Origin")
        if origin and (
            origin.startswith("http://127.0.0.1:")
            or origin.startswith("http://localhost:")
            or origin.endswith(".github.io")
        ):
            self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        if self.path != ALLOWED_PATH:
            self.send_error(404, "Unknown endpoint")
            return
        self.send_response(204)
        self.end_headers()

    def do_POST(self) -> None:
        if self.path != ALLOWED_PATH:
            self.send_error(404, "Unknown endpoint")
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(content_length))
            validate_submission(payload)
            SUBMISSION_PATH.parent.mkdir(parents=True, exist_ok=True)
            SUBMISSION_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
        except Exception as exc:
            self.send_json({"ok": False, "error": str(exc)}, status=400)
            return

        self.send_json({"ok": True, "path": str(SUBMISSION_PATH.relative_to(ROOT))})

    def send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def validate_submission(payload: dict) -> None:
    if not isinstance(payload, dict):
        raise ValueError("Submission must be a JSON object.")
    if payload.get("status") != "submitted":
        raise ValueError("Submission status must be submitted.")
    if not isinstance(payload.get("items"), list) or not payload["items"]:
        raise ValueError("Submission must include review items.")
    if not isinstance(payload.get("summary"), dict):
        raise ValueError("Submission must include a summary.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the audio review persistence helper.")
    parser.add_argument("--port", type=int, default=4175)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), AudioReviewHandler)
    print(f"Audio review persistence helper running at http://127.0.0.1:{args.port}{ALLOWED_PATH}")
    server.serve_forever()


if __name__ == "__main__":
    main()
