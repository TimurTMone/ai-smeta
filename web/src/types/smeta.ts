import type { BilingualText } from "./deck";

export type SmetaLineSource = "history" | "market" | "needs_clarification" | "ter" | "fer" | "gesn";

export type SmetaLineItem = {
  id: string;
  description: BilingualText;
  unit: string;              // "м³", "т", "шт", "м²", "п.м.", "компл."
  qty: number;
  // Cost breakdown per unit
  material_cost: number;     // material component per unit
  labor_cost: number;        // labor component per unit
  equipment_cost: number;    // equipment/machinery component per unit
  rate: number;              // total per unit = material + labor + equipment
  total: number;             // qty × rate
  // Waste
  waste_pct: number;         // e.g., 0.05 = 5%
  waste_amount: number;      // material_cost × qty × waste_pct
  // Source
  source: SmetaLineSource;
  norm_code: string | null;  // ТЕР/ФЕР/ГЭСН code, e.g., "ТЕР-01-01-003" or null
};

export type SmetaSection = {
  name: BilingualText;
  items: SmetaLineItem[];
  section_total: number;     // sum of all items.total in this section
};

export type SmetaCurrency = "KGS" | "RUB" | "USD";

export type SmetaMarkups = {
  overhead_pct: number;        // накладные расходы, 15-25%
  overhead_amount: number;
  profit_pct: number;          // сметная прибыль, 8-12%
  profit_amount: number;
  contingency_pct: number;     // непредвиденные, 3-10%
  contingency_amount: number;
  regional_coefficient: number; // КН коэффициент, 0.8-1.3
  regional_note: string;       // e.g., "Бишкек, зона 1, КН=1.0"
};

export type SmetaSummary = {
  materials_total: number;
  labor_total: number;
  equipment_total: number;
  waste_total: number;
  direct_cost: number;         // sum of all line items + waste
};

export type Smeta = {
  id: string;
  project_id: string;
  region: string;
  currency: SmetaCurrency;
  building_area_sqm: number | null;   // if known
  quality_tier: "economy" | "standard" | "premium" | null;
  sections: SmetaSection[];
  total: number;                      // backward compat — same as direct_cost or total_with_markups
  summary: SmetaSummary;
  markups: SmetaMarkups;
  direct_cost: number;                // before markups
  total_with_markups: number;         // THE number clients look at
  cost_per_sqm: number | null;        // total_with_markups / building_area_sqm
  assumptions: string[];
  clarifying_questions: string[];
  norms_referenced: string[];         // list of ТЕР/ФЕР/ГЭСН codes used
  status: "draft" | "approved";
  created_at: string;
};
