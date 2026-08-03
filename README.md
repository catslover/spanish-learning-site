# Claire's Spanish Hub

A simple static website for organizing Homeschool Spanish Academy materials by child, week, topic, and material type.

## What is included

- `index.html` is the kids' download and flashcard page.
- `admin.html` helps Claire create new entries for the weekly materials list.
- `data/materials.json` is the site catalog.
- `materials/` stores the downloadable files.

## Weekly Update Routine

1. Create a folder for the child and week, such as `materials/child-1/week-02/`.
2. Add the PDFs, worksheets, audio files, or practice notes for that week.
3. Open `admin.html`, fill out the form, and copy the generated entry.
4. Paste the entry into the `materials` array in `data/materials.json`.
5. Save and publish through GitHub Pages.

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
