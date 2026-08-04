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

Use the folders already prepared for the first four classes:

- `materials/child-1/class-01/`
- `materials/child-1/class-02/`
- `materials/child-1/class-03/`
- `materials/child-1/class-04/`
- `materials/child-2/class-01/`
- `materials/child-2/class-02/`
- `materials/child-2/class-03/`
- `materials/child-2/class-04/`

After files are added, open `admin.html`, create a catalog entry, and paste it into `data/materials.json`.
