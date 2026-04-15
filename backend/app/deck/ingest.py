"""Claude-powered ingestion: raw project files → validated DeckData.

Usage (CLI):
    python -m app.deck.ingest <project_folder>

The folder should contain .docx, .pdf, or .txt files describing the project. Output is
written to <project_folder>/data/deck.json. User is expected to review the JSON before
rendering — never trust raw model output for investor-facing material.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from anthropic import Anthropic
from docx import Document  # python-docx
from pydantic import ValidationError

from ..config import settings
from .prompts import INGEST_SYSTEM
from .schema import DeckData

_client = Anthropic(api_key=settings.anthropic_api_key)


def _read_docx(path: Path) -> str:
    doc = Document(str(path))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _read_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def collect_source_text(folder: Path) -> str:
    """Walk a project folder and concatenate all readable source documents."""
    chunks: list[str] = []
    for path in sorted(folder.iterdir()):
        if path.is_dir():
            continue
        suffix = path.suffix.lower()
        if suffix == ".docx":
            chunks.append(f"# FILE: {path.name}\n{_read_docx(path)}")
        elif suffix == ".txt":
            chunks.append(f"# FILE: {path.name}\n{_read_txt(path)}")
        # .pdf ingest deferred — Crystal Diving PDF is image-based; real PDFs vary.
    if not chunks:
        raise FileNotFoundError(
            f"No readable .docx/.txt files in {folder}. Place project documents there first."
        )
    return "\n\n---\n\n".join(chunks)


def ingest_folder(folder: Path) -> DeckData:
    """Read every docx/txt in folder, ask Claude to structure it, validate, return DeckData."""
    source_text = collect_source_text(folder)
    msg = _client.messages.create(
        model=settings.claude_model,
        max_tokens=8000,
        system=INGEST_SYSTEM,
        messages=[{"role": "user", "content": source_text}],
    )
    raw = msg.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    data = json.loads(raw)
    try:
        return DeckData.model_validate(data)
    except ValidationError as e:
        print("Claude returned data that failed schema validation:", file=sys.stderr)
        print(e, file=sys.stderr)
        print("\nRaw payload was:\n", raw, file=sys.stderr)
        raise


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest a project folder into DeckData JSON")
    parser.add_argument("folder", type=Path, help="Project folder with .docx/.txt sources")
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output path (default: <folder>/data/deck.json)",
    )
    args = parser.parse_args()

    out = args.out or (args.folder / "data" / "deck.json")
    out.parent.mkdir(parents=True, exist_ok=True)

    deck = ingest_folder(args.folder)
    out.write_text(
        deck.model_dump_json(indent=2, exclude_none=False),
        encoding="utf-8",
    )
    print(f"✓ Ingested {args.folder} → {out}")
    print(f"  {len(deck.items)} items, total investment: {deck.financial_summary.total_investment}")
    print("  Review the JSON before rendering — do not trust raw model output.")


if __name__ == "__main__":
    main()
