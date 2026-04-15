"""Thin Postgres wrapper. Supabase-compatible via DATABASE_URL.

Deliberately minimal: no ORM, just psycopg. Smeta domain model is simple
enough and clear SQL beats hidden ORM magic when estimators start asking
"why did the number change".
"""
import json
from contextlib import contextmanager
from typing import Any

import psycopg

from .config import settings


@contextmanager
def conn():
    with psycopg.connect(settings.database_url, autocommit=True) as c:
        yield c


def upsert_user(telegram_user_id: int, name: str | None) -> int:
    with conn() as c, c.cursor() as cur:
        cur.execute(
            """
            INSERT INTO users (telegram_user_id, name)
            VALUES (%s, %s)
            ON CONFLICT (telegram_user_id) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            """,
            (telegram_user_id, name),
        )
        return cur.fetchone()[0]


def save_voice_note(
    user_id: int, telegram_file_id: str, transcript: str
) -> int:
    with conn() as c, c.cursor() as cur:
        cur.execute(
            """
            INSERT INTO voice_notes (user_id, telegram_file_id, transcript, confirmed)
            VALUES (%s, %s, %s, FALSE)
            RETURNING id
            """,
            (user_id, telegram_file_id, transcript),
        )
        return cur.fetchone()[0]


def confirm_voice_note(voice_note_id: int, final_transcript: str) -> None:
    with conn() as c, c.cursor() as cur:
        cur.execute(
            """
            UPDATE voice_notes
               SET transcript = %s, confirmed = TRUE
             WHERE id = %s
            """,
            (final_transcript, voice_note_id),
        )


def save_smeta_draft(user_id: int, voice_note_id: int, content: dict[str, Any]) -> int:
    with conn() as c, c.cursor() as cur:
        cur.execute(
            """
            INSERT INTO smeta_drafts (user_id, voice_note_id, content, status)
            VALUES (%s, %s, %s, 'draft')
            RETURNING id
            """,
            (user_id, voice_note_id, json.dumps(content, ensure_ascii=False)),
        )
        return cur.fetchone()[0]


def approve_smeta(smeta_id: int) -> None:
    with conn() as c, c.cursor() as cur:
        cur.execute(
            "UPDATE smeta_drafts SET status = 'approved' WHERE id = %s",
            (smeta_id,),
        )


def log_rate_observation(
    material: str, unit: str, price: float, region: str, source: str
) -> None:
    """Every approved line item writes one rate observation. This is the moat."""
    with conn() as c, c.cursor() as cur:
        cur.execute(
            """
            INSERT INTO rates (material, unit, price, region, source)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (material, unit, price, region, source),
        )
