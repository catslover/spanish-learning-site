# Claire's Spanish Hub

A simple static website for organizing Homeschool Spanish Academy High School Level 1 materials by curriculum number, child, topic, and material type.

## What is included

- `index.html` is the student hub for today's HSA item, the course path, packets, practice, and report cards.
- `admin.html` holds parent tools for publishing the official current HSA item and creating new material entries.
- `data/materials.json` is the site catalog.
- `data/curriculum.json` is the full 30-item curriculum sequence.
- `data/site-config.json` controls the current week highlight.
- `data/report-cards.json` stores one current report-card entry per child.
- `curriculum/` stores the persistent Spanish I source-of-truth files, design workflow, and module template.
- `lessons/` stores student-facing companion website lessons, beginning with the Unit 1 lesson index.
- `materials/` stores the downloadable files.
- `reports/` stores report-card PDFs.

## Publish The Current HSA Item

Open `data/site-config.json` and change one number:

```json
{
  "programTitle": "Homeschool Spanish Academy High School Level 1",
  "currentScheduleNumber": 1,
  "currentLabel": "Current Week"
}
```

Use the HSA sequence number from `data/curriculum.json`, not the lesson PDF number. For example, HSA Lesson 5 is sequence item `9`.

## Learning Path Buttons

The integrated sequence has a `Done` button for each HSA curriculum item. In parent view, `Preview Today` and `Preview Next HSA Item` let Claire inspect another item locally before publishing it. Unit supplements appear under the HSA item they support. These marks are saved in the browser on that computer. They are helpful for day-to-day use, but they do not change the official shared site files.

For the official current week shown to everyone, update `currentScheduleNumber` in `data/site-config.json`.

## Report Cards

Current report cards are stored as:

- `reports/spencer/current-report-card.pdf`
- `reports/victor/current-report-card.pdf`

To update report cards without duplicates:

1. Replace the PDF for that child using the same filename.
2. Update that child's existing entry in `data/report-cards.json`.
3. Keep the same report `id`, such as `spencer-current` or `victor-current`.

Do not add a second "current" report card for the same child unless you want to keep history. Later, archived report cards can use labels such as `Fall 2026 Report Card`.

## Class Upload Routine

1. Create or open a shared student folder for the HSA item, such as `materials/all-kids/curriculum-09/`.
2. Add the PDFs, worksheets, audio files, or practice notes for that class.
3. Open `admin.html`, fill out the form, and copy the generated entry.
4. Paste the entry into the `materials` array in `data/materials.json`.
5. Save and publish through GitHub Pages.

## Current Curriculum Packets

Current shared class packets are in:

- `materials/all-kids/curriculum-01/h1al1-alphabet.pdf`
- `materials/all-kids/curriculum-02/h1al2-greetings-farewells.pdf`
- `materials/all-kids/curriculum-03/h1al3-classroom.pdf`
- `materials/all-kids/curriculum-06/h1al4-subject-pronouns.pdf`
- `materials/all-kids/curriculum-09/h1al5-origin-nationality.pdf`
- `materials/all-kids/curriculum-10/h1al6-ser-descriptions-colors.pdf`
- `materials/all-kids/curriculum-13/h1al7-professions-occupations.pdf`
- `materials/all-kids/curriculum-14/h1al8-hay-house-parts.pdf`
- `materials/all-kids/curriculum-17/h1al9-cardinal-numbers.pdf`
- `materials/all-kids/curriculum-18/h1al10-time-events.pdf`
- `materials/all-kids/curriculum-21/h1al11-date-seasons.pdf`
- `materials/all-kids/curriculum-22/h1al12-estar-conditions-states.pdf`
- `materials/all-kids/curriculum-25/h1al13-places-locations.pdf`
- `materials/all-kids/curriculum-26/h1al14-querer-vegetables.pdf`

Use `all-kids` for shared student materials. Use `parent` only for parent-facing materials; learner-specific material slots are reserved for a future customization layer.

## Running The Local Preview Server

Open a terminal in the `spanish-learning-site` folder and run:

```sh
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

Keep that terminal window open while previewing the site. To stop the server, click the terminal and press `Control-C`.

## GitHub Pages Setup

If this project is in a GitHub repository:

1. Go to the repository on GitHub.
2. Open **Settings**.
3. Open **Pages**.
4. Set **Source** to **Deploy from a branch**.
5. Choose the `main` branch and `/root` folder.
6. Save.

GitHub will show the public site link after the first deploy finishes.

## Notes

GitHub Pages is a static website host. That means the site can show and download files, but it cannot permanently save browser uploads by itself. Claire should add weekly files through GitHub's upload button or through the repository on her computer.
