# Ai-Smeta API Contract

**Purpose:** Defines every data shape that crosses the frontend ↔ backend boundary for Ai-Smeta. This is the handoff document from the frontend (Timur + Claude) to the backend teammate.

**Source of truth:** [`web/src/types/api.ts`](../web/src/types/api.ts). If this document ever conflicts with that TypeScript file, the TypeScript file wins. Update both in sync.

**Pairing with the Python schema:** The deck types in `web/src/types/deck.ts` mirror `backend/app/deck/schema.py`. When you change one, change the other.

---

## Architecture overview

```
┌──────────────────────────────────┐
│         Next.js web app          │
│                                  │
│   All components import from:    │
│   web/src/lib/api/index.ts       │
│                                  │
│   Which re-exports typed         │
│   functions from either:         │
│   • mock/* (default)             │
│   • real/* (your FastAPI)        │
│                                  │
│   Toggled by env var:            │
│   NEXT_PUBLIC_API_MODE=real      │
└──────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│      FastAPI (your work)         │
│                                  │
│   Endpoints must return JSON     │
│   matching the types in          │
│   web/src/types/api.ts exactly.  │
│                                  │
│   Base URL configured via:       │
│   NEXT_PUBLIC_API_BASE_URL       │
└──────────────────────────────────┘
```

---

## Authentication

The frontend expects an httpOnly cookie named `aismeta-session` containing a JWT. The JWT payload must contain:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user" | "admin",
  "org_id": "org-uuid",
  "locale": "ky" | "ru" | "en",
  "iat": 1729000000,
  "exp": 1731592000
}
```

### Endpoints

#### `POST /api/auth/request-link`

Send an email-magic-link sign-in token. Creates the user if new.

**Request body:**
```json
{ "email": "name@example.com" }
```

**Response:** `204 No Content`

**Side effect:** Backend sends an email containing a link like:
`https://aismeta.kg/api/auth/verify?token=<signed-jwt-15min-ttl>`

#### `GET /api/auth/verify?token=<token>`

Verify a magic-link token, create the session, set the cookie, redirect.

**Response:** Sets `aismeta-session` cookie (httpOnly, 30-day TTL), redirects to `/dashboard`. Returns JSON `Session` object when called via fetch.

#### `GET /api/auth/session`

Read the current session.

**Response:** `Session` object or `null` if not logged in.

#### `POST /api/auth/logout`

Clear the session cookie.

**Response:** `204 No Content`

---

## Core types

See `web/src/types/api.ts` for the canonical TypeScript definitions. Summary:

### `User`

```ts
{
  id: string;                          // uuid
  email: string;
  name: string | null;
  locale: "ky" | "ru" | "en";
  role: "user" | "admin";
  org_id: string;                      // multi-tenant
  created_at: string;                  // ISO 8601
}
```

### `Session`

```ts
{ user: User; expires_at: string }
```

### `Project`

```ts
{
  id: string;
  org_id: string;
  kind: "smeta" | "deck";
  name: string;
  status: "draft" | "processing" | "ready" | "error";
  created_by: string;                  // user id
  created_at: string;
  updated_at: string;
  preview_image_url: string | null;    // thumbnail shown in project list
}
```

### `DeckData`

Full structured deck payload. Mirrors `backend/app/deck/schema.py` — see that file for the canonical shape. Key fields:

- `cover: DeckCover` — title, subtitle, hero image, 4 info cards
- `problem: DeckProblem | null` — one title + array of bilingual points
- `vision: DeckVision` — title, body, bullets, hero image
- `items: DeckItem[]` — the ports/projects/sub-initiatives; repeats
- `strategic_matrix: StrategicMatrix | null` — 2×2 positioning matrix
- `financial_summary: FinancialSummary` — total investment + breakdown table
- `roadmap: DeckRoadmap` — phases with deliverables
- `ask: DeckAsk` — call to action
- `image_credits: ImageCredit[]`

Every text field is `BilingualText = { ru: string; en: string; ky?: string }`.

### `Smeta`

```ts
{
  id: string;
  project_id: string;
  region: string;                      // "Бишкек, Жер-Арча"
  currency: "KGS" | "RUB" | "USD";
  sections: SmetaSection[];            // groups of line items
  total: number;                       // computed sum in `currency`
  assumptions: string[];
  clarifying_questions: string[];      // AI's unresolved questions
  status: "draft" | "approved";
  created_at: string;
}
```

Each `SmetaLineItem` has:
```ts
{
  id: string;
  description: BilingualText;
  unit: string;                        // "м³", "т", "шт"
  qty: number;
  rate: number;                        // price per unit
  total: number;                       // qty * rate (server should compute)
  source: "history" | "market" | "needs_clarification";
}
```

### `Rate` (the moat — firm's private rate catalog)

```ts
{
  id: string;
  org_id: string;
  material: string;
  unit: string;
  price: number;
  region: string | null;
  source: "approved_smeta" | "supplier_quote" | "scraped";
  observed_at: string;
}
```

### `Job` (async work queue)

```ts
{
  id: string;
  project_id: string;
  kind: "deck_ingest" | "deck_render" | "smeta_generate" | "voice_transcribe";
  status: "queued" | "running" | "completed" | "failed";
  progress: number;                    // 0-100
  error: string | null;
  created_at: string;
  completed_at: string | null;
}
```

---

## Endpoints

### Projects

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| GET | `/api/projects` | — | `Project[]` | Filtered by user's org_id via session |
| POST | `/api/projects` | `{ kind, name }` | `Project` | Creates draft |
| GET | `/api/projects/:id` | — | `Project` | 404 if not owned by user's org |
| PATCH | `/api/projects/:id` | `Partial<Project>` | `Project` | For rename, status changes |
| DELETE | `/api/projects/:id` | — | `204` | Hard delete (or soft — TBD) |

### Decks

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| GET | `/api/decks/:project_id` | — | `{ project, data }` | Returns stored DeckData for the project |
| PUT | `/api/decks/:project_id` | `DeckData` | `204` | Full replace of deck data |
| POST | `/api/decks/:project_id/ingest` | multipart `files` | `Job` | Queues Claude ingest of .docx files |
| POST | `/api/decks/:project_id/render` | — | `{ preview_url }` | Renders Jinja2 → returns preview URL |
| POST | `/api/decks/:project_id/export/pdf` | — | `{ download_url }` | Headless Chrome print, or server-side PDF |

### Smeta

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/smeta/:project_id` | — | `{ project, data }` |
| POST | `/api/smeta/:project_id/generate` | `{ text?, voice_url? }` | `Job` |
| PATCH | `/api/smeta/:project_id/lines/:line_id` | `Partial<SmetaLineItem>` | `204` |
| POST | `/api/smeta/:project_id/export/xlsx` | — | `{ download_url }` |

### Admin

| Method | Path | Returns | Notes |
|---|---|---|---|
| GET | `/api/users` | `User[]` | Requires role=admin |
| GET | `/api/rates` | `Rate[]` | Scoped to user's org |
| GET | `/api/rates?region=Бишкек` | `Rate[]` | Filter by region |
| GET | `/api/jobs` | `Job[]` | Admin sees all; users see own-project jobs only |
| GET | `/api/jobs/:id` | `Job` | |

---

## Error format

All non-2xx responses should return:

```json
{
  "error": {
    "code": "not_found" | "unauthorized" | "forbidden" | "validation" | "internal",
    "message": "Human-readable, localized if possible",
    "details": { "field": "..." }
  }
}
```

Frontend surfaces these via toast or inline form errors.

---

## Rules the backend must follow

1. **Return exact TypeScript types.** No renaming fields, no omitting nullable fields, no surprise arrays. Use Pydantic models generated from the types (or hand-written) and validate on the way out.
2. **Multi-tenant enforcement.** Every query must filter by `org_id` from the session. Never return another org's data.
3. **Role check.** Any endpoint under `/api/admin/` or returning user lists must verify `role === 'admin'`.
4. **Never invent numbers.** In Smeta generation, if the source is ambiguous, set `source: "needs_clarification"` and leave `rate` at 0 — the user will fill it in.
5. **Bilingual content is stored bilingual.** Never translate on write — store `ru`, `en`, and optionally `ky` as the user provided. Only the deck template decides which language renders as primary.
6. **Idempotent POSTs where reasonable.** `POST /api/decks/:id/render` can be called many times safely — always re-renders from current stored `DeckData`.
7. **CORS.** Allow `credentials: 'include'` from the web app's Vercel domain. No wildcard origins.
8. **Rate limit magic-link requests** to 5/email/hour to prevent spam.

---

## Quick start for the backend teammate

1. Read `web/src/types/api.ts` and `backend/app/deck/schema.py` for the full shapes.
2. Stand up Supabase project. Apply the schema from `db/schema.sql` (expanded with `users`, `sessions`, `orgs`, `org_members`, `projects`, `jobs`, `audit_log`).
3. Build FastAPI endpoints that match the paths + shapes above.
4. In the `web/` directory, set `.env.local`:
   ```
   NEXT_PUBLIC_API_MODE=real
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```
5. Run the frontend against your local backend: `npm run dev` in `web/`.
6. Everything should light up — if any function throws "not implemented", that endpoint still needs work.
