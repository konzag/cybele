# Cybele — Claude Context

## Project
Colorful early-learning browser and terminal games for Cybele (3 years old).
HTML + CSS + JS (browser) + Python (terminal). Public GitHub Pages site.
Φτιαγμένο με αγάπη από τον νονό της.

## Live Site
https://konzag.github.io/cybele/

## Stack
- index.html: Demon-hunting game (tap emoji demons, colors + numbers in Greek, day/night mode)
  and a "sticker book" (every caught demon sticks into a 50-slot grid, kept across visits)
- assets/storage.js: `CybeleStorage` (readJson/writeJson/getStickers/addSticker/clearStickers),
  the ONLY code that touches localStorage (try/catch wrapped)
- assets/fonts/: self-hosted Comfortaa 700 + Didact Gothic 400 (greek + latin woff2, from
  @fontsource 5.3.0) with their OFL licences; never load fonts from Google
- Look: "Crayon Sticker Book" (paper #FFF8E7, ink #2B2D42, 4px outlines, tomato/sunflower/grass/sky/plum);
  night mode #12355B with a warm torch
- tests/site-smoke.mjs (Node, no dependencies) + .github/workflows/test.yml (also `py_compile cybele.py`)
- cybele.py: Python terminal program (Windows, colorama + winsound)
- No backend, no deploy pipeline, no database

## Rules
- No auto-deploy needed (GitHub Pages serves static files automatically)
- All content in Greek
- Keep age-appropriate: 3 years old (νηπιαγωγείο), demon-hunting theme (cute, never scary)
- Big buttons for small fingers
- Sounds via Web Audio API (no external files)
- Never add server-side code or dependencies requiring installation
- Respect `prefers-reduced-motion` (no confetti/sparkles/floating when set)
- Never build HTML from strings in `innerHTML`; use createElement + textContent
