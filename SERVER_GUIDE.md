# Server Guide

This site is a static website. The local server is only for previewing it on your computer before publishing.

## Start the preview

1. Open Terminal.
2. Go to the site folder:

```sh
cd /Users/leopardden/Documents/Codex/2026-08-02/referenced-chatgpt-conversation-this-is-an/outputs/spanish-learning-site
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

- `materials/all-kids/class-01/`
- `materials/all-kids/class-02/`
- `materials/all-kids/class-03/`
- `materials/all-kids/class-04/`
- `materials/all-kids/class-05/`

Use `materials/child-1/` or `materials/child-2/` only when homework is different for each child.

After files are added, open `admin.html`, create a catalog entry, and paste it into `data/materials.json`.
