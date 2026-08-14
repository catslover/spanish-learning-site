# Spanish Supplement Flashcard Design

Status: approved recurring design rules.

## Role In The Curriculum

Flashcards are a recurring learning layer across Spanish I.

```text
Unit lesson
↓
Student notes / PDF
↓
Web lesson
↓
Flashcards
↓
Audio + visual memory support
```

Flashcards should not duplicate the full HSA vocabulary list. They should reinforce:

- pronunciation
- high-frequency words
- patterns
- communication chunks

## Image Philosophy

Not every card needs an image. Too many images become distracting.

Use images when they add:

- memory connection
- humor
- emotional engagement
- cultural connection

Do not use images for:

- abstract sounds
- grammar rules
- every vocabulary item

Target ratio:

- 60-70% clean audio/text cards
- 30-40% illustrated cards

## Card Types

### Type 1: Sound Recognition

Purpose: connect a sound to a stable pronunciation memory.

Example front:

```text
A

[play] Listen
```

Example back:

```text
a

Sound: open, clear vowel

Examples:
casa
house

mapa
map
```

Image: no image needed.

### Type 2: Word + Meaning

Purpose: connect a useful word to meaning, pronunciation, and one example.

Example front:

```text
casa

[play]
```

Example back:

```text
casa
house

Example:
Mi casa es grande.
My house is big.
```

Image: optional when the image makes the word memorable.

### Type 3: Pronunciation Pattern

Purpose: connect a high-value sound pattern to examples.

Example:

```text
Ñ
niño [play]
```

Back:

```text
niño
boy / child

Pronunciation:
ñ = special Spanish sound

Example:
El niño juega hockey.
The boy plays hockey.
```

Image: useful when tied to Victor and Spencer's interests, such as hockey.

### Type 4: Minimal Pair

Purpose: distinguish close sounds or patterns.

Examples:

- `pero`: but; single tap r; no image needed.
- `perro`: dog; rolled rr; image recommended.

### Type 5: Tricky Alphabet

Purpose: reinforce only high-value or surprising letters.

Examples:

- `J`: jota; example `José`.
- `Ñ`: eñe; memorable illustrated character recommended.

Do not create an illustrated card for every letter.

### Type 6: Conversation Chunk

Purpose: practice communication rather than isolated vocabulary.

Example front:

```text
¿Cómo se escribe?

[play]
```

Back:

```text
How do you spell it?

Example:
¿Cómo se escribe tu nombre?
How do you spell your name?
```

Image: optional, such as a pencil or speech bubble.

## Data Shape

Each flashcard should support:

```yaml
front:
  spanish:
  audio:
  image_optional:

back:
  english:
  example_sentence:
  example_audio:
  note:
```

Structured content should keep Spanish and English separate for future display toggles.

## Design Style

Use modern language learning with gentle illustration:

- friendly but not childish
- clear enough for quick review
- polished enough for a real course
- compatible with printable or Kindle-friendly derivatives

Avoid:

- cartoon overload
- random clipart
- stock-photo clutter
- image decoration that does not improve memory
