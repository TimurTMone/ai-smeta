#!/usr/bin/env bash
# make_deck.sh — turn a folder of project documents into a presentation.
#
# Usage:
#   ./make_deck.sh <project_folder>
#
# The folder should contain:
#   - .docx / .txt files describing the project (at least one)
#   - optional: a sub-folder template_pages/ with PNG exports of a reference deck
#
# Output (written into the same folder):
#   - data/deck.json         — structured deck data (review this before it goes to an investor)
#   - presentation.html      — the rendered bilingual RU+EN slide deck
#
# Steps:
#   1. ingest  — Claude reads the docs and emits structured deck.json
#   2. render  — Jinja2 template fills in and writes presentation.html
#
# Requirements (one-time setup):
#   cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
#   Set ANTHROPIC_API_KEY in backend/.env (copy from .env.example)

set -euo pipefail

PROJECT_DIR="${1:-}"
if [[ -z "$PROJECT_DIR" ]]; then
  echo "Usage: $0 <project_folder>" >&2
  echo "Example: $0 Karakol" >&2
  exit 1
fi

if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "Error: $PROJECT_DIR is not a directory" >&2
  exit 1
fi

ABSDIR="$(cd "$PROJECT_DIR" && pwd)"
cd "$(dirname "$0")/backend"

echo "→ Ingesting $ABSDIR ..."
python3 -m app.deck.ingest "$ABSDIR"

echo "→ Rendering presentation.html ..."
python3 -m app.deck.generate \
  --data "$ABSDIR/data/deck.json" \
  --out "$ABSDIR/presentation.html" \
  --template crystal_diving

echo ""
echo "✓ Done."
echo "  Review:  $ABSDIR/data/deck.json"
echo "  Open:    open $ABSDIR/presentation.html"
echo ""
echo "Tip: edit deck.json by hand to fix any numbers, then re-run just the render step:"
echo "  python3 -m app.deck.generate --data $ABSDIR/data/deck.json --out $ABSDIR/presentation.html"
