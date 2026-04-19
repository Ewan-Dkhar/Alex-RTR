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
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175"
]

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

class ChatRequest(BaseModel):
    message: str

@app.get("/api/health")
async def get_health():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat_route(req: ChatRequest):
    try:
        from app.services.graph_service import run_graph
        if len(req.message) < 5:
            return {"reply": "Please enter a message of at least 5 characters for the AI to analyze."}
        
        final_state = run_graph(user_prompt=req.message)
        plan = final_state.get("final_plan", "I'm sorry, I couldn't generate a plan.")
        
        # Extract structured data
        from app.services.llm_client import get_llm
        from langchain_core.messages import SystemMessage, HumanMessage
        import json
        llm = get_llm()
        extract_prompt = f"""Extract the following details from the strategy plan and output ONLY valid JSON.
Fields required:
"region": string (the specific area in Lucknow recommended, e.g. "Gomti Nagar", "Hazratganj", defaults to "Gomti Nagar")
"domain": string (the business sector recommended, e.g. "Food & Beverage", "Retail", defaults to "Food & Beverage")
"roi": number (extracted ROI percentage, or default 20)
"demandScore": number (out of 10)
"growthRate": number (e.g. 0.05 for 5%)
"budgetAllocation": object with setup, marketing, licenses, property, workingCapital as decimals summing to 1.0

Plan text:
{plan}
"""
        try:
            extraction_res = llm.invoke([SystemMessage(content="You are a strict JSON extractor. Output ONLY valid JSON."), HumanMessage(content=extract_prompt)])
            import re
            json_text = re.sub(r'```(?:json)?\s*([\s\S]*?)\s*```', r'\1', extraction_res.content).strip()
            data = json.loads(json_text)
        except Exception as e:
            logger.warning(f"Failed to extract JSON: {e}")
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

        return {"reply": plan, "data": data}
    except Exception as e:
        logger.exception("Error in chat_route")
        return {"reply": f"An error occurred: {str(e)}"}

logger.info("Alex RTR API initialised — routes mounted ✓")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)