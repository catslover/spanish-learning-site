# Curriculum Design Workflow

Use this file to keep curriculum-design work connected to the website repository.

## Working Model

The curriculum design chat can be exploratory, but the repository is the durable source of truth. At the end of each useful design session, convert the decisions into files under `curriculum/`.

## Source Of Truth Files

- `curriculum/SPANISH-I-BUILD-GUIDE.md` stores course-wide rules.
- `curriculum/unit-01/unit-plan.md` stores the active unit tracker.
- `curriculum/unit-01/*.md` stores module-level design notes.
- `data/curriculum.json` stores the public HSA sequence shown on the site.
- `lessons/` stores student-facing website lessons.
- `materials/` stores downloadable PDFs and class materials.

## Recommended Design Session Handoff

At the end of a curriculum design chat, ask for a repository handoff using this format:

```text
Please persist this curriculum design work into the Spanish site repository.

Update:
- Course rules, if any changed
- The active unit tracker
- The relevant module file
- Website lesson or materials notes, if needed

Keep exploratory ideas separate from approved decisions.
```

## Module File Pattern

Each module file should use this structure:

```md
# Module Title

Status: designing | approved | built | archived

## HSA Anchor

- Curriculum number:
- HSA lesson:
- Topic:

## Learning Goals

- 

## Student Outcomes

By the end, Victor and Spencer can:

- 

## Activities

- Modeled:
- Scaffolded:
- Partner:
- Independent:

## Website Companion

- Audio needed:
- Interactive practice needed:
- Student-facing page:

## Printable Packet

- Pages planned:
- Parent / Instructor / Facilitator reference:

## Open Questions

- 

## Approved Decisions

- 
```

## Keeping Exploration Separate

Use `Open Questions` for ideas that are still unsettled. Move only confirmed choices into `Approved Decisions`, the unit tracker, or the build guide.

## Website Build Trigger

When a module is approved, create or update the corresponding student-facing page in `lessons/` and connect it from the curriculum or materials data only after the content is ready for the kids to use.
