"""
services/graph_service.py
─────────────────────────
Builds and compiles the LangGraph state machine for the multi-agent
business-accelerator workflow.

Persistent checkpointing is backed by SQLite so that:
  • The system can resume from failures without re-running prior agents.
  • The frontend can ask follow-up questions on an existing thread_id
    with full context.

Graph topology
~~~~~~~~~~~~~~
                ┌───────────┐
                │  START     │
                └─────┬─────┘
                      │
              ┌───────▼───────┐
              │    router     │  (conditional: follow-up or new pipeline?)
              └───┬───────┬───┘
                  │       │
    follow_up_q? │       │ otherwise
                  │       │
          ┌───────▼──┐  ┌─▼──────────┐
          │chat_agent│  │ Researcher  │◄──────────────────────┐
          └───┬──────┘  └─────┬──────┘                        │
              │               │                               │
              │         ┌─────▼─────┐                         │
              │         │  Critic    │── FAIL ─────────────────┘
              │         └─────┬─────┘
              │               │ PASS
              │         ┌─────▼─────┐
              │      ┌──│ Strategist │◄──────────────────────┐
              │      │  └─────┬─────┘                        │
              │      │        │                              │
              │      │  ┌─────▼─────┐                        │
              │      │  │  Critic    │── FAIL ────────────────┘
              │      │  └─────┬─────┘
              │      │        │ PASS
              │      │  ┌─────▼──────┐
              │      │┌─│Action Taker│◄─────────────────────┐
              │      ││ └─────┬──────┘                      │
              │      ││       │                             │
              │      ││ ┌─────▼─────┐                       │
              │      ││ │  Critic    │── FAIL ───────────────┘
              │      ││ └─────┬─────┘
              │      ││       │ PASS
           ┌──▼──────▼▼───────▼──┐
           │        END          │
           └─────────────────────┘
"""

from __future__ import annotations

import logging
import sqlite3
from pathlib import Path

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, StateGraph

from app.core.config import settings
from app.models.agent_state import AgentState
from app.services.agents import (
    action_taker_node,
    chat_agent_node,
    critic_node,
    researcher_node,
    strategist_node,
)

logger = logging.getLogger(__name__)


# ── SQLite Checkpointer ─────────────────────────────────────────────
_CHECKPOINT_DB = Path(__file__).resolve().parents[2] / "checkpoints.sqlite"
_db_conn = sqlite3.connect(str(_CHECKPOINT_DB), check_same_thread=False)
_checkpointer = SqliteSaver(_db_conn)
logger.info("SQLite checkpointer initialised → %s", _CHECKPOINT_DB)


# ── Mapping from an agent name to its "next" agent in the pipeline ───
_NEXT_AGENT = {
    "researcher": "strategist",
    "strategist": "action_taker",
    "action_taker": END,
}


# =====================================================================
#  Conditional entry: follow-up → chat_agent, otherwise → researcher
# =====================================================================
def _route_entry(state: AgentState) -> str:
    """Pick the entry path based on whether this is a follow-up or new run."""
    fq = state.get("follow_up_question", "")
    if fq and fq.strip():
        logger.debug("ROUTE_ENTRY  ▸  follow_up_question detected → chat_agent")
        return "chat_agent"
    logger.debug("ROUTE_ENTRY  ▸  No follow-up → researcher (new pipeline)")
    return "researcher"


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
    graph.add_node("chat_agent", chat_agent_node)

    logger.debug("Nodes registered: researcher, strategist, action_taker, critic, chat_agent")

    # ── Conditional entry point ──────────────────────────────────────
    graph.add_conditional_edges(
        START,
        _route_entry,
        {
            "researcher": "researcher",
            "chat_agent": "chat_agent",
        },
    )

    logger.debug("Conditional entry: START → researcher | chat_agent")

    # ── Chat agent goes straight to END (no Critic needed) ───────────
    graph.add_edge("chat_agent", END)

    # ── After each worker → always go to Critic ──────────────────────
    graph.add_edge("researcher", "critic")
    graph.add_edge("strategist", "critic")
    graph.add_edge("action_taker", "critic")

    logger.debug("Edges: researcher→critic, strategist→critic, action_taker→critic")
    logger.debug("Edge: chat_agent→END")

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


# ── Compile once at module import (with checkpointer) ────────────────
_compiled_app = _build_graph().compile(checkpointer=_checkpointer)
logger.info("LangGraph workflow compiled with SQLite checkpointer ✓")


# =====================================================================
#  Public API — Strategy Pipeline
# =====================================================================
def run_graph(user_prompt: str, thread_id: str | None = None) -> dict:
    """
    Execute the full multi-agent pipeline for the given prompt.

    Parameters
    ----------
    user_prompt : str
        The business prompt from the end user.
    thread_id : str | None
        Optional thread ID for checkpointing. If None, a new UUID is
        generated so every run is independently checkpointed.

    Returns
    -------
    dict
        The final ``AgentState`` after the graph reaches END, plus
        the ``thread_id`` used.
    """
    import uuid

    if thread_id is None:
        thread_id = str(uuid.uuid4())

    logger.info("▶  run_graph invoked  |  thread_id=%s  |  prompt=%.120s …",
                thread_id, user_prompt)

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
        "follow_up_question": "",
        "follow_up_response": "",
    }

    config = {"configurable": {"thread_id": thread_id}}

    logger.debug("Initial state prepared: %s", list(initial_state.keys()))

    final_state = _compiled_app.invoke(initial_state, config=config)

    logger.info("◀  run_graph complete  |  thread_id=%s  |  messages=%d",
                thread_id, len(final_state.get("messages", [])))
    logger.debug("Final state keys: %s", list(final_state.keys()))

    result = dict(final_state)
    result["thread_id"] = thread_id
    return result


# =====================================================================
#  Public API — Follow-Up Chat
# =====================================================================
def run_chat(thread_id: str, question: str) -> dict:
    """
    Send a follow-up question to an existing thread.

    The checkpointer loads the saved state (compact_research,
    compact_strategy, final_plan) and the chat_agent uses it to
    answer the question.

    Parameters
    ----------
    thread_id : str
        The thread ID returned from a previous ``run_graph`` call.
    question : str
        The user's follow-up question.

    Returns
    -------
    dict
        Contains ``follow_up_response``, ``thread_id``, and ``messages``.
    """
    logger.info("▶  run_chat invoked  |  thread_id=%s  |  question=%.120s …",
                thread_id, question)

    # Only set the fields needed to trigger the chat_agent path
    follow_up_state: AgentState = {
        "follow_up_question": question,
        "follow_up_response": "",
    }

    config = {"configurable": {"thread_id": thread_id}}

    final_state = _compiled_app.invoke(follow_up_state, config=config)

    logger.info("◀  run_chat complete  |  thread_id=%s", thread_id)

    result = dict(final_state)
    result["thread_id"] = thread_id
    return result