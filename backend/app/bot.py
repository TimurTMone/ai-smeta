"""Telegram bot — voice-first Smeta flow.

Flow:
  1. User sends voice note
  2. Bot transcribes (Whisper) → shows transcript with [Confirm/Edit/Re-record]
  3. On confirm → bot runs Smeta agent → shows draft with [Approve/Edit/Redo]
  4. On approve → Smeta saved, rates logged to firm memory
"""
import logging
import tempfile
from pathlib import Path

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from . import db
from .agent import generate_smeta_draft
from .config import settings
from .prompts import CONFIRM_TRANSCRIPT_TEMPLATE, SMETA_SUMMARY_TEMPLATE
from .transcribe import transcribe_voice

log = logging.getLogger(__name__)


# --- Commands --------------------------------------------------------------

async def cmd_start(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    db.upsert_user(user.id, user.full_name)
    await update.message.reply_text(
        "Привет! Я Ai-Smeta бот.\n\n"
        "Отправь мне голосовое сообщение с описанием объекта — "
        "я подготовлю черновик локальной сметы.\n\n"
        "Говори на русском или кыргызском (можно смешивать)."
    )


# --- Voice handler ---------------------------------------------------------

async def on_voice(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    user_id = db.upsert_user(user.id, user.full_name)

    voice = update.message.voice
    await update.message.reply_text("🎧 Слушаю и расшифровываю…")

    # Download voice to temp file
    tg_file = await context.bot.get_file(voice.file_id)
    with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    await tg_file.download_to_drive(tmp_path)

    try:
        transcript = transcribe_voice(tmp_path)
    except Exception as e:
        log.exception("transcription failed")
        await update.message.reply_text(f"⚠️ Не смог расшифровать: {e}")
        return
    finally:
        tmp_path.unlink(missing_ok=True)

    voice_note_id = db.save_voice_note(user_id, voice.file_id, transcript)

    kb = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton("✅ Верно", callback_data=f"confirm:{voice_note_id}"),
                InlineKeyboardButton("✏️ Поправить", callback_data=f"edit:{voice_note_id}"),
            ],
            [InlineKeyboardButton("🔄 Перезаписать", callback_data=f"redo:{voice_note_id}")],
        ]
    )
    await update.message.reply_text(
        CONFIRM_TRANSCRIPT_TEMPLATE.format(transcript=transcript),
        reply_markup=kb,
    )


# --- Callback handlers -----------------------------------------------------

async def on_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    action, _, arg = query.data.partition(":")

    if action == "confirm":
        await _generate_smeta(query, int(arg))
    elif action == "edit":
        context.user_data["editing_voice_note_id"] = int(arg)
        await query.message.reply_text(
            "Напиши исправленный текст ответным сообщением."
        )
    elif action == "redo":
        await query.message.reply_text("Жду новое голосовое сообщение.")
    elif action == "approve_smeta":
        db.approve_smeta(int(arg))
        await query.message.reply_text("✅ Смета утверждена и сохранена в базу фирмы.")
    elif action == "redo_smeta":
        await query.message.reply_text(
            "Опиши что поменять — голосом или текстом."
        )


async def on_text_edit(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """User sent corrected transcript after clicking Edit."""
    voice_note_id = context.user_data.pop("editing_voice_note_id", None)
    if not voice_note_id:
        return  # not in edit flow
    corrected = update.message.text
    db.confirm_voice_note(voice_note_id, corrected)
    await update.message.reply_text("Принял. Генерирую смету…")
    await _run_smeta_and_reply(update.message, voice_note_id, corrected)


# --- Smeta generation ------------------------------------------------------

async def _generate_smeta(query, voice_note_id: int) -> None:
    # Fetch transcript from DB (already saved)
    import psycopg
    with psycopg.connect(settings.database_url) as c, c.cursor() as cur:
        cur.execute(
            "SELECT user_id, transcript FROM voice_notes WHERE id = %s",
            (voice_note_id,),
        )
        row = cur.fetchone()
    if not row:
        await query.message.reply_text("⚠️ Не нашёл голосовое в базе.")
        return
    user_id, transcript = row
    db.confirm_voice_note(voice_note_id, transcript)
    await query.message.reply_text("Генерирую смету… это займёт 20-40 секунд.")
    await _run_smeta_and_reply(query.message, voice_note_id, transcript, user_id)


async def _run_smeta_and_reply(message, voice_note_id: int, transcript: str, user_id: int | None = None) -> None:
    try:
        draft = generate_smeta_draft(transcript)
    except Exception as e:
        log.exception("smeta generation failed")
        await message.reply_text(f"⚠️ Агент упал: {e}")
        return

    # If agent returned only clarifying questions
    if draft.get("clarifying_questions") and not draft.get("sections"):
        qs = "\n".join(f"• {q}" for q in draft["clarifying_questions"])
        await message.reply_text(f"Уточни, пожалуйста:\n\n{qs}")
        return

    if user_id is None:
        # Look up user_id from voice note
        import psycopg
        with psycopg.connect(settings.database_url) as c, c.cursor() as cur:
            cur.execute("SELECT user_id FROM voice_notes WHERE id = %s", (voice_note_id,))
            user_id = cur.fetchone()[0]

    smeta_id = db.save_smeta_draft(user_id, voice_note_id, draft)

    # Format summary
    sections_text = "\n".join(
        f"*{s['name']}*: {sum(i['total'] for i in s['items']):,.0f}"
        for s in draft["sections"]
    )
    summary = SMETA_SUMMARY_TEMPLATE.format(
        project_name=draft.get("project_name", "(без названия)"),
        region=draft.get("region", "—"),
        currency=draft.get("currency", "KGS"),
        sections_text=sections_text,
        total=draft.get("total", 0),
    )

    kb = InlineKeyboardMarkup([[
        InlineKeyboardButton("✅ Утвердить", callback_data=f"approve_smeta:{smeta_id}"),
        InlineKeyboardButton("🔄 Переделать", callback_data=f"redo_smeta:{smeta_id}"),
    ]])
    await message.reply_text(summary, reply_markup=kb, parse_mode="Markdown")


# --- App factory -----------------------------------------------------------

def build_app() -> Application:
    app = Application.builder().token(settings.telegram_bot_token).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(MessageHandler(filters.VOICE, on_voice))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_text_edit))
    app.add_handler(CallbackQueryHandler(on_callback))
    return app
