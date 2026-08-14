# Spanish I Supplement Project Index

Status: active repository memory for curriculum and website work.

## Current Workflow

- Spanish Curriculum Planning chat: explores curriculum and approves content.
- Spanish Website Work task: persists approved content into this repository and builds web, PDF, and media deliverables.
- Repository: source of truth.

When the planning chat cannot write to the repository, use this Website Work task as the bridge. The bridge should read the planning chat, extract approved decisions, and update the repository directly.

## Current Unit

Unit 1: Así Soy Yo

| Module | Curriculum Status | Website Status | Print Status | Media Status |
| --- | --- | --- | --- | --- |
| U1.1 Pronunciation Workshop | Implemented | Lesson, reading, project, flashcards, and audio review built | Student packet created | Audio added; selective illustrations added; review manifest added |
| U1.2 Numbers | Planned | Not started | Not started | Not started |
| U1.3 Partner Conversations | Planned | Not started | Not started | Not started |
| U1.4 Family Expansion | Planned | Not started | Not started | Not started |
| U1.5 Writing | Planned | Not started | Not started | Not started |
| U1.6 Speaking Self-Introduction | Planned | Not started | Not started | Not started |
| U1.7 Short Reading + Website Audio | Planned | Not started | Not started | Not started |
| U1.8 Así Soy Yo Project | Planned | Not started | Not started | Not started |
| Culture: El Mundo Hispano | Later / design discussion needed | Not started | Not started | Not started |

## U1.1 Files

- Curriculum source: `curriculum/unit-01/pronunciation.md`
- Audio specification: `curriculum/unit-01/u1-1-audio-spec.md`
- Flashcard specification: `curriculum/unit-01/u1-1-flashcard-spec.md`
- Reading and project content: `curriculum/unit-01/u1-1-reading-project.md`
- Implementation metadata: `curriculum/unit-01/u1-1-implementation.json`
- Flashcard data: `data/flashcards.json`
- Audio placement manifest: `data/audio-manifest.json`
- Media QA report: `data/media-qa/u1-1-audio-qa-report.json`
- Human audio review submission: `data/media-qa/u1-1-audio-review-submission.json`
- Audio recheck roll-up: `data/media-qa/u1-1-audio-recheck-rollup.json`
- Media QA script: `tools/media_qa.py`
- Local audio generator: `tools/generate_audio.py`
- Local Spanish TTS model: `tools/tts-models/es/es_MX/ald/medium/es_MX-ald-medium.onnx`
- Audio files: `media/u1-1-pronunciation/`
- Website lesson: `lessons/u1-1-pronunciation.html`
- Website flashcards: `lessons/u1-1-flashcards.html`
- Website audio review tool: `lessons/audio-review.html`
- Student packet PDF: `materials/all-kids/curriculum-01/u1-1-pronunciation-workshop.pdf`

## Next Repository Actions

- Review U1.1 in the browser and packet PDF with Victor and Spencer.
- Use `lessons/audio-review.html` to mark incorrect clips and export a correction report.
- Human marks stay in browser local storage until exported; persist exported review JSON into `data/media-qa/u1-1-audio-review-submission.json`.
- Replace any marked audio with corrected native/human-recorded audio.
- Rerun machine audio checks with `.media-qa-venv/bin/python tools/media_qa.py --transcribe --model tiny --output data/media-qa/u1-1-audio-qa-report.json` after audio changes.
