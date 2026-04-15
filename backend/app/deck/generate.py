"""CLI entrypoint: render a deck from a JSON file to HTML.

Usage:
    python -m app.deck.generate --data Karakol/data/deck.json --out Karakol/presentation.html
    python -m app.deck.generate --data some/path.json --template crystal_diving --out out.html

For a full pipeline (ingest raw docs → render), use make_deck.sh which chains
ingest.py and generate.py.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from .render import render_from_json_file


def main() -> None:
    parser = argparse.ArgumentParser(description="Render a DeckData JSON to HTML")
    parser.add_argument("--data", type=Path, required=True, help="Path to deck.json")
    parser.add_argument(
        "--template",
        default="crystal_diving",
        help="Template name (file in backend/app/deck/templates/<name>.html.j2)",
    )
    parser.add_argument("--out", type=Path, required=True, help="Output .html path")
    args = parser.parse_args()

    html = render_from_json_file(args.data, args.template)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(html, encoding="utf-8")
    print(f"✓ {args.data} → {args.out}")


if __name__ == "__main__":
    main()
