import type { BilingualText } from "./deck";

export type SmetaLineSource = "history" | "market" | "needs_clarification";

export type SmetaLineItem = {
  id: string;
  description: BilingualText;
  unit: string; // "м³", "т", "шт"
  qty: number;
  rate: number; // price per unit
  total: number; // computed (qty * rate)
  source: SmetaLineSource;
};

export type SmetaSection = {
  name: BilingualText;
  items: SmetaLineItem[];
};

export type SmetaCurrency = "KGS" | "RUB" | "USD";

export type Smeta = {
  id: string;
  project_id: string;
  region: string;
  currency: SmetaCurrency;
  sections: SmetaSection[];
  total: number;
  assumptions: string[];
  clarifying_questions: string[];
  status: "draft" | "approved";
  created_at: string;
};
