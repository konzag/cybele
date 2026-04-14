# cybele

## What is this
A demon-hunting game built for Cybele (age 3, kindergarten), by her godfather.
Cute, colorful, never scary. Two standalone programs.

## Files
- `index.html` — Browser game (demon catching, colors & numbers, day/night mode, confetti)
- `cybele.py` — Terminal game for Windows (5 mini-games: demon hunt, colors, numbers, melody, farewell)

## Stack
- HTML + CSS + JavaScript (vanilla, no frameworks, no build step)
- Python 3 (colorama optional, winsound built-in Windows)

## How to run
```bash
# Browser app — just double-click index.html
# Terminal app
pip install colorama   # optional
python cybele.py
```

## Key facts
- Target user: Cybele, age 3
- Language: Greek UI throughout
- No backend, no database, no deployment
- Repo: konzag/cybele
- `.claude/` folder exists at repo root with Claude Code settings

## Notes for Claude Code
- Keep all UI text in Greek
- Demon theme must stay cute and non-scary (ages 3)
- Large buttons for small fingers (mobile/tablet first)
- colorama import must have graceful fallback
- winsound is Windows-only — terminal app targets Windows only
