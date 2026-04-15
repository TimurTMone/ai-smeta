"""Smeta generation agent — Claude Sonnet 4.6.

Single-agent design: one well-prompted LLM + JSON output + rate lookup.
Resist the urge to add an agent framework until this hits a clear wall.
"""
import json
from typing import Any

from anthropic import Anthropic

from .config import settings
from .prompts import SMETA_AGENT_SYSTEM

_client = Anthropic(api_key=settings.anthropic_api_key)


def generate_smeta_draft(transcript: str, firm_context: str = "") -> dict[str, Any]:
    """Generate a draft Smeta from a confirmed transcript.

    Args:
        transcript: Confirmed voice-note text from the user.
        firm_context: Optional — historical rates / past projects for this firm.
                      This is the private-memory moat; populate it as the firm
                      approves Smetas.

    Returns:
        Parsed JSON Smeta (or clarifying_questions if input is insufficient).
    """
    user_content = transcript
    if firm_context:
        user_content = (
            f"Контекст фирмы (исторические цены и проекты):\n{firm_context}\n\n"
            f"Описание нового объекта:\n{transcript}"
        )

    msg = _client.messages.create(
        model=settings.claude_model,
        max_tokens=4096,
        system=SMETA_AGENT_SYSTEM,
        messages=[{"role": "user", "content": user_content}],
    )

    text = msg.content[0].text.strip()
    # Claude sometimes wraps JSON in ```json fences — strip them
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return json.loads(text)
