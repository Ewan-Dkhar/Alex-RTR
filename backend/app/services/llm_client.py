"""
services/llm_client.py
──────────────────────
Single factory for the ChatOpenAI-compatible LLM instance that talks to the
local Qwen 2.5-7B model tunnelled through ngrok.

Usage
~~~~~
    from app.services.llm_client import get_llm
    llm = get_llm()
"""

from __future__ import annotations

import logging

from langchain_openai import ChatOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_llm() -> ChatOpenAI:
    """
    Construct a ChatOpenAI instance pointed at the ngrok-tunnelled local model.

    The ``openai_api_key`` is set to a dummy value because the local server
    does not enforce authentication, but the SDK requires it to be non-empty.
    """
    logger.debug(
        "Initialising ChatOpenAI → base_url=%s  model=%s  temperature=%s",
        settings.ngrok_url,
        settings.llm_model,
        settings.llm_temperature,
    )

    llm = ChatOpenAI(
        base_url=settings.ngrok_url,
        model=settings.llm_model,
        temperature=settings.llm_temperature,
        openai_api_key="not-needed",          # local model – no auth required
        max_tokens=2048,
        request_timeout=300,                  # generous timeout for 7B model
        max_retries=2,
    )

    logger.debug("ChatOpenAI instance ready: %r", llm)
    return llm
