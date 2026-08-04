# Claire's Spanish Hub

A simple static website for organizing Homeschool Spanish Academy materials by child, class, topic, and material type.

## What is included

- `index.html` is the kids' download and flashcard page.
- `admin.html` helps Claire create new entries for the class materials list.
- `data/materials.json` is the site catalog.
- `materials/` stores the downloadable files.

## Class Upload Routine

1. Create or open a folder for the child and class, such as `materials/child-1/class-02/`.
2. Add the PDFs, worksheets, audio files, or practice notes for that class.
3. Open `admin.html`, fill out the form, and copy the generated entry.
4. Paste the entry into the `materials` array in `data/materials.json`.
5. Save and publish through GitHub Pages.

## First Four Classes

Starter folders are ready for:

- `materials/child-1/class-01/`
- `materials/child-1/class-02/`
- `materials/child-1/class-03/`
- `materials/child-1/class-04/`
- `materials/child-2/class-01/`
- `materials/child-2/class-02/`
- `materials/child-2/class-03/`
- `materials/child-2/class-04/`

When the first four class files are uploaded, add one catalog entry per download file.

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
