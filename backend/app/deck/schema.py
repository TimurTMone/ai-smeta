"""Deck data schema — the common vocabulary between content, ingest, and templates.

All text fields are bilingual (RU + EN). Templates render RU as primary and EN as subtitle.
Financial fields are kept as strings (not floats) because source docs often give ranges
("$25M–$35M") and rounding / invented precision would harm credibility with investors.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class BilingualText(BaseModel):
    """A piece of text with Russian primary and English subtitle."""
    ru: str
    en: str


class InfoCard(BaseModel):
    """Icon + label + value — the recurring info-card pattern on the Crystal Diving cover."""
    icon: str  # emoji or short icon name, e.g. "📍", "💰", "⏱"
    label: BilingualText
    value: BilingualText


class Cover(BaseModel):
    title: BilingualText
    subtitle: BilingualText
    hero_image: Optional[str] = None  # path or URL; None → template uses gradient fallback
    info_cards: list[InfoCard] = Field(default_factory=list)


class VisionSlide(BaseModel):
    title: BilingualText
    body: BilingualText
    bullets: list[BilingualText] = Field(default_factory=list)
    hero_image: Optional[str] = None


class ProblemSlide(BaseModel):
    title: BilingualText
    points: list[BilingualText]
    hero_image: Optional[str] = None


class MapSlide(BaseModel):
    """Map overview of all items with annotations."""
    title: BilingualText
    caption: BilingualText
    map_image: Optional[str] = None
    hero_image: Optional[str] = None


class ImageCredit(BaseModel):
    """Attribution entry for a CC-licensed image — shown in a credits footer."""
    file: str  # e.g. "cover.jpg"
    source: str  # "Wikimedia Commons"
    author: str
    license: str  # "CC BY-SA 2.0"
    url: Optional[str] = None


class MatrixDot(BaseModel):
    """A single item's position on the 2x2 strategic matrix."""
    item_slug: str  # references Item.slug
    x: float  # 0-100 on x-axis (e.g. capex: 0=low, 100=high)
    y: float  # 0-100 on y-axis (e.g. premium level: 0=mass, 100=ultra)


class StrategicMatrix(BaseModel):
    """Classic McKinsey 2x2 positioning matrix. Axes + quadrant labels + item dots."""
    title: BilingualText
    subtitle: Optional[BilingualText] = None
    x_label: BilingualText
    y_label: BilingualText
    quadrant_tl: Optional[BilingualText] = None  # top-left
    quadrant_tr: Optional[BilingualText] = None  # top-right (usually the sweet spot)
    quadrant_bl: Optional[BilingualText] = None  # bottom-left
    quadrant_br: Optional[BilingualText] = None  # bottom-right
    dots: list[MatrixDot]
    takeaway: Optional[BilingualText] = None  # the one-line "so what"


class Item(BaseModel):
    """A port / sub-project / initiative — the repeating unit of the deck."""
    slug: str  # machine id, e.g. "karakol", "balykchy"
    name: BilingualText  # "Порт Каракол" / "Karakol Port"
    concept_tag: BilingualText  # "Eco-Adventure" / "Эко-приключение"
    tagline: BilingualText  # one-line pitch
    hero_image: Optional[str] = None
    investment_usd: str  # e.g. "$4M–$6M" — keep string, source phrasing preserved
    annual_revenue_usd: Optional[str] = None
    payback_years: Optional[str] = None
    key_infrastructure: list[BilingualText] = Field(default_factory=list)
    revenue_mix: list[BilingualText] = Field(default_factory=list)  # "Eco-hotels 50%", etc.
    target_segment: BilingualText
    differentiator: BilingualText  # what makes this item special vs others


class FinancialSummary(BaseModel):
    title: BilingualText
    total_investment: str  # "$25M–$35M"
    blended_payback: str  # "5–7 years"
    currency_note: BilingualText  # "USD. Нумерация согласно ..." / "USD. Figures per..."
    items_breakdown: list["FinancialRow"] = Field(default_factory=list)


class FinancialRow(BaseModel):
    item_slug: str  # references Item.slug
    investment: str
    revenue: Optional[str] = None
    payback: Optional[str] = None


class RoadmapPhase(BaseModel):
    phase_number: int
    name: BilingualText
    duration: BilingualText  # "Q1 2026 – Q3 2026"
    deliverables: list[BilingualText]


class Roadmap(BaseModel):
    title: BilingualText
    phases: list[RoadmapPhase]


class TeamSlide(BaseModel):
    title: BilingualText
    entities: list[BilingualText]  # "Правительство Иссык-Кульской области" / "Gov of Issyk-Kul oblast"
    note: Optional[BilingualText] = None


class Ask(BaseModel):
    title: BilingualText
    headline: BilingualText  # the single sentence "ask"
    supporting_points: list[BilingualText] = Field(default_factory=list)
    contact: Optional[BilingualText] = None


class PPPModel(BaseModel):
    """Public-Private Partnership framework slide."""
    title: BilingualText
    legal_basis: BilingualText
    state_obligations: list[BilingualText]
    investor_obligations: list[BilingualText]


class DeckData(BaseModel):
    """Top-level deck document. Templates read this structure."""
    project_slug: str  # e.g. "karakol-ports"
    language_primary: str = "ru"
    language_secondary: str = "en"
    cover: Cover
    problem: Optional[ProblemSlide] = None
    vision: VisionSlide
    map_slide: Optional[MapSlide] = None
    ppp_model: Optional[PPPModel] = None
    items: list[Item]
    strategic_matrix: Optional[StrategicMatrix] = None
    financial_summary: FinancialSummary
    roadmap: Roadmap
    team: Optional[TeamSlide] = None
    ask: Ask
    image_credits: list[ImageCredit] = Field(default_factory=list)
