# U1.1 Pronunciation Workshop Audio Specification

Status: implemented with local `.m4a` lesson audio files.

## Principle

Audio is embedded learning media, not a separate resource.

The lesson page should not say "Listen on Website" as a substitute for audio controls. Instead, every listening target should have an adjacent play button.

Printable PDFs should show "Listen on website" markers because the PDF cannot contain interactive audio.

## Section 1: Spanish Vowels

Create five independent vowel sound audio buttons, plus one button for each example word.

### A

Audio items:

- `a`
- `mamá`
- `casa`
- `gracias`

Website layout:

```text
A

[play] a

Examples:
mamá [play]
casa [play]
gracias [play]
```

### E

Audio items:

- `e`
- `mesa`
- `Elena`
- `tres`

Website layout:

```text
E

[play] e

Examples:
mesa [play]
Elena [play]
tres [play]
```

### I

Audio items:

- `i`
- `mi`
- `familia`
- `sí`

Website layout:

```text
I

[play] i

Examples:
mi [play]
familia [play]
sí [play]
```

### O

Audio items:

- `o`
- `hola`
- `dos`
- `profesor`

Website layout:

```text
O

[play] o

Examples:
hola [play]
dos [play]
profesor [play]
```

### U

Audio items:

- `u`
- `tú`
- `uno`
- `mucho`

Website layout:

```text
U

[play] u

Examples:
tú [play]
uno [play]
mucho [play]
```

## Section 2: High-Value Pronunciation Patterns

Every practice word gets its own audio.

### ñ

- `niño`
- `español`
- `mañana`
- `señor`

### j / ge / gi

- `José`
- `gente`
- `gigante`

### Silent h

- `hola`
- `hermano`
- `ahora`

### ll / y

- `yo`
- `llamo`
- `familia`

### r / rr

- `pero`
- `perro`
- `gracias`

### qu

- `que`
- `quiero`
- `quince`

### gue / gui

- `Miguel`
- `guitarra`
- `guerra`

### ce / ci / z

- `gracias`
- `cinco`
- `zapato`

## Audio Quality Rules

Use one consistent native speaker voice:

- natural Spanish pronunciation
- clear learner speed
- not exaggerated
- not robotic
- regional variation explained separately

## Repository Structure

Recommended asset layout:

```text
media/
└── u1-1-pronunciation/
    ├── vowels/
    │   ├── a.m4a
    │   ├── e.m4a
    │   ├── i.m4a
    │   ├── o.m4a
    │   └── u.m4a
    ├── vowel-words/
    │   ├── mama.m4a
    │   ├── casa.m4a
    │   ├── gracias.m4a
    │   └── ...
    └── patterns/
        ├── n-tilde/
        ├── jota/
        ├── silent-h/
        ├── ll-y/
        ├── r-rr/
        ├── que/
        ├── gue-gui/
        └── ce-ci-z/
```

## Implementation Notes

- The current website lesson uses local `.m4a` files generated with the Paulina Spanish voice.
- Browser Spanish speech synthesis remains as a fallback if a media file cannot be played.
- The printable packet should point learners back to the website wherever audio is required.
