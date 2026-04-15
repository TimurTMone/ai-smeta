/**
 * API contract — the source of truth for every data shape that crosses
 * the frontend / backend boundary.
 *
 * Both the mock implementation (`lib/api/mock/*.ts`) and the real one
 * (`lib/api/real/*.ts`) must honor these types exactly. When the backend
 * teammate implements FastAPI endpoints, they must return JSON that matches
 * these shapes verbatim.
 *
 * Rule: no fetch() calls or mock data outside of `lib/api/*.ts`.
 */

export type { User, Session, UserRole } from "./user";
export type { Project, ProjectKind, ProjectStatus } from "./project";
export type * from "./deck";
export type * from "./smeta";

// ---------- Rates (the moat) ----------
export type RateSource = "approved_smeta" | "supplier_quote" | "scraped";

export type Rate = {
  id: string;
  org_id: string;
  material: string;
  unit: string;
  price: number;
  region: string | null;
  source: RateSource;
  observed_at: string;
};

// ---------- Jobs (async work queue) ----------
export type JobKind =
  | "deck_ingest"
  | "deck_render"
  | "smeta_generate"
  | "voice_transcribe";

export type JobStatus = "queued" | "running" | "completed" | "failed";

export type Job = {
  id: string;
  project_id: string;
  kind: JobKind;
  status: JobStatus;
  progress: number; // 0-100
  error: string | null;
  created_at: string;
  completed_at: string | null;
};

// ---------- Audit log ----------
export type AuditEntry = {
  id: string;
  user_id: string;
  action: string;
  entity_kind: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};
