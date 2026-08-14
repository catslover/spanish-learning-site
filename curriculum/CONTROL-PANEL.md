# Spanish I Curriculum Control Panel

Status source: current repository files, especially `curriculum/unit-01/unit-plan.md`, `curriculum/unit-01/pronunciation.md`, `curriculum/unit-01/u1-1-implementation.json`, and `data/curriculum.json`.

Website dashboard: `parent-dashboard.html`

## Course Framework

- Core spine: Homeschool Spanish Academy High School Level 1.
- Supplement role: depth, practice, projects, audio, and discussion support; not a replacement for HSA.
- Current target: ACTFL Novice High moving toward emerging Intermediate Low.
- Workload rule: keep Unit 1 supplements rigorous but sustainable alongside hockey travel.

## Current Position

You are here: verify the implemented U1.1 Pronunciation package, then return to U1.2 Numbers.

Repo status says U1.1 is implemented. The older planning-chat handoff said U1.1 still needed final PDF, audio, flashcards, reading interaction, and identity-card completion. This control panel follows the repo as source of truth and preserves that discrepancy as a parent review note.

## HSA Progress

| HSA item | Status | Note |
| --- | --- | --- |
| Lessons 1-4 | Complete | Alphabet, greetings/farewells, classroom language, subject pronouns. |
| Quiz 1 | Complete | Completed before current Unit 1 supplement review. |
| Exam 1 | Complete | Completed; Week 6 continues with family and identity work. |

## Unit 1 Tracker

| Module | Status | Current meaning |
| --- | --- | --- |
| U1.1 Pronunciation Workshop | Approved / Implemented | Repo metadata says website lesson, audio, flashcards, interactive reading, identity-card project, and student PDF are complete. Parent review/verification remains the active milestone. |
| U1.2 Numbers | Paused / Planned | Drafted in planning chat, but `curriculum/unit-01/numbers.md` and `unit-plan.md` currently mark it planned. Resume after U1.1 review. |
| U1.3 Five Partner Conversations | Planned | Build Victor/Spencer exchanges in modeled, scaffolded, and independent rounds. |
| U1.4 Family Expansion | Planned | Extend family and identity language aligned to HSA Lesson 4. |
| U1.5 Writing Practice | Planned | Same task for both students; difficulty based on Spanish ability, not grade level. |
| U1.6 Speaking Self-Introduction | Planned | Move from supported to partially supported to independent speaking. |
| U1.7 Reading | Partially developed / Planned | U1.1 established the reading design strategy; later Unit 1 reading remains planned. |
| U1.8 Mini Project: Así soy yo | Designed / Planned | U1.1 includes the Spanish-only identity-card project; broader Unit 1 culminating project remains planned. |
| El Mundo Hispano culture strand | Later | Needs separate design discussion; enrichment strand, not a full parallel course. |

## U1.1 Implementation Checklist

- [x] Curriculum source exists.
- [x] Student web lesson exists: `lessons/u1-1-pronunciation.html`.
- [x] Adjacent audio controls and local `.m4a` assets exist.
- [x] Audio manifest exists: `data/audio-manifest.json`.
- [x] Flashcard deck exists: `lessons/u1-1-flashcards.html`.
- [x] Flashcard data exists: `data/flashcards.json`.
- [x] Selective flashcard illustrations exist under `media/u1-1-pronunciation/illustrations/`.
- [x] Mini reading "Dos hermanos, un dia ocupado" is implemented in the U1.1 package.
- [x] Reading comprehension uses 3 multiple-choice and 2 short-answer questions.
- [x] Hockey-item interaction includes `el corazon de hierro`.
- [x] Spanish-only identity-card project exists in U1.1.
- [x] Student PDF exists: `materials/all-kids/curriculum-01/u1-1-pronunciation-workshop.pdf`.
- [x] Facilitator reference is listed as the final page of the student packet.
- [ ] Parent review: verify web lesson, flashcards, audio quality, reading interaction, identity-card workflow, PDF usability, and total workload.

## Next Step

Do one parent review pass through U1.1:

1. Open `lessons/u1-1-pronunciation.html`.
2. Sample vowel, pattern, reading, hockey, and project audio.
3. Open `lessons/u1-1-flashcards.html` and test several audio cards.
4. Try the reading comprehension and hockey-item interaction.
5. Fill a sample identity card.
6. Skim the PDF for print usability and facilitator clarity.
7. After review, resume U1.2 Numbers.

## Discrepancies To Watch

- Planning-chat state: U1.1 was described as curriculum-approved but still needing PDF/audio/flashcard/reading/project completion.
- Repo state: U1.1 is now marked implemented and lists the above deliverables as complete.
- U1.2 state: planning chat contains a drafted Numbers module, while current repo files mark Numbers as planned.
