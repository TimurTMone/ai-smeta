"""Entry point — runs Telegram bot in long-polling mode.

For production, switch to webhook + run under uvicorn alongside FastAPI
admin endpoints. For week 1, polling is fine.
"""
import logging

from .bot import build_app
from .config import settings


def main() -> None:
    logging.basicConfig(
        level=settings.log_level,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    app = build_app()
    app.run_polling()


if __name__ == "__main__":
    main()
