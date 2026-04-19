"""
api/routes/strategy.py
──────────────────────
FastAPI router for the strategy-generation and follow-up chat endpoints.

POST /api/v1/generate-strategy
    Accepts a business prompt (+ optional thread_id), runs the full
    LangGraph multi-agent pipeline, and returns the final state with
    the thread_id for follow-ups.

POST /api/v1/chat
    Accepts a thread_id and a follow-up message, loads the checkpointed
    state, runs the chat_agent, and returns the response.
"""

from __future__ import annotations

import logging
import time
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.graph_service import run_chat, run_graph

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response schemas ───────────────────────────────────────

class StrategyRequest(BaseModel):
    """Incoming request body for strategy generation."""
    prompt: str = Field(
        ...,
        min_length=5,
        max_length=5000,
        description="The user's business prompt.",
        examples=["I want to launch a premium pet-food subscription service in Tier-2 Indian cities"],
    )
    thread_id: Optional[str] = Field(
        default=None,
        description=(
            "Optional thread ID for checkpointing. If omitted, a new "
            "UUID4 is generated. Pass this back on subsequent requests "
            "to resume or follow-up on the same conversation."
        ),
    )


class StrategyResponse(BaseModel):
    """Structured response returned to the client."""
    status: str
    thread_id: str
    user_prompt: str
    compact_research: str
    compact_strategy: str
    final_plan: str
    messages: list[str]
    elapsed_seconds: float


class ChatRequest(BaseModel):
    """Incoming request body for follow-up questions."""
    thread_id: str = Field(
        ...,
        description="The thread_id returned from a prior /generate-strategy call.",
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="The user's follow-up question.",
    )


class ChatResponse(BaseModel):
    """Response from the chat agent."""
    status: str
    thread_id: str
    follow_up_response: str
    messages: list[str]
    elapsed_seconds: float


# ── Strategy Endpoint ────────────────────────────────────────────────
@router.post(
    "/generate-strategy",
    response_model=StrategyResponse,
    summary="Generate a full business strategy via the multi-agent pipeline",
)
async def generate_strategy(body: StrategyRequest):
    """
    Run the Researcher → Critic → Strategist → Critic → Action Taker → Critic
    pipeline and return the completed state with a thread_id for follow-ups.
    """
    logger.info("━" * 60)
    logger.info("POST /api/v1/generate-strategy")
    logger.info("  prompt    : %.150s …", body.prompt)
    logger.info("  thread_id : %s", body.thread_id or "(auto-generate)")
    logger.info("━" * 60)

    t0 = time.perf_counter()

    try:
        final_state = run_graph(
            user_prompt=body.prompt,
            thread_id=body.thread_id,
        )
    except Exception:
        logger.exception("Graph execution failed")
        raise HTTPException(
            status_code=500,
            detail="The multi-agent pipeline encountered an error. Check server logs.",
        )

    elapsed = round(time.perf_counter() - t0, 2)
    logger.info("Pipeline finished in %.2fs  |  thread_id=%s", elapsed, final_state.get("thread_id"))

    return StrategyResponse(
        status="success",
        thread_id=final_state.get("thread_id", ""),
        user_prompt=final_state.get("user_prompt", body.prompt),
        compact_research=final_state.get("compact_research", ""),
        compact_strategy=final_state.get("compact_strategy", ""),
        final_plan=final_state.get("final_plan", ""),
        messages=final_state.get("messages", []),
        elapsed_seconds=elapsed,
    )


# ── Follow-Up Chat Endpoint ─────────────────────────────────────────
@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Ask a follow-up question on an existing strategy thread",
)
async def chat_follow_up(body: ChatRequest):
    """
    Load the checkpointed state for the given thread_id and answer
    the user's follow-up question using the chat_agent.
    """
    logger.info("━" * 60)
    logger.info("POST /api/v1/chat")
    logger.info("  thread_id : %s", body.thread_id)
    logger.info("  message   : %.150s …", body.message)
    logger.info("━" * 60)

    t0 = time.perf_counter()

    try:
        final_state = run_chat(
            thread_id=body.thread_id,
            question=body.message,
        )
    except Exception:
        logger.exception("Chat execution failed")
        raise HTTPException(
            status_code=500,
            detail="The chat agent encountered an error. Check server logs.",
        )

    elapsed = round(time.perf_counter() - t0, 2)
    logger.info("Chat finished in %.2fs  |  thread_id=%s", elapsed, body.thread_id)

    return ChatResponse(
        status="success",
        thread_id=body.thread_id,
        follow_up_response=final_state.get("follow_up_response", ""),
        messages=final_state.get("messages", []),
        elapsed_seconds=elapsed,
    )
