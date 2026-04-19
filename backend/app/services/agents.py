"""
services/agents.py
──────────────────
Individual agent node functions for the LangGraph multi-agent workflow.

Context-Compaction Architecture
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Every agent is an **isolated sub-agent** that:

1. Receives the current ``AgentState``.
2. NEVER outputs raw data, full CSV rows, or conversational filler.
3. Returns a **dense summary** wrapped in ``<summary></summary>`` tags
   containing exactly four sections:
     - 1. Task Overview
     - 2. Current State
     - 3. Important Discoveries (hyper-specific data points)
     - 4. Context to Preserve (strictly what the next agent needs)
4. Logs entry/exit at DEBUG level for full observability.

The Critic enforces both **accuracy** and **compaction**, rejecting any
output that contains bloated text or raw dumps.

Placeholder ``tools`` lists are defined per-agent for future expansion.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.models.agent_state import AgentState
from app.services.llm_client import get_llm

logger = logging.getLogger(__name__)

# ── Lazy-initialised, module-level LLM singleton ────────────────────────
_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        _llm = get_llm()
    return _llm


# =====================================================================
#  PLACEHOLDER TOOL ARRAYS — to be populated in the next step
# =====================================================================
RESEARCHER_TOOLS: list[Any] = []
STRATEGIST_TOOLS: list[Any] = []
ACTION_TAKER_TOOLS: list[Any] = []
CRITIC_TOOLS: list[Any] = []


# =====================================================================
#  SHARED COMPACTION DIRECTIVE (injected into every agent's system prompt)
# =====================================================================
_COMPACTION_DIRECTIVE = """
MANDATORY OUTPUT FORMAT — STRICT COMPLIANCE REQUIRED:
You are an isolated sub-agent in a multi-agent pipeline. You have NO memory
of previous conversations. You must NEVER output:
  • Raw data, full CSV rows, or database records
  • Conversational filler, greetings, or sign-offs
  • Verbose prose, disclaimers, or caveats
  • Bullet points that merely restate the prompt

Your ENTIRE response must be a single, hyper-compressed summary wrapped in
<summary></summary> tags containing EXACTLY these four numbered sections:

<summary>
1. Task Overview: [One sentence — what you were asked to do]
2. Current State: [2-3 sentences — what has been accomplished so far]
3. Important Discoveries: [Bullet list of hyper-specific data points,
   numbers, percentages, names, and metrics. NO vague statements.]
4. Context to Preserve: [Strictly what the next agent in the pipeline
   needs to know to do its job. Nothing else.]
</summary>

If you cannot fit your output into this structure, you are being too verbose.
Compress harder. Token efficiency is critical.
""".strip()


# ─────────────────────────────────────────────────────────────────────
#  Helper: extract <summary> content (or use raw response as fallback)
# ─────────────────────────────────────────────────────────────────────
_SUMMARY_RE = re.compile(r"<summary>(.*?)</summary>", re.DOTALL)


def _extract_summary(raw: str) -> str:
    """Pull the content inside <summary> tags, fallback to full text."""
    match = _SUMMARY_RE.search(raw)
    if match:
        return match.group(1).strip()
    logger.warning("Agent output missing <summary> tags — using raw response as fallback")
    return raw.strip()


# =====================================================================
#  RESEARCHER NODE
# =====================================================================
def researcher_node(state: AgentState) -> dict:
    """
    Gathers compressed market research for the user prompt.

    Inputs read  : user_prompt, critic_feedback (if retrying)
    Outputs set  : compact_research, current_agent, messages
    """
    logger.debug("=" * 60)
    logger.debug("RESEARCHER NODE  ▸  ENTRY")
    logger.debug("  user_prompt : %.200s", state.get("user_prompt", ""))
    logger.debug("  retry_count : %s", state.get("retry_count", 0))
    logger.debug("  tools       : %s", RESEARCHER_TOOLS)
    logger.debug("=" * 60)

    system_prompt = (
        "You are an expert market researcher and data analyst acting as an "
        "ISOLATED sub-agent. Given a business idea or prompt, produce a "
        "hyper-compressed research brief covering: target demographics "
        "(with specific numbers), competitive landscape (name competitors), "
        "market size estimates (dollar figures), key industry trends "
        "(with dates/percentages), and quantified risks or opportunities.\n\n"
        f"{_COMPACTION_DIRECTIVE}"
    )

    critic_feedback = state.get("critic_feedback", "")
    user_content = f"Business Prompt:\n{state['user_prompt']}"
    if critic_feedback:
        user_content += (
            f"\n\n--- CRITIC FEEDBACK (you MUST address every point and "
            f"re-compress your output) ---\n{critic_feedback}"
        )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content),
    ]

    logger.debug("RESEARCHER  ▸  Invoking LLM with %d messages …", len(messages))
    response = _get_llm().invoke(messages)
    raw = response.content
    logger.debug("RESEARCHER  ▸  Raw LLM response length: %d chars", len(raw))

    compact = _extract_summary(raw)
    logger.debug("RESEARCHER  ▸  Compact summary length: %d chars", len(compact))
    logger.debug("RESEARCHER  ▸  Compact preview: %.400s", compact)

    return {
        "compact_research": compact,
        "current_agent": "researcher",
        "messages": [f"[Researcher] Completed research ({len(compact)} chars compacted)"],
    }


# =====================================================================
#  STRATEGIST NODE
# =====================================================================
def strategist_node(state: AgentState) -> dict:
    """
    Drafts a compressed business strategy from the compact research.

    Inputs read  : user_prompt, compact_research, critic_feedback (if retrying)
    Outputs set  : compact_strategy, current_agent, messages
    """
    logger.debug("=" * 60)
    logger.debug("STRATEGIST NODE  ▸  ENTRY")
    logger.debug("  user_prompt      : %.200s", state.get("user_prompt", ""))
    logger.debug("  compact_research : %.200s", state.get("compact_research", ""))
    logger.debug("  retry_count      : %s", state.get("retry_count", 0))
    logger.debug("  tools            : %s", STRATEGIST_TOOLS)
    logger.debug("=" * 60)

    system_prompt = (
        "You are an elite business strategist acting as an ISOLATED sub-agent. "
        "Using ONLY the compressed research provided, develop a hyper-compact "
        "business strategy covering: value proposition, target market focus, "
        "pricing model (with specific numbers), go-to-market approach, "
        "competitive differentiation, and measurable success metrics (KPIs "
        "with target numbers).\n\n"
        f"{_COMPACTION_DIRECTIVE}"
    )

    critic_feedback = state.get("critic_feedback", "")
    user_content = (
        f"Business Prompt:\n{state['user_prompt']}\n\n"
        f"Compressed Research:\n{state.get('compact_research', 'N/A')}"
    )
    if critic_feedback:
        user_content += (
            f"\n\n--- CRITIC FEEDBACK (you MUST address every point and "
            f"re-compress your output) ---\n{critic_feedback}"
        )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content),
    ]

    logger.debug("STRATEGIST  ▸  Invoking LLM with %d messages …", len(messages))
    response = _get_llm().invoke(messages)
    raw = response.content
    logger.debug("STRATEGIST  ▸  Raw LLM response length: %d chars", len(raw))

    compact = _extract_summary(raw)
    logger.debug("STRATEGIST  ▸  Compact summary length: %d chars", len(compact))
    logger.debug("STRATEGIST  ▸  Compact preview: %.400s", compact)

    return {
        "compact_strategy": compact,
        "current_agent": "strategist",
        "messages": [f"[Strategist] Completed strategy ({len(compact)} chars compacted)"],
    }


# =====================================================================
#  ACTION TAKER NODE
# =====================================================================
def action_taker_node(state: AgentState) -> dict:
    """
    Converts compact strategy into a compressed, step-by-step action plan.

    Inputs read  : user_prompt, compact_research, compact_strategy,
                   critic_feedback (if retrying)
    Outputs set  : final_plan, current_agent, messages
    """
    logger.debug("=" * 60)
    logger.debug("ACTION_TAKER NODE  ▸  ENTRY")
    logger.debug("  user_prompt       : %.200s", state.get("user_prompt", ""))
    logger.debug("  compact_strategy  : %.200s", state.get("compact_strategy", ""))
    logger.debug("  retry_count       : %s", state.get("retry_count", 0))
    logger.debug("  tools             : %s", ACTION_TAKER_TOOLS)
    logger.debug("=" * 60)

    system_prompt = (
        "You are a pragmatic operations expert acting as an ISOLATED sub-agent. "
        "Using ONLY the compressed strategy provided, produce a hyper-compact, "
        "time-boxed action plan. Include: specific tasks with owners, deadlines "
        "(exact dates or week numbers), resource requirements (dollar amounts "
        "or headcount), and KPIs with numeric targets. Format as a numbered "
        "list grouped by phase.\n\n"
        f"{_COMPACTION_DIRECTIVE}"
    )

    critic_feedback = state.get("critic_feedback", "")
    user_content = (
        f"Business Prompt:\n{state['user_prompt']}\n\n"
        f"Compressed Research:\n{state.get('compact_research', 'N/A')}\n\n"
        f"Compressed Strategy:\n{state.get('compact_strategy', 'N/A')}"
    )
    if critic_feedback:
        user_content += (
            f"\n\n--- CRITIC FEEDBACK (you MUST address every point and "
            f"re-compress your output) ---\n{critic_feedback}"
        )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content),
    ]

    logger.debug("ACTION_TAKER  ▸  Invoking LLM with %d messages …", len(messages))
    response = _get_llm().invoke(messages)
    raw = response.content
    logger.debug("ACTION_TAKER  ▸  Raw LLM response length: %d chars", len(raw))

    compact = _extract_summary(raw)
    logger.debug("ACTION_TAKER  ▸  Compact summary length: %d chars", len(compact))
    logger.debug("ACTION_TAKER  ▸  Compact preview: %.400s", compact)

    return {
        "final_plan": compact,
        "current_agent": "action_taker",
        "messages": [f"[Action Taker] Completed plan ({len(compact)} chars compacted)"],
    }


# =====================================================================
#  CRITIC NODE  (dual-gate: accuracy + compaction)
# =====================================================================
def critic_node(state: AgentState) -> dict:
    """
    Strict gatekeeper evaluating BOTH accuracy AND token efficiency.

    The Critic inspects the most recent output based on ``current_agent``
    and evaluates two dimensions:

    1. **Accuracy** — Is the data hyper-local, mathematically sound, and
       does it contain specific numbers, names, and metrics?
    2. **Compaction** — Is the output strictly a dense summary with no
       bloated text, conversational filler, or raw data dumps?

    Output format:
    - ``PASS`` — if both accuracy and compaction checks pass.
    - ``FAIL: [specific feedback]`` — if either check fails.

    Inputs read  : current_agent, compact_research, compact_strategy,
                   final_plan, retry_count
    Outputs set  : critic_feedback, critic_passed, retry_count, messages
    """
    current = state.get("current_agent", "unknown")
    retry = state.get("retry_count", 0)

    logger.debug("=" * 60)
    logger.debug("CRITIC NODE  ▸  ENTRY")
    logger.debug("  evaluating  : %s", current)
    logger.debug("  retry_count : %d", retry)
    logger.debug("  tools       : %s", CRITIC_TOOLS)
    logger.debug("=" * 60)

    # ── Determine what artifact to evaluate ──────────────────────────
    if current == "researcher":
        artifact = state.get("compact_research", "")
        artifact_label = "Compact Research"
    elif current == "strategist":
        artifact = state.get("compact_strategy", "")
        artifact_label = "Compact Strategy"
    elif current == "action_taker":
        artifact = state.get("final_plan", "")
        artifact_label = "Final Plan"
    else:
        logger.warning("CRITIC  ▸  Unknown agent '%s' — auto-passing.", current)
        return {
            "critic_feedback": "",
            "critic_passed": True,
            "messages": [f"[Critic] Unknown agent '{current}' — auto-pass"],
        }

    logger.debug("CRITIC  ▸  Artifact to evaluate (%s): %.300s", artifact_label, artifact)

    system_prompt = (
        "You are a STRICT quality-assurance and token-efficiency gatekeeper "
        "for a multi-agent business accelerator pipeline.\n\n"
        "You must evaluate the provided artifact on TWO dimensions:\n\n"
        "1. ACCURACY:\n"
        "   - Does it contain hyper-local, specific data points?\n"
        "   - Are numbers, percentages, and metrics mathematically sound?\n"
        "   - Does it name specific competitors, demographics, or markets?\n"
        "   - Is it grounded in the original prompt (not generic advice)?\n\n"
        "2. COMPACTION:\n"
        "   - Is the output strictly a dense summary?\n"
        "   - Does it follow the 4-section format (Task Overview, Current State,\n"
        "     Important Discoveries, Context to Preserve)?\n"
        "   - Is there ANY bloated text, conversational filler, greetings,\n"
        "     sign-offs, disclaimers, or raw data dumps?\n"
        "   - Could any sentence be compressed further without losing meaning?\n\n"
        "YOUR RESPONSE FORMAT — STRICTLY ONE OF:\n"
        "  • If BOTH accuracy and compaction pass: respond with exactly PASS\n"
        "  • If EITHER fails: respond with FAIL: followed by a concise bullet\n"
        "    list of specific issues. For each issue, state whether it is an\n"
        "    ACCURACY or COMPACTION violation and what exactly must be fixed.\n\n"
        "NEVER add preamble, greetings, or explanation beyond the above format."
    )

    user_content = (
        f"Original Prompt:\n{state.get('user_prompt', '')}\n\n"
        f"Artifact Type: {artifact_label}\n"
        f"Artifact Content:\n{artifact}"
    )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content),
    ]

    logger.debug("CRITIC  ▸  Invoking LLM for dual-gate evaluation …")
    response = _get_llm().invoke(messages)
    evaluation = response.content.strip()
    logger.debug("CRITIC  ▸  Raw evaluation: %.500s", evaluation)

    passed = evaluation.upper().startswith("PASS")

    logger.debug("CRITIC  ▸  Decision: %s", "PASS ✓" if passed else "FAIL ✗")
    if not passed:
        logger.debug("CRITIC  ▸  Feedback: %.500s", evaluation)

    return {
        "critic_feedback": "" if passed else evaluation,
        "critic_passed": passed,
        "retry_count": 0 if passed else retry + 1,
        "messages": [
            f"[Critic] {artifact_label} → {'PASS ✓' if passed else 'FAIL ✗'}"
            + (f" (retry #{retry + 1})" if not passed else "")
        ],
    }
