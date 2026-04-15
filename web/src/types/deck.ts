/**
 * Deck data shape — mirrors backend/app/deck/schema.py
 *
 * If you change any field here, the Python backend must update to match
 * (and vice versa). This file is half of the Ai-Smeta contract.
 */

export type BilingualText = { ru: string; en: string; ky?: string };

export type ImageCredit = {
  file: string;
  source: string;
  author: string;
  license: string;
  url?: string | null;
};

export type DeckInfoCard = {
  icon: string;
  label: BilingualText;
  value: BilingualText;
};

export type DeckCover = {
  title: BilingualText;
  subtitle: BilingualText;
  hero_image?: string | null;
  info_cards: DeckInfoCard[];
};

export type DeckProblem = {
  title: BilingualText;
  hero_image?: string | null;
  points: BilingualText[];
};

export type DeckVision = {
  title: BilingualText;
  body: BilingualText;
  hero_image?: string | null;
  bullets: BilingualText[];
};

export type DeckMap = {
  title: BilingualText;
  caption: BilingualText;
  map_image?: string | null;
  hero_image?: string | null;
};

export type DeckPPP = {
  title: BilingualText;
  legal_basis: BilingualText;
  state_obligations: BilingualText[];
  investor_obligations: BilingualText[];
};

export type DeckItem = {
  slug: string;
  name: BilingualText;
  concept_tag: BilingualText;
  hero_image?: string | null;
  tagline: BilingualText;
  investment_usd: string;
  annual_revenue_usd?: string | null;
  payback_years?: string | null;
  key_infrastructure: BilingualText[];
  revenue_mix: BilingualText[];
  target_segment: BilingualText;
  differentiator: BilingualText;
};

export type MatrixDot = {
  item_slug: string;
  x: number;
  y: number;
};

export type StrategicMatrix = {
  title: BilingualText;
  subtitle?: BilingualText | null;
  x_label: BilingualText;
  y_label: BilingualText;
  quadrant_tl?: BilingualText | null;
  quadrant_tr?: BilingualText | null;
  quadrant_bl?: BilingualText | null;
  quadrant_br?: BilingualText | null;
  dots: MatrixDot[];
  takeaway?: BilingualText | null;
};

export type FinancialRow = {
  item_slug: string;
  investment: string;
  revenue?: string | null;
  payback?: string | null;
};

export type FinancialSummary = {
  title: BilingualText;
  total_investment: string;
  blended_payback: string;
  currency_note: BilingualText;
  items_breakdown: FinancialRow[];
};

export type RoadmapPhase = {
  phase_number: number;
  name: BilingualText;
  duration: BilingualText;
  deliverables: BilingualText[];
};

export type DeckRoadmap = {
  title: BilingualText;
  phases: RoadmapPhase[];
};

export type DeckTeam = {
  title: BilingualText;
  entities: BilingualText[];
  note?: BilingualText | null;
};

export type DeckAsk = {
  title: BilingualText;
  headline: BilingualText;
  supporting_points: BilingualText[];
  contact?: BilingualText | null;
};

export type DeckData = {
  project_slug: string;
  language_primary: "ru" | "ky" | "en";
  language_secondary: "ru" | "ky" | "en";
  cover: DeckCover;
  problem: DeckProblem | null;
  vision: DeckVision;
  map_slide: DeckMap | null;
  ppp_model: DeckPPP | null;
  items: DeckItem[];
  strategic_matrix: StrategicMatrix | null;
  financial_summary: FinancialSummary;
  roadmap: DeckRoadmap;
  team: DeckTeam | null;
  ask: DeckAsk;
  image_credits: ImageCredit[];
};
