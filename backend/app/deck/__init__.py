"""Deck generator — turns structured project data into presentation HTML (and optionally .pptx).

Pipeline:
  raw files (.docx, .pdf, .txt)
       │
       ▼
  ingest.py  ── Claude Sonnet 4.6 ──▶  DeckData (schema.py, RU+EN)
       │
       ▼
  render.py  ── Jinja2 + template.j2 ──▶  presentation.html
       │
       ▼ (optional)
  to_pptx.py ── python-pptx ──▶  presentation.pptx

The template is the only visually-styled artifact. Swap templates to change look.
"""
