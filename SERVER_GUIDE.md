# Server Guide

This site is a static website. The local server is only for previewing it on your computer before publishing.

## Start the preview

1. Open Terminal.
2. Go to the site folder:

```sh
cd path/to/spanish-learning-site
```

3. Start the server:

```sh
python3 -m http.server 4173
```

4. Open this address in a browser:

```text
http://127.0.0.1:4173/
```

## Stop the preview

Go back to the Terminal window that is running the server and press:

```text
Control-C
```

## Add class files

Shared class packets are stored in:

- `materials/all-kids/curriculum-01/`
- `materials/all-kids/curriculum-02/`
- `materials/all-kids/curriculum-03/`
- `materials/all-kids/curriculum-06/`
- `materials/all-kids/curriculum-09/`
- `materials/all-kids/curriculum-10/`
- `materials/all-kids/curriculum-13/`
- `materials/all-kids/curriculum-14/`
- `materials/all-kids/curriculum-17/`
- `materials/all-kids/curriculum-18/`
- `materials/all-kids/curriculum-21/`
- `materials/all-kids/curriculum-22/`
- `materials/all-kids/curriculum-25/`
- `materials/all-kids/curriculum-26/`

Use `materials/all-kids/` for shared student materials. Use `materials/parent/` only for parent-facing files. Learner-specific folders are reserved for a future customization layer.

After files are added, open `admin.html`, create a catalog entry, and paste it into `data/materials.json`.

## Update report cards

Use one current report card per child:

- `reports/spencer/current-report-card.pdf`
- `reports/victor/current-report-card.pdf`

When a new report card is uploaded, replace the matching PDF and update the matching existing entry in `data/report-cards.json`. Keeping the same report ID prevents duplicate entries.

## Publish the current HSA item

Open Parent Tools, choose the official HSA item, and save the generated `site-config.json` over `data/site-config.json`. You can also edit `data/site-config.json` directly and change `currentScheduleNumber`.

Use the sequence number from `data/curriculum.json`. For example:

- `1` means Lesson 1: The Alphabet.
- `6` means Lesson 4: Subject Pronouns.
- `9` means Lesson 5: Origin and Nationality.
