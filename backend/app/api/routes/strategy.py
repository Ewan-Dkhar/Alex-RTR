"""
api/routes/strategy.py
──────────────────────
FastAPI router for the strategy-generation endpoint.

POST /api/v1/generate-strategy
    Accepts a business prompt, runs the full LangGraph multi-agent pipeline,
    and returns the final state.
"""

from __future__ import annotations

import logging
import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.graph_service import run_graph

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response schemas ───────────────────────────────────────
class StrategyRequest(BaseModel):
    """Incoming request body."""
    prompt: str = Field(
        ...,
        min_length=5,
        max_length=5000,
        description="The user's business prompt.",
        examples=["I want to launch a premium pet-food subscription service in Tier-2 Indian cities"],
    )


class StrategyResponse(BaseModel):
    """Structured response returned to the client."""
    status: str
    user_prompt: str
    compact_research: str
    compact_strategy: str
    final_plan: str
    messages: list[str]
    elapsed_seconds: float


# ── Endpoint ─────────────────────────────────────────────────────────
@router.post(
    "/generate-strategy",
    response_model=StrategyResponse,
    summary="Generate a full business strategy via the multi-agent pipeline",
)
async def generate_strategy(body: StrategyRequest):
    """
    Run the Researcher → Critic → Strategist → Critic → Action Taker → Critic
    pipeline and return the completed state.
    """
    logger.info("━" * 60)
    logger.info("POST /api/v1/generate-strategy")
    logger.info("  prompt: %.150s …", body.prompt)
    logger.info("━" * 60)

    t0 = time.perf_counter()

    try:
        final_state = run_graph(user_prompt=body.prompt)
    except Exception:
        logger.exception("Graph execution failed")
        raise HTTPException(
            status_code=500,
            detail="The multi-agent pipeline encountered an error. Check server logs.",
        )

    elapsed = round(time.perf_counter() - t0, 2)
    logger.info("Pipeline finished in %.2fs", elapsed)

    return StrategyResponse(
        status="success",
        user_prompt=final_state.get("user_prompt", body.prompt),
        compact_research=final_state.get("compact_research", ""),
        compact_strategy=final_state.get("compact_strategy", ""),
        final_plan=final_state.get("final_plan", ""),
        messages=final_state.get("messages", []),
        elapsed_seconds=elapsed,
    )
