# Ai-Smeta

**One tool for builders' two bottlenecks: construction estimates (Smeta) and investor pitch decks.**

Built for construction firms in the CIS region (initial market: Kyrgyzstan + Russia) who spend weeks manually preparing the same two documents over and over — cost estimates for internal use, and pitch decks for investors and regional governments.

## Live demo

The first real deck — **Issyk-Kul Water Route 2026** (6 ports · 17 slides · RU+EN bilingual) — renders at the root URL of any Vercel deployment of this repo. Navigation: ← → arrow keys, or tap **PDF** to export.

## The wedge

Construction firms in Central Asia live with two paper-based bottlenecks:

1. **Smeta** (internal cost estimate) — a foreman records a voice note or sends a sketch, and an estimator turns it into a line-itemed budget over 1–3 days.
2. **Investor pitch deck** — a partner hand-builds a 15–20 slide PowerPoint every time a new investor, development bank, or regional governor shows interest. Also 1–3 days per deck.

Ai-Smeta compresses both to minutes. Same voice notes, same client docs, same rate database — two different outputs.

## What's in this repo

```
backend/
  app/
    agent.py              Claude Smeta agent (transcript → structured Smeta)
    bot.py                Telegram bot (voice → confirm → Smeta → approve)
    transcribe.py         Whisper API wrapper (RU + KG code-switching)
    db.py                 Postgres helpers (no ORM)
    prompts.py            Smeta system prompt (domain-expert editable)
    config.py, main.py

    deck/                 Pitch-deck generator — module 2
      schema.py           Pydantic data models (bilingual RU/EN)
      prompts.py          Claude ingest prompt (docx → DeckData JSON)
      ingest.py           Reads raw .docx → Claude → validated JSON
      render.py           DeckData → HTML via Jinja2
      generate.py         CLI entrypoint
      templates/
        crystal_diving.html.j2    Cream + gold McKinsey-style visual template
      examples/
        hotel_pair.json   Minimal 2-item smoke-test project
      README.md           How-to for non-technical users

db/schema.sql             Supabase/Postgres schema
docs/                     Architecture + week-1 plan

Karakol/                  First real deck: 6-port Issyk-Kul plan
  data/deck.json          Structured deck content (bilingual)
  images/*.jpg            Wikimedia Commons CC-licensed photography
  presentation.html       Rendered 17-slide bilingual deck
  (.docx sources and third-party PDF excluded — see .gitignore)

make_deck.sh              End-to-end wrapper: ingest → render
index.html                Root redirect to Karakol/presentation.html (for Vercel)
```

## Architecture snapshot

```
    ┌────────────────────────────────────┐
    │     Supabase (shared backend)      │
    │  Auth · Postgres · Storage         │
    └───────┬───────────────────┬────────┘
            │                   │
      ┌─────▼─────┐       ┌─────▼──────┐
      │ Telegram  │       │  Web app   │
      │    bot    │       │  (Next.js, │
      │ (foremen) │       │   later)   │
      └───────────┘       └────────────┘
            │                   │
            └─────────┬─────────┘
                      │
            ┌─────────▼─────────┐
            │ Claude Sonnet 4.6 │
            │  OpenAI Whisper   │
            └───────────────────┘
```

**Telegram is the v1 distribution surface.** CIS construction already lives there — no app-store friction, works on every phone already on site. The web app comes later for heavier review work (editing Smeta line items, previewing decks).

## Running the deck generator locally

One-time setup:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # fill in ANTHROPIC_API_KEY
```

Generate a deck from a project folder:

```bash
./make_deck.sh Karakol
open Karakol/presentation.html
```

Or render from an already-authored `data/deck.json` (no Claude call, no API cost):

```bash
cd backend
python3 -m app.deck.generate \
  --data ../Karakol/data/deck.json \
  --template crystal_diving \
  --out ../Karakol/presentation.html
```

The generated HTML is self-contained and exports cleanly to PDF via the browser's Print → Save as PDF.

## Deployment

This repo deploys to **Vercel** as a static site with zero configuration:

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. No build command, no output directory — it's static HTML
3. Vercel serves `index.html` at the root, which redirects to `Karakol/presentation.html`
4. Relative image paths (`images/cover.jpg`) resolve inside the `Karakol/` folder

The Telegram bot and the (future) web app are separate deployments, each backed by Supabase.

## Status

- ✅ Deck generator end-to-end (schema → ingest → Jinja2 template → HTML)
- ✅ First real deck: **Issyk-Kul Water Route 2026** — 17 slides, bilingual RU+EN
- ✅ Crystal Diving visual system matched (cream + gold + ornamental borders + gold takeaway footer bars)
- 🚧 Smeta Telegram bot scaffolded — blocked on API keys
- 📋 Web app not started — Next.js + Supabase auth planned

## License

MIT for the code. Images in `Karakol/images/` are Wikimedia Commons under their respective Creative Commons licenses; attribution is included in the rendered deck's credits slide.
