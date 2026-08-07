# Claire's Spanish Hub

A simple static website for organizing Homeschool Spanish Academy High School Level 1 materials by curriculum number, child, topic, and material type.

## What is included

- `index.html` is the kids' download and flashcard page.
- `admin.html` helps Claire create new entries for the class materials list.
- `data/materials.json` is the site catalog.
- `data/curriculum.json` is the full 30-item curriculum sequence.
- `data/site-config.json` controls the current week highlight.
- `materials/` stores the downloadable files.

## Set The Current Week

Open `data/site-config.json` and change one number:

```json
{
  "programTitle": "Homeschool Spanish Academy High School Level 1",
  "currentScheduleNumber": 1,
  "currentLabel": "Current Week"
}
```

Use the screenshot curriculum number, not the lesson PDF number. For example, Lesson 5 is curriculum item `9`.

## Done And Next Buttons

The schedule page has a `Done` button for each curriculum item and a `Next` button to move the current focus. These marks are saved in the browser on that computer. They are helpful for the kids' day-to-day progress, but they do not change the official shared site files.

For the official current week shown to everyone, update `currentScheduleNumber` in `data/site-config.json`.

## Class Upload Routine

1. Create or open a folder for the child and curriculum item, such as `materials/child-1/curriculum-09/`.
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

Use `all-kids` for materials both children should see. Use `child-1` or `child-2` only for child-specific homework.

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
