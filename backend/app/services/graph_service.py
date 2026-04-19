"""
services/graph_service.py
─────────────────────────
Builds and compiles the LangGraph state machine for the multi-agent
business-accelerator workflow.

Graph topology
~~~~~~~~~~~~~~
                ┌───────────┐
                │  START     │
                └─────┬─────┘
                      │
                ┌─────▼─────┐
           ┌────│ Researcher │◄──────────────────────┐
           │    └─────┬─────┘                        │
           │          │                              │
           │    ┌─────▼─────┐                        │
           │    │  Critic    │── FAIL ────────────────┘
           │    └─────┬─────┘
           │          │ PASS
           │    ┌─────▼─────┐
           │ ┌──│ Strategist │◄──────────────────────┐
           │ │  └─────┬─────┘                        │
           │ │        │                              │
           │ │  ┌─────▼─────┐                        │
           │ │  │  Critic    │── FAIL ────────────────┘
           │ │  └─────┬─────┘
           │ │        │ PASS
           │ │  ┌─────▼──────┐
           │ │┌─│Action Taker│◄─────────────────────┐
           │ ││ └─────┬──────┘                      │
           │ ││       │                             │
           │ ││ ┌─────▼─────┐                       │
           │ ││ │  Critic    │── FAIL ───────────────┘
           │ ││ └─────┬─────┘
           │ ││       │ PASS
           │ ││ ┌─────▼─────┐
           │ ││ │   END      │
           │ ││ └───────────┘
"""

from __future__ import annotations

import logging

from langgraph.graph import END, StateGraph

from app.core.config import settings
from app.models.agent_state import AgentState
from app.services.agents import (
    action_taker_node,
    critic_node,
    researcher_node,
    strategist_node,
)

logger = logging.getLogger(__name__)

# ── Mapping from an agent name to its "next" agent in the pipeline ───
_NEXT_AGENT = {
    "researcher": "strategist",
    "strategist": "action_taker",
    "action_taker": END,
}


# =====================================================================
#  Conditional routing function (called after every Critic evaluation)
# =====================================================================
def route_after_critic(state: AgentState) -> str:
    """
    Decide the next node after the Critic finishes.

    * PASS → advance to the next agent (or END).
    * FAIL → loop back to the agent that just executed, unless we have
      exhausted ``MAX_CRITIC_RETRIES``, in which case force-advance.
    """
    current = state.get("current_agent", "")
    passed = state.get("critic_passed", True)
    retries = state.get("retry_count", 0)
    max_retries = settings.max_critic_retries

    logger.debug("─" * 50)
    logger.debug("ROUTE_AFTER_CRITIC  ▸  current_agent=%s  passed=%s  retries=%d/%d",
                 current, passed, retries, max_retries)

    if passed:
        destination = _NEXT_AGENT.get(current, END)
        logger.debug("ROUTE_AFTER_CRITIC  ▸  PASS → advancing to '%s'", destination)
        return destination

    # ── FAIL path ────────────────────────────────────────────────────
    if retries >= max_retries:
        destination = _NEXT_AGENT.get(current, END)
        logger.warning(
            "ROUTE_AFTER_CRITIC  ▸  Max retries (%d) reached for '%s' — force-advancing to '%s'",
            max_retries, current, destination,
        )
        return destination

    logger.debug("ROUTE_AFTER_CRITIC  ▸  FAIL → routing back to '%s' for retry", current)
    return current


# =====================================================================
#  Build the graph
# =====================================================================
def _build_graph() -> StateGraph:
    """Construct the LangGraph workflow."""

    logger.debug("Building LangGraph workflow …")

    graph = StateGraph(AgentState)

    # ── Add nodes ────────────────────────────────────────────────────
    graph.add_node("researcher", researcher_node)
    graph.add_node("strategist", strategist_node)
    graph.add_node("action_taker", action_taker_node)
    graph.add_node("critic", critic_node)

    logger.debug("Nodes registered: researcher, strategist, action_taker, critic")

    # ── Entry point ──────────────────────────────────────────────────
    graph.set_entry_point("researcher")

    # ── After each worker → always go to Critic ──────────────────────
    graph.add_edge("researcher", "critic")
    graph.add_edge("strategist", "critic")
    graph.add_edge("action_taker", "critic")

    logger.debug("Edges: researcher→critic, strategist→critic, action_taker→critic")

    # ── After Critic → conditional routing ───────────────────────────
    graph.add_conditional_edges(
        "critic",
        route_after_critic,
        {
            "researcher": "researcher",
            "strategist": "strategist",
            "action_taker": "action_taker",
            END: END,
        },
    )

    logger.debug("Conditional edges from critic registered")

    return graph


# ── Compile once at module import ────────────────────────────────────
_compiled_app = _build_graph().compile()
logger.info("LangGraph workflow compiled and ready ✓")


# =====================================================================
#  Public API
# =====================================================================
def run_graph(user_prompt: str) -> dict:
    """
    Execute the full multi-agent pipeline for the given prompt.

    Parameters
    ----------
    user_prompt : str
        The business prompt from the end user.

    Returns
    -------
    dict
        The final ``AgentState`` after the graph reaches END.
    """
    logger.info("▶  run_graph invoked  |  prompt=%.120s …", user_prompt)

    initial_state: AgentState = {
        "user_prompt": user_prompt,
        "compact_research": "",
        "compact_strategy": "",
        "final_plan": "",
        "current_agent": "",
        "critic_feedback": "",
        "critic_passed": False,
        "retry_count": 0,
        "messages": [],
        "tools_output": {},
    }

    logger.debug("Initial state prepared: %s", list(initial_state.keys()))

    final_state = _compiled_app.invoke(initial_state)

    logger.info("◀  run_graph complete  |  messages=%d", len(final_state.get("messages", [])))
    logger.debug("Final state keys: %s", list(final_state.keys()))

    return dict(final_state)