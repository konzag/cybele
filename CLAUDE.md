# Cybele — Claude Context

## Project
Colorful early-learning browser and terminal games for Cybele (3 years old).
HTML + CSS + JS (browser) + Python (terminal). Served by the family games hub «Τα Παιχνίδια μας» (konzag/games-hub)
at `/cybele/`; GitHub Pages is closed (2026-10-14).
Φτιαγμένο με αγάπη από τον νονό της.

## Live Site
https://public.tailc01d70.ts.net/cybele/ (games-hub over Tailscale Funnel; the hub pins a commit of this repo)

## Standard
This repo follows **GAME-STANDARD v1 §9** (the old games get the shell only; they are not rewritten):
https://github.com/konzag/games-template/blob/main/GAME-STANDARD.md (copy: konzag/games-hub `docs/GAME-STANDARD.md`).
- `assets/hub-shell.js` is the hub shell (🏠 back to `/`, 🔊 sound on/off, its own key `game.<repo>.sound`).
  Load it FIRST on every HTML page (`tests/hub-shell.test.mjs` checks it).
- No external resources (no Google Fonts, no CDN). The font comes from the hub: `/static/fonts/comfortaa.css`.
- The hub serves every page with a strict CSP: inline `onclick="…"` still works here (the hub hashes it), but new
  code uses `addEventListener`. No `eval`, no network calls.

## Stack
- index.html: Demon-hunting game (tap emoji demons, colors + numbers in Greek, day/night mode)
- cybele.py: Python terminal program (Windows, colorama + winsound)
- No backend, no deploy pipeline, no database

## Rules
- Flow: feature branch → PR to `staging` → release PR `staging → main` (owner GO); the hub then bumps its submodule
- All content in Greek
- Keep age-appropriate: 3 years old (νηπιαγωγείο), demon-hunting theme (cute, never scary)
- Big buttons for small fingers
- Sounds via Web Audio API (no external files)
- Never add server-side code or dependencies requiring installation
