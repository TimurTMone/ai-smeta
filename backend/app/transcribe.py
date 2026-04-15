"""Whisper transcription for mixed KG/RU voice notes.

V1: OpenAI Whisper API with Russian language hint. Whisper large (behind the API)
handles Russian well and picks up Kyrgyz code-switching imperfectly but usefully.

V2 plan: self-host Whisper large-v3 fine-tuned on client's own voice notes.
"""
from pathlib import Path

from openai import OpenAI

from .config import settings

_client = OpenAI(api_key=settings.openai_api_key)


def transcribe_voice(audio_path: Path) -> str:
    """Transcribe an audio file. Returns plain text."""
    with open(audio_path, "rb") as f:
        resp = _client.audio.transcriptions.create(
            model=settings.whisper_model,
            file=f,
            language="ru",  # hint; KG code-switches still come through
            response_format="text",
        )
    # response_format="text" returns a string directly
    return str(resp).strip()
