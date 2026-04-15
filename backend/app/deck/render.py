"""Render a DeckData instance to HTML using a Jinja2 template.

Templates live in backend/app/deck/templates/ as .html.j2 files. Current templates:
  - crystal_diving  — photo-forward, deep blue/teal, premium travel aesthetic

To add a new template: drop a new `<name>.html.j2` in the templates/ folder. No other
changes needed — `render_deck(deck, template_name="<name>")` finds it automatically.
"""
from __future__ import annotations

import json
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .schema import DeckData

_TEMPLATES_DIR = Path(__file__).parent / "templates"

_env = Environment(
    loader=FileSystemLoader(_TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml", "j2"]),
    trim_blocks=True,
    lstrip_blocks=True,
)


def render_deck(deck: DeckData, template_name: str = "crystal_diving") -> str:
    template = _env.get_template(f"{template_name}.html.j2")
    return template.render(deck=deck)


def render_from_json_file(json_path: Path, template_name: str = "crystal_diving") -> str:
    data = json.loads(json_path.read_text(encoding="utf-8"))
    deck = DeckData.model_validate(data)
    return render_deck(deck, template_name)
