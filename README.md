# ANTRONI — Brand Booklet

An interactive brand site for **ANTRONI 安窗义门窗**, a Shanghai maker of high-end
residential windows and doors. Three digital catalogues you can actually turn the
pages of, built on CSS 3D transforms — no WebGL, no canvas, no page-turn textures.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## The three publications

Each catalogue has its own aspect ratio, ground, voice and image set. No image is
shared between them, and no layout repeats within a book.

| | Ratio | Ground | Pages | Voice |
|---|---|---|---|---|
| **S+85** — ground-pivot door | 16:9 | `classic` bone | 9 | Measured, classical |
| **S150** — panoramic sliding door | 4:5 | `noir` chocolate | 8 | Editorial, warm |
| **CW** — curtain wall | 1:1 | `technical` cold grey | 9 | Drawing-office |

Below 820px every catalogue degrades to 3:4 and single-page mode.

## Chapters

1. **Principles** — design intent, with construction plates and specification rows
2. **Identity** — six logo directions, as real SVG
3. **Interface** — four phone screens as live DOM, including a working proportion tool
4. **Catalogues** — the three flip books

## How the page turn works

The book is real geometry, not a texture trick:

- each leaf hinges on `transform-origin` and rotates on `rotateY`
- forward turns hinge on the **left** edge, reverse turns on the **right**, so the
  two directions genuinely oppose each other — an echo of the ground-axis pivot
  the brand is built on
- depth is resolved on the Z axis, and `backface-visibility` swaps the front and
  reverse faces
- `filter` is deliberately **never** applied to `.book` — it collapses
  `transform-style: preserve-3d` to `flat` and kills the turn

Type is sized with container-query units against the page itself, so a page
scales with its own box rather than with the viewport.

## Verification scripts

Run the dev server first, then:

```bash
node verify2.mjs          # chapters, book switching, forward/reverse turn, wrap-around
node check-layouts.mjs    # asserts no layout variant repeats inside a book
node check-overflow.mjs   # 4 viewports x 3 books x every page: spill, clip, foot collision
node shoot.mjs            # flat-frame screenshots into shots3/
```

`check-overflow.mjs` flattens the 3D tilt before measuring — a rect read through
an active `perspective` is non-linear and reports phantom overflow. It also
checks **both** axes for clipping; a headline sliced by one lost letter is a
horizontal clip that a `scrollHeight`-only check never sees.

## Imagery

`public/images` — 24 generated plates, re-encoded to webp at 2400px / q82
(187MB → 1.97MB). `gen-b2.json` records the prompts they were generated from.