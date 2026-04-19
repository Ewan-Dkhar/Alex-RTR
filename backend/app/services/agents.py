"""
services/agents.py
──────────────────
Individual agent node functions for the LangGraph multi-agent workflow.

Context-Compaction Architecture  (with Quad-Engine Tool Use)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Every agent is an **isolated sub-agent** that:

1. Receives the current ``AgentState``.
2. May invoke tools to gather data (Researcher only — for now).
3. NEVER outputs raw tool results, CSV rows, web scraping dumps, or filler.
4. Returns a **dense summary** wrapped in ``<summary></summary>`` tags
   containing exactly four sections.
5. Logs entry/exit at DEBUG level for full observability.

The Researcher has FOUR tools bound via ``bind_tools``:
  • ``search_local_contacts`` — Vector RAG over broker/lawyer/business CSVs
  • ``query_real_estate_data`` — Structured Pandas query over lucknow_data.csv
  • ``search_web_serper`` — Live Google search via Serper API
  • ``scrape_website_firecrawl`` — Web page scraping via Firecrawl API

The Critic enforces **accuracy**, **compaction**, and **raw-dump detection**
(including raw web content), rejecting any non-synthesized output.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

from app.models.agent_state import AgentState
from app.services.llm_client import get_llm
from app.services.tools import (
    RESEARCHER_TOOL_LIST,
    search_local_contacts,
    query_real_estate_data,
    search_web_serper,
    scrape_website_firecrawl,
)

logger = logging.getLogger(__name__)

# ── Lazy-initialised LLM singletons ─────────────────────────────────
_llm_base = None          # plain LLM (for Strategist, Action Taker, Critic)
_llm_with_tools = None    # LLM with Researcher tools bound


def _get_llm():
    """Return the base LLM (no tools bound)."""
    global _llm_base
    if _llm_base is None:
        _llm_base = get_llm()
    return _llm_base


def _get_researcher_llm():
    """Return the LLM with Researcher tools bound via bind_tools."""
    global _llm_with_tools
    if _llm_with_tools is None:
        base = get_llm()
        _llm_with_tools = base.bind_tools(RESEARCHER_TOOL_LIST)
        logger.debug("Researcher LLM bound with tools: %s",
                      [t.name for t in RESEARCHER_TOOL_LIST])
    return _llm_with_tools


# =====================================================================
#  PLACEHOLDER TOOL ARRAYS  (Strategist, ActionTaker, Critic — future)
# =====================================================================
STRATEGIST_TOOLS: list[Any] = []
ACTION_TAKER_TOOLS: list[Any] = []
CRITIC_TOOLS: list[Any] = []

# ── Tool dispatch map for executing tool calls ───────────────────────
_TOOL_MAP = {
    "search_local_contacts": search_local_contacts,
    "query_real_estate_data": query_real_estate_data,
    "search_web_serper": search_web_serper,
    "scrape_website_firecrawl": scrape_website_firecrawl,
}


# =====================================================================
#  SHARED COMPACTION DIRECTIVE (injected into every agent's system prompt)
# =====================================================================
_COMPACTION_DIRECTIVE = """
MANDATORY OUTPUT FORMAT — STRICT COMPLIANCE REQUIRED:
You are an isolated sub-agent in a multi-agent pipeline. You have NO memory
of previous conversations. You must NEVER output:
  • Raw tool results, raw JSON, or full CSV rows
  • Raw web scraping content, HTML fragments, or Markdown dumps from URLs
  • Conversational filler, greetings, or sign-offs
  • Verbose prose, disclaimers, or caveats
  • Bullet points that merely restate the prompt

No matter how much data you gather from the web or local CSVs, you must
NEVER output raw tool text. You must DIGEST all web data and local data
into a single, unified, highly dense summary.

Your ENTIRE response must be a single, hyper-compressed summary wrapped in
<summary></summary> tags containing EXACTLY these four numbered sections:

<summary>
1. Task Overview: [One sentence — what you were asked to do]
2. Current State: [2-3 sentences — what has been accomplished so far]
3. Important Discoveries: [Bullet list of hyper-specific data points,
   numbers, percentages, names, contacts from tools. NO vague statements.]
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


# ─────────────────────────────────────────────────────────────────────
#  Helper: execute a tool-call loop for agents with bound tools
# ─────────────────────────────────────────────────────────────────────
def _execute_tool_calls(llm_with_tools, messages: list, max_rounds: int = 3) -> str:
    """
    Run the LLM → tool-call → tool-result loop until the LLM produces a
    final text response (no more tool calls) or max_rounds is exceeded.

    Returns the final text content from the LLM.
    """
    for round_num in range(1, max_rounds + 1):
        logger.debug("  TOOL LOOP  ▸  round %d/%d — invoking LLM …", round_num, max_rounds)
        response: AIMessage = llm_with_tools.invoke(messages)

        # If the LLM made tool calls, execute them and feed results back
        if response.tool_calls:
            logger.debug("  TOOL LOOP  ▸  LLM requested %d tool call(s)", len(response.tool_calls))
            messages.append(response)

            for tc in response.tool_calls:
                tool_name = tc["name"]
                tool_args = tc["args"]
                tool_id = tc["id"]
                logger.debug("  TOOL LOOP  ▸  Executing tool '%s' with args: %s",
                             tool_name, tool_args)

                tool_fn = _TOOL_MAP.get(tool_name)
                if tool_fn is None:
                    result = f"Error: unknown tool '{tool_name}'"
                    logger.error("  TOOL LOOP  ▸  %s", result)
                else:
                    try:
                        result = tool_fn.invoke(tool_args)
                    except Exception as e:
                        result = f"Error executing {tool_name}: {e!s}"
                        logger.exception("  TOOL LOOP  ▸  Tool execution failed")

                logger.debug("  TOOL LOOP  ▸  Tool result length: %d chars", len(str(result)))
                messages.append(ToolMessage(content=str(result), tool_call_id=tool_id))
        else:
            # No tool calls — return the final text
            logger.debug("  TOOL LOOP  ▸  LLM returned final text (no tool calls)")
            return response.content

    # If we exhausted rounds, return whatever we have
    logger.warning("  TOOL LOOP  ▸  Max rounds (%d) exhausted — returning last response", max_rounds)
    return response.content


# =====================================================================
#  RESEARCHER NODE  (with tool use)
# =====================================================================
def researcher_node(state: AgentState) -> dict:
    """
    Gathers compressed market research using the dual-engine tools.

    Tools available:
      - search_local_contacts: Vector RAG over brokers/lawyers/business CSVs
      - query_real_estate_data: Structured Pandas query over lucknow_data.csv

    Inputs read  : user_prompt, critic_feedback (if retrying)
    Outputs set  : compact_research, current_agent, messages
    """
    logger.debug("=" * 60)
    logger.debug("RESEARCHER NODE  ▸  ENTRY")
    logger.debug("  user_prompt : %.200s", state.get("user_prompt", ""))
    logger.debug("  retry_count : %s", state.get("retry_count", 0))
    logger.debug("  tools       : %s", [t.name for t in RESEARCHER_TOOL_LIST])
    logger.debug("=" * 60)

    system_prompt = (
        "You are an expert market researcher and data analyst acting as an "
        "ISOLATED sub-agent with access to FOUR data tools.\n\n"
        "AVAILABLE TOOLS:\n"
        "1. search_local_contacts(query) — Search local brokers, lawyers, and "
        "   business types in Lucknow. Use for finding relevant contacts.\n"
        "2. query_real_estate_data(location, property_type, max_price_per_sqft) "
        "   — Query Lucknow real estate data. Use for property prices/trends.\n"
        "3. search_web_serper(query) — Live Google search via Serper. Use to "
        "   find competitor news, Lucknow regulatory updates, market trends, "
        "   or any data not available in local CSVs.\n"
        "4. scrape_website_firecrawl(url) — Read a specific webpage. Use to "
        "   deep-dive into a URL found via search (e.g., government pages, "
        "   competitor websites, market reports).\n\n"
        "INSTRUCTIONS:\n"
        "- Use LOCAL tools first for Lucknow-specific data.\n"
        "- Use WEB tools for live market intelligence, competitor news, or "
        "  regulatory information not in the local CSVs.\n"
        "- After gathering data, SYNTHESIZE it. Do NOT copy-paste raw tool output.\n"
        "- CRITICAL: No matter how much data you gather from the web or local "
        "  CSVs, you must NEVER output raw tool text. Digest ALL data into a "
        "  single, unified, highly dense summary.\n"
        "- Produce a hyper-compressed research brief covering: target demographics "
        "(with specific numbers), competitive landscape (name competitors/brokers), "
        "market size estimates (price per sqft figures), key local trends "
        "(with specific locations), and quantified risks or opportunities.\n\n"
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

    logger.debug("RESEARCHER  ▸  Starting tool-augmented LLM call …")
    raw = _execute_tool_calls(_get_researcher_llm(), messages)
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
        "You have NO access to tools or raw data. Using ONLY the compressed "
        "research provided, develop a hyper-compact business strategy.\n\n"
        "INSTRUCTIONS:\n"
        "- You must NEVER output raw data, JSON, or CSV rows.\n"
        "- Cover: value proposition, target market focus, pricing model "
        "(with specific numbers from the research), go-to-market approach, "
        "competitive differentiation (name specific competitors/brokers from "
        "the research), and measurable success metrics (KPIs with target "
        "numbers).\n\n"
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
        "You have NO access to tools or raw data. Using ONLY the compressed "
        "strategy provided, produce a hyper-compact, time-boxed action plan.\n\n"
        "INSTRUCTIONS:\n"
        "- You must NEVER output raw data, JSON, or CSV rows.\n"
        "- Include: specific tasks with owners, deadlines (exact dates or week "
        "numbers), resource requirements (dollar amounts or headcount), and "
        "KPIs with numeric targets.\n"
        "- Reference specific contacts, locations, and prices from the research "
        "and strategy where applicable.\n"
        "- Format as a numbered list grouped by phase.\n\n"
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
#  CRITIC NODE  (dual-gate: accuracy + compaction + raw-dump detection)
# =====================================================================
def critic_node(state: AgentState) -> dict:
    """
    Strict gatekeeper evaluating accuracy, compaction, AND raw-dump detection.

    The Critic inspects the most recent output based on ``current_agent``
    and evaluates three dimensions:

    1. **Accuracy** — Is the data hyper-local, mathematically sound, and
       does it reference specific contacts/locations from tools?
    2. **Compaction** — Is the output strictly a dense <summary> with no
       bloated text, conversational filler, or raw data dumps?
    3. **Raw Dump Detection** — Are there any raw JSON blobs, CSV rows,
       or unprocessed tool outputs present?

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
        "You must evaluate the provided artifact on THREE dimensions:\n\n"
        "1. ACCURACY:\n"
        "   - Does it contain hyper-local, specific data points?\n"
        "   - Are numbers, percentages, and metrics mathematically sound?\n"
        "   - Does it name specific contacts, competitors, locations, or markets?\n"
        "   - Is it grounded in the original prompt (not generic advice)?\n\n"
        "2. COMPACTION:\n"
        "   - Is the output strictly a dense summary?\n"
        "   - Does it follow the 4-section format (Task Overview, Current State,\n"
        "     Important Discoveries, Context to Preserve)?\n"
        "   - Is there ANY bloated text, conversational filler, greetings,\n"
        "     sign-offs, disclaimers, or verbose prose?\n"
        "   - Could any sentence be compressed further without losing meaning?\n\n"
        "3. RAW DUMP DETECTION:\n"
        "   - Does the artifact contain raw JSON blobs or arrays?\n"
        "   - Are there unprocessed tool outputs or full CSV rows?\n"
        "   - Is there raw web scraping content, HTML fragments, or Markdown\n"
        "     dumps that look copy-pasted from a URL?\n"
        "   - Is there any data that was NOT synthesized into a compact summary?\n\n"
        "YOUR RESPONSE FORMAT — STRICTLY ONE OF:\n"
        "  • If ALL three checks pass: respond with exactly PASS\n"
        "  • If ANY check fails: respond with FAIL: followed by a concise bullet\n"
        "    list of specific issues. For each issue, label it as ACCURACY,\n"
        "    COMPACTION, or RAW_DUMP violation and state what must be fixed.\n\n"
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

    logger.debug("CRITIC  ▸  Invoking LLM for triple-gate evaluation …")
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
