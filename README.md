# Ai-Smeta

**One tool for builders' two bottlenecks: construction estimates (Smeta) and investor pitch decks.**

Built for construction firms in the CIS region (initial market: Kyrgyzstan + Russia) who spend weeks manually preparing the same two documents over and over — cost estimates for internal use, and pitch decks for investors and regional governments.

## Live demo

The **Next.js web platform** (`/web`) includes:
- Marketing site at `/` with hero + features + demo + pricing
- Authenticated user app: dashboard, projects, deck editor, Smeta editor, settings
- Admin panel: users, rates database, jobs, templates, logs
- 3-locale UI (Kyrgyz, Russian, English)
- The **Issyk-Kul Water Route 2026** deck embedded at `/ru/demo` and as seed data in the deck editor

The first real deck (6 ports · 17 slides · RU+EN bilingual) also renders standalone at `/demo-deck/presentation.html`. Navigation: ← → arrow keys, or tap **PDF** to export.

## The wedge

Construction firms in Central Asia live with two paper-based bottlenecks:

1. **Smeta** (internal cost estimate) — a foreman records a voice note or sends a sketch, and an estimator turns it into a line-itemed budget over 1–3 days.
2. **Investor pitch deck** — a partner hand-builds a 15–20 slide PowerPoint every time a new investor, development bank, or regional governor shows interest. Also 1–3 days per deck.

Ai-Smeta compresses both to minutes. Same voice notes, same client docs, same rate database — two different outputs.

## What's in this repo

```
web/                      Next.js 16 web platform — marketing + app + admin
  src/
    app/[locale]/         3-locale routing (ky/ru/en)
      (marketing)/        Public landing + pricing + demo
      (auth)/             Login + magic-link verify
      (app)/              Authenticated user workspace
      (admin)/            Admin panel (role=admin guarded)
    lib/api/              API facade (mock | real selector)
    types/                TypeScript contract (source of truth)
    lib/auth/             JWT helpers via jose
    components/ui/        CVA primitives (button, card, table, ...)
    i18n/                 ky/ru/en dictionaries
  docs/api-contract.md    Handoff doc for the backend teammate

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

### Next.js web app (`/web`) — recommended

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. **Root Directory: `web`**
3. Framework preset: Next.js (auto-detected)
4. Environment variables:
   - `JWT_SECRET` — generate with `openssl rand -base64 32`
   - `NEXT_PUBLIC_API_MODE=mock` (or `real` once backend is deployed)
5. Deploy → you'll get a URL like `https://ai-smeta.vercel.app`

The Karakol demo deck is included at `/demo-deck/presentation.html` (public static) and embedded via iframe at `/ru/demo`.

### Static-only demo (legacy)

If you prefer to deploy just the Karakol HTML deck without the full Next.js app, delete `web/` and set Root Directory to `/` — Vercel will serve the root `index.html` which redirects to `Karakol/presentation.html`.

## Status

- ✅ Deck generator end-to-end (schema → ingest → Jinja2 template → HTML)
- ✅ First real deck: **Issyk-Kul Water Route 2026** — 17 slides, bilingual RU+EN
- ✅ Crystal Diving visual system matched (cream + gold + ornamental borders + gold takeaway footer bars)
- ✅ **Next.js web platform v1** — marketing + app + admin with full mock backend
- ✅ API contract defined, backend handoff document ready (`docs/api-contract.md`)
- 🚧 Smeta Telegram bot scaffolded — blocked on API keys
- 📋 Real backend (FastAPI) — in teammate's hands, implements `web/src/lib/api/real/*.ts` stubs

## License

MIT for the code. Images in `Karakol/images/` are Wikimedia Commons under their respective Creative Commons licenses; attribution is included in the rendered deck's credits slide.
