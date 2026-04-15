# Deck generator

Turn project documents (business plans, briefs, notes) into a bilingual RU+EN presentation.

## TL;DR for non-technical users

1. Put all your project documents (`.docx` or `.txt`) into one folder, e.g. `MyProject/`.
2. One-time setup (only the first time):
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env      # fill in ANTHROPIC_API_KEY
   ```
3. From the repo root, run:
   ```bash
   ./make_deck.sh MyProject
   ```
4. Open the result:
   ```bash
   open MyProject/presentation.html
   ```

That's it. You get a 15+ slide bilingual presentation, exportable to PDF via the browser's Print → Save as PDF.

## What the script does

```
your docs (.docx)  ──▶  ingest.py  ──▶  data/deck.json  ──▶  render.py  ──▶  presentation.html
                       (Claude AI)                           (Jinja2 template)
```

1. **ingest** — Claude Sonnet 4.6 reads all your documents, extracts project data (ports, numbers, roadmap, etc.), translates everything RU↔EN, and emits `data/deck.json`.
2. **render** — A Jinja2 template fills in the JSON and writes a self-contained HTML file styled like the Crystal Diving deck.

## Reviewing the output

Before showing the deck to an investor, **always review `data/deck.json`**. Claude tries not to invent numbers, but:

- Any number you see in the deck should be traceable to your source documents.
- Edit `deck.json` by hand to fix mistakes, then re-run only the render step (no Claude call, no API cost):
  ```bash
  python3 -m app.deck.generate --data MyProject/data/deck.json --out MyProject/presentation.html
  ```

## Editing the template visuals

The visual design lives in one file: `backend/app/deck/templates/crystal_diving.html.j2`. It's HTML + CSS + Jinja2 loops. To create a second template (say, for a different client's brand), copy the file to `<new_name>.html.j2`, change the colors / fonts / layout, and pass `--template <new_name>` to the CLI.

## Editing the Claude ingest prompt

If Claude misreads something consistently (wrong field, wrong translation style), edit `backend/app/deck/prompts.py`. The prompt is in one place so domain experts can refine it without touching Python.

## Troubleshooting

- **"No readable .docx/.txt files"** — put at least one `.docx` or `.txt` in the project folder before running.
- **Schema validation errors** — the JSON Claude returned doesn't match the expected shape. The error will print the raw payload; usually you can fix it by editing the prompt in `prompts.py`.
- **Numbers look wrong in the deck** — do not trust raw Claude output for investor-facing material. Always review `data/deck.json` and edit by hand if needed.

## Files

```
backend/app/deck/
  schema.py                 # Pydantic models — the common vocabulary
  prompts.py                # Claude ingest system prompt (edit to steer behavior)
  ingest.py                 # docx → Claude → DeckData
  render.py                 # DeckData → HTML via Jinja2
  generate.py               # CLI: render from JSON
  templates/
    crystal_diving.html.j2  # the Crystal Diving visual style
  examples/
    hotel_pair.json         # 2-item smoke-test project
    hotel_pair.html         # rendered smoke test
```
