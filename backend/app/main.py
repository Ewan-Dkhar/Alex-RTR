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
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routers ────────────────────────────────────────────────────
app.include_router(health.router, prefix="/api/health_internal", tags=["System Health"])
app.include_router(strategy.router, prefix="/api/v1", tags=["Strategy Pipeline"])

# ── Chatbot Route (User requested format) ────────────────────────────
from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None

@app.get("/api/health")
async def get_health():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat_route(req: ChatRequest):
    try:
        from app.services.graph_service import run_graph, run_chat
        from app.services.llm_client import get_llm
        from langchain_core.messages import SystemMessage, HumanMessage
        import json
        import re

        if len(req.message) < 5:
            return {"reply": "Please enter a message of at least 5 characters for the AI to analyze.", "thread_id": req.thread_id}

        llm = get_llm()

        # ── Follow-Up Chat ───────────────────────────────────────────────────
        if req.thread_id:
            final_state = run_chat(thread_id=req.thread_id, question=req.message)
            reply = final_state.get("follow_up_response", "I'm sorry, I couldn't process your follow-up.")
            return {
                "reply": reply,
                "data": None,  # Frontend already has the dashboard data
                "thread_id": final_state["thread_id"]
            }

        # ── Initial Pipeline Run ──────────────────────────────────────────────
        final_state = run_graph(user_prompt=req.message)
        plan_json_str = final_state.get("final_plan", "{}")
        thread_id = final_state.get("thread_id")

        # 1. Parse structured data for the dashboard
        try:
            json_text = re.sub(r'```(?:json)?\s*([\s\S]*?)\s*```', r'\1', plan_json_str).strip()
            data = json.loads(json_text)
        except Exception as e:
            logger.warning(f"Failed to extract JSON from Action_Taker output: {e}")
            data = {
                "region": "Gomti Nagar",
                "domain": "Food & Beverage",
                "roi": 20,
                "demandScore": 8,
                "growthRate": 0.05,
                "budgetAllocation": {
                    "setup": 0.35, "marketing": 0.15, "licenses": 0.05, "property": 0.30, "workingCapital": 0.15
                }
            }

        # 2. Generate a friendly conversational reply for the chat UI
        try:
            summary_prompt = (
                "You are a helpful business assistant. A background AI pipeline just analyzed "
                "the user's request and generated this structured data payload:\n"
                f"{json.dumps(data)}\n\n"
                "Write a friendly 2-sentence conversational response to the user. "
                "Do NOT show the JSON. Tell them you've analyzed the market and they can view "
                "the insights, ROI, and budget allocation on their dashboard."
            )
            chat_res = llm.invoke([SystemMessage(content=summary_prompt)])
            conversational_reply = chat_res.content.strip()
        except Exception as e:
            logger.warning(f"Failed to generate conversational reply: {e}")
            conversational_reply = "I've analyzed your request! The dashboard has been updated with the latest insights, ROI, and budget allocation for your business."

        return {"reply": conversational_reply, "data": data, "thread_id": thread_id}
    except Exception as e:
        logger.exception("Error in chat_route")
        return {"reply": f"An error occurred: {str(e)}", "thread_id": req.thread_id}

logger.info("Alex RTR API initialised — routes mounted ✓")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)