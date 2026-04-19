"""
models/agent_state.py
─────────────────────
Defines the LangGraph AgentState – the single TypedDict that flows through
every node in the multi-agent graph.

Design notes  (Context-Compaction Architecture)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* **O(1) token growth** – no field ever stores raw data, CSV rows, or
  conversational filler.  Every agent writes *only* a compressed summary
  wrapped in ``<summary>`` tags.  The state therefore never grows beyond a
  bounded size regardless of how many retries or tool calls occur.
* ``compact_research``, ``compact_strategy``, and ``final_plan`` replace
  the former ``local_data``, ``strategy``, and ``action_plan`` fields.
* ``messages`` is an append-only log of short status strings for the UI.
* ``retry_count`` is maintained per-step by the Critic to cap retries.
* ``follow_up_question`` / ``follow_up_response`` support human-in-the-loop
  chat follow-ups via SQLite-checkpointed threads.
* ``chat_history`` stores actual Q&A conversation turns (overwrite-reduced
  so that the summariser can truncate old turns).
* ``summary`` holds a rolling compressed summary of older chat turns.
"""

from __future__ import annotations

from typing import Annotated, Any

from typing_extensions import TypedDict


# ── Reducers ─────────────────────────────────────────────────────────

def _overwrite(current: Any, new: Any) -> Any:  # noqa: ANN401
    """Graph reducer: always keep the latest value (last-writer-wins)."""
    return new


def _append_list(current: list, new: list) -> list:
    """Graph reducer: accumulate items across invocations."""
    return (current or []) + (new or [])


class AgentState(TypedDict, total=False):
    """
    Stateful context passed between every LangGraph node.

    All agent output fields (``compact_research``, ``compact_strategy``,
    ``final_plan``) store **only** dense, ``<summary>``-tagged compressed
    text.  Raw data, CSV dumps, and verbose prose are never persisted.

    Attributes
    ----------
    user_prompt : str
        The original business prompt supplied by the end user.
    compact_research : str
        Dense compressed research brief produced by the Researcher.
        Must be wrapped in <summary></summary> tags.
    compact_strategy : str
        Dense compressed strategy produced by the Strategist.
        Must be wrapped in <summary></summary> tags.
    final_plan : str
        Dense compressed action plan produced by the Action Taker.
        Must be wrapped in <summary></summary> tags.
    current_agent : str
        The name of the agent that just executed (used for routing).
    critic_feedback : str
        The Critic's evaluation of the most recent step.
        Empty string when the Critic passes.
    critic_passed : bool
        Whether the Critic deemed the step acceptable.
    retry_count : int
        Number of times the current step has been retried.
    messages : list[str]
        Running log of human-readable progress messages (append-only).
    tools_output : dict
        Placeholder for structured tool output (will be populated later).
    follow_up_question : str
        A follow-up question from the user on an existing thread.
        When non-empty, the graph routes to the chat_agent instead of
        the strategy pipeline.
    follow_up_response : str
        The chat agent's response to the follow-up question.
    chat_history : list[str]
        Actual Q&A conversation turns for the follow-up chat path.
        Uses overwrite semantics so the summariser can truncate old turns.
    summary : str
        Rolling compressed summary of older chat history turns.
        Injected into the chat agent's context to maintain continuity.
    """

    user_prompt: Annotated[str, _overwrite]
    compact_research: Annotated[str, _overwrite]
    compact_strategy: Annotated[str, _overwrite]
    final_plan: Annotated[str, _overwrite]
    current_agent: Annotated[str, _overwrite]
    critic_feedback: Annotated[str, _overwrite]
    critic_passed: Annotated[bool, _overwrite]
    retry_count: Annotated[int, _overwrite]
    messages: Annotated[list[str], _append_list]
    tools_output: Annotated[dict, _overwrite]
    follow_up_question: Annotated[str, _overwrite]
    follow_up_response: Annotated[str, _overwrite]
    chat_history: Annotated[list[str], _overwrite]
    summary: Annotated[str, _overwrite]
