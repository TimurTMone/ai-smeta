-- Ai-Smeta Postgres schema (Supabase-compatible)
-- Minimal domain model for week 1. Add indexes + RLS policies in Supabase console.

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    telegram_user_id BIGINT UNIQUE NOT NULL,
    name TEXT,
    firm TEXT,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_notes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    telegram_file_id TEXT NOT NULL,
    transcript TEXT NOT NULL,
    confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS smeta_drafts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voice_note_id BIGINT REFERENCES voice_notes(id) ON DELETE SET NULL,
    content JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- draft | approved | rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);

-- The moat: every approved line item writes one row here.
-- After N projects, you have a private rate index per region + a market benchmark.
CREATE TABLE IF NOT EXISTS rates (
    id BIGSERIAL PRIMARY KEY,
    material TEXT NOT NULL,
    unit TEXT NOT NULL,
    price NUMERIC(14, 2) NOT NULL,
    region TEXT,
    source TEXT, -- "approved_smeta" | "supplier_quote" | "scraped" | ...
    observed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_notes_user ON voice_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_smeta_drafts_user ON smeta_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_smeta_drafts_status ON smeta_drafts(status);
CREATE INDEX IF NOT EXISTS idx_rates_material ON rates(material);
CREATE INDEX IF NOT EXISTS idx_rates_region ON rates(region);
