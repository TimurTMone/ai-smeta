from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    telegram_bot_token: str
    openai_api_key: str
    anthropic_api_key: str
    database_url: str
    log_level: str = "INFO"

    # Model choices — swap here, not scattered through code
    whisper_model: str = "whisper-1"
    claude_model: str = "claude-sonnet-4-6"


settings = Settings()
