"""
core/config.py
──────────────
Centralised settings loaded from the .env file via pydantic-settings.
Every service imports `settings` from here – single source of truth.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# ── Locate the .env file relative to this module ────────────────────────
_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"  # backend/.env


class Settings(BaseSettings):
    """Application-wide settings, auto-populated from .env."""

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── LLM ──────────────────────────────────────────────────────────────
    ngrok_url: str = "https://PLACEHOLDER.ngrok-free.app/v1"
    llm_model: str = "qwen2.5:7b"
    llm_temperature: float = 0.4

    # ── Critic ───────────────────────────────────────────────────────────
    max_critic_retries: int = 2

    # ── Web Tools ────────────────────────────────────────────────────────
    serper_api_key: str = ""
    firecrawl_api_key: str = ""

    # ── Logging ──────────────────────────────────────────────────────────
    log_level: str = "DEBUG"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton of Settings."""
    return Settings()


settings = get_settings()

# ── Bootstrap root logger ───────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.DEBUG),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
