"""
main.py
───────
FastAPI application entry point.

Registers middleware, mounts routers, and exposes the root health-check.
Start with:  uvicorn app.main:app --reload
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Eagerly load settings (bootstraps logging as a side-effect) ──────
from app.core.config import settings  # noqa: F401

# ── Routers ──────────────────────────────────────────────────────────
from app.api.routes import health, strategy

logger = logging.getLogger(__name__)

# ── App factory ──────────────────────────────────────────────────────
app = FastAPI(
    title="Alex RTR API",
    description="Agentic Business Accelerator Backend — multi-agent LangGraph pipeline",
    version="2.0.0",
)

# ── CORS — allow React dev servers ───────────────────────────────────
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routers ────────────────────────────────────────────────────
app.include_router(health.router, prefix="/api/health", tags=["System Health"])
app.include_router(strategy.router, prefix="/api/v1", tags=["Strategy Pipeline"])

logger.info("Alex RTR API initialised — routes mounted ✓")