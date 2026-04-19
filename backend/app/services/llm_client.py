"""
services/llm_client.py
──────────────────────
Single factory for the Groq-backed LLM instance with a five-model
fallback chain for resilience against rate-limits and API timeouts.

Fallback order (Key Rotation Strategy)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
1. llama3-70b-specdec   (Key 0)
2. llama3-70b-specdec   (Key 1)
3. llama3-70b-specdec   (Key 2)
4. llama3-70b-versatile (Key 0)
5. llama3-8b-instant    (Key 0)

If a key gets rate-limited, the chain automatically falls through to
the next key, preserving the primary model quality as long as possible.

Usage
~~~~~
    from app.services.llm_client import get_llm
    llm = get_llm()          # returns the robust fallback chain
    llm.invoke(messages)      # transparently retries across models

    # For tool-binding (requires individual model access):
    from app.services.llm_client import get_llm_models
    primary, backups = get_llm_models()
    tool_primary = primary.bind_tools(tools)
    tool_chain = tool_primary.with_fallbacks([b.bind_tools(tools) for b in backups])
"""

from __future__ import annotations

import logging

from langchain_groq import ChatGroq

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Module-level singletons (created once, reused everywhere) ────────
_primary: ChatGroq | None = None
_backup_1: ChatGroq | None = None
_backup_2: ChatGroq | None = None
_backup_3: ChatGroq | None = None
_backup_4: ChatGroq | None = None


def _init_models() -> tuple[ChatGroq, ChatGroq, ChatGroq, ChatGroq, ChatGroq]:
    """Lazily initialise the five ChatGroq model instances."""
    global _primary, _backup_1, _backup_2, _backup_3, _backup_4

    if _primary is not None:
        return _primary, _backup_1, _backup_2, _backup_3, _backup_4  # type: ignore[return-value]

    logger.debug(
        "Initialising ChatGroq models  |  groq_api_key=%s…",
        settings.groq_api_key[:8] + "…" if len(settings.groq_api_key) > 8 else "***",
    )

    _primary = ChatGroq(
        model_name="llama-3.3-70b-specdec",
        temperature=0.2,
        max_retries=1,
        api_key=settings.groq_api_key,
    )

    _backup_1 = ChatGroq(
        model_name="llama-3.3-70b-specdec",
        temperature=0.2,
        max_retries=1,
        api_key=settings.groq_api_key_1 or settings.groq_api_key,
    )

    _backup_2 = ChatGroq(
        model_name="llama-3.3-70b-specdec",
        temperature=0.2,
        max_retries=1,
        api_key=settings.groq_api_key_2 or settings.groq_api_key,
    )

    _backup_3 = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.2,
        max_retries=1,
        api_key=settings.groq_api_key,
    )

    _backup_4 = ChatGroq(
        model_name="llama-3.1-8b-instant",
        temperature=0.2,
        max_retries=1,
        api_key=settings.groq_api_key,
    )

    logger.debug(
        "ChatGroq models ready: 3x llama-3.3-70b-specdec (keys 0,1,2), "
        "1x llama-3.3-70b-versatile, 1x llama-3.1-8b-instant"
    )

    return _primary, _backup_1, _backup_2, _backup_3, _backup_4


def get_llm():
    """
    Return a robust fallback chain: primary (K0) → b1 (K1) → b2 (K2) → b3 → b4.

    Each model is configured with ``max_retries=1`` so that a single
    transient failure triggers an immediate fallback to the next model
    rather than burning time on repeated retries to the same endpoint.

    Returns a ``RunnableWithFallbacks`` instance that is a drop-in
    replacement for any ``BaseChatModel`` — it supports ``.invoke()``,
    ``.stream()``, etc.
    """
    primary, b1, b2, b3, b4 = _init_models()
    robust_llm = primary.with_fallbacks([b1, b2, b3, b4])
    logger.debug("Fallback chain assembled: 3x 70b-specdec → 70b-versatile → 8b-instant")
    return robust_llm


def get_llm_models() -> tuple:
    """
    Return (primary, [b1, b2, b3, b4]) for callers that need to
    bind tools individually before assembling their own fallback chain.

    This is necessary because ``RunnableWithFallbacks`` does not expose
    ``.bind_tools()`` — tools must be bound on each underlying model
    before chaining.
    """
    primary, b1, b2, b3, b4 = _init_models()
    return primary, [b1, b2, b3, b4]
