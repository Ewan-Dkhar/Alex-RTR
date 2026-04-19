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
from app.services.llm_client import get_llm, get_llm_models
from app.core.config import settings
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
    """Return the LLM with Researcher tools bound via bind_tools.

    Because ``RunnableWithFallbacks`` does not expose ``.bind_tools()``,
    we bind tools on each individual ChatGroq model and then assemble
    a tool-equipped fallback chain.
    """
    global _llm_with_tools
    if _llm_with_tools is None:
        primary, backups = get_llm_models()
        tool_primary = primary.bind_tools(RESEARCHER_TOOL_LIST)
        tool_backups = [b.bind_tools(RESEARCHER_TOOL_LIST) for b in backups]
        _llm_with_tools = tool_primary.with_fallbacks(tool_backups)
        logger.debug("Researcher LLM bound with tools (fallback chain): %s",
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
You are the RAG Data Compressor. Your sole function is to take verbose
research, strategy, and planning texts and compress them into hyper-dense,
data-only summaries.

CRITICAL COMPACTION RULES — violating these causes pipeline failure:

1. ZERO META-TALK: Never narrate your own actions. Forbidden phrases:
   "I was asked to...", "The current state is...", "Here is the summary...",
   "Based on the research...".
2. NO NARRATIVE: Eliminate all conversational English, filler words, and
   transitional phrases.
3. TELEGRAPHIC STYLE: Use extreme shorthand. Output only raw metrics,
   core entities, numbers, and definitive actions.
4. NO REDUNDANCY: State each metric exactly once. Never repeat data
   across sections.

=== EXAMPLES ===

BAD (Bloated):
"1. Task Overview: I was asked to develop a business strategy for launching
a premium pet-food subscription service in Tier-2 Indian cities, targeting
25% of the 300,000 pet owners in Lucknow."

GOOD (Hyper-Compressed):
"Task: Launch premium pet-food subscription.
Target: Tier-2 cities (Primary: Lucknow).
TAM: 300k owners.
Capture Goal: 25%."

BAD (Bloated):
"To measure success, key performance indicators (KPIs) will include customer
acquisition costs, customer retention rates, and revenue growth, with target
numbers of 10,000 subscribers."

GOOD (Hyper-Compressed):
"KPIs: CAC, Retention (Target: 75%), YoY Revenue Growth (Target: +20%).
Milestone 1: 10k subscribers (Year 1)."

=== END EXAMPLES ===

OUTPUT FORMAT — wrap your ENTIRE response in <summary></summary> tags with
EXACTLY these four numbered sections:

<summary>
1. Task Overview: [One telegraphic sentence]
2. Current State: [2-3 telegraphic sentences — accomplishments only]
3. Important Discoveries: [Bullet list — hyper-specific data points,
   numbers, percentages, names, contacts. NO vague statements.]
4. Context to Preserve: [Strictly what the next pipeline agent needs.
   Nothing else.]
</summary>

If output exceeds this structure, compress harder. Token efficiency is
critical.
""".strip()


# =====================================================================
#  JSON COMPACTION DIRECTIVE (Action Taker — machine-parseable output)
# =====================================================================
_JSON_COMPACTION_DIRECTIVE = """
MANDATORY OUTPUT FORMAT — STRICT COMPLIANCE REQUIRED:
You are a headless data-extraction node in a high-speed multi-agent pipeline.
You have NO memory of previous conversations and NO conversational capabilities.

You must NEVER output:
  • Conversational filler, greetings, meta-commentary, or sign-offs
  • Explanations of your thought process or caveats
  • Raw tool results, unformatted CSV rows, or verbose prose
  • Any text whatsoever before or after the JSON payload

You must aggressively COMPRESS all input research and strategy data into
hyper-dense, telegraphic fragments. Token efficiency and machine-parseability
are your only metrics of success.

Your ENTIRE response must be a single, valid JSON object matching EXACTLY
this schema, with no deviations. You must output raw JSON only:

{
  "task": "[One 5-to-7 word sentence defining the ultimate objective]",
  "market_metrics": [
    "[Raw numbers, TAM, percentages. No narrative.]",
    "[e.g., 'TAM: 300k', 'Target: 25%']"
  ],
  "competitors": [
    "[Competitor name and estimated market share %]",
    "[e.g., 'PetShop: 15% share']"
  ],
  "logistics": [
    "[Core operational constraints, budgets, sqft sizes, specific locations]",
    "[e.g., 'Budget: ₹10M', 'Size: 5000 sqft']"
  ],
  "next_actions": [
    "[Strictly the immediate 2-3 steps required by the next agent in the pipeline]"
  ]
}

If your output is not valid JSON, or if you include even one word of
conversational text outside the braces, the entire pipeline will critically fail.
Compress ruthlessly.
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
#  Helper: extract JSON from Action Taker output
# ─────────────────────────────────────────────────────────────────────
_JSON_BLOCK_RE = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL)
_RAW_JSON_RE = re.compile(r"(\{.*\})", re.DOTALL)


def _extract_json(raw: str) -> str:
    """
    Extract a JSON object from the LLM response.

    Handles three cases:
    1. Clean raw JSON (ideal — Groq should produce this)
    2. JSON wrapped in ```json ... ``` Markdown fences (Groq bleed)
    3. JSON embedded in prose (worst case — extract first { ... })

    Returns the JSON string, or the raw response as fallback.
    """
    stripped = raw.strip()

    # Case 1: response is already clean JSON
    if stripped.startswith("{") and stripped.endswith("}"):
        try:
            json.loads(stripped)
            return stripped
        except json.JSONDecodeError:
            pass

    # Case 2: Markdown-fenced JSON block
    match = _JSON_BLOCK_RE.search(raw)
    if match:
        candidate = match.group(1).strip()
        try:
            json.loads(candidate)
            logger.warning("ACTION_TAKER  ▸  Stripped Markdown fences from JSON output")
            return candidate
        except json.JSONDecodeError:
            pass

    # Case 3: extract first { ... } blob
    match = _RAW_JSON_RE.search(raw)
    if match:
        candidate = match.group(1).strip()
        try:
            json.loads(candidate)
            logger.warning("ACTION_TAKER  ▸  Extracted JSON from prose wrapper")
            return candidate
        except json.JSONDecodeError:
            pass

    logger.error("ACTION_TAKER  ▸  Could not extract valid JSON — using raw response")
    return stripped


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
        "   — Query Lucknow real estate data (static CSV). Use for BASE "
        "   property prices/trends.\n"
        "3. search_web_serper(query) — Live Google search via Serper. Use to "
        "   find competitor news, Lucknow regulatory updates, market trends, "
        "   or any data not available in local CSVs.\n"
        "4. scrape_website_firecrawl(url) — Read a specific webpage. Use to "
        "   deep-dive into a URL found via search (e.g., government pages, "
        "   competitor websites, market reports).\n\n"
        "═══════════════════════════════════════════════════════════════\n"
        "  MANDATORY REASONING SEQUENCE — 'TRUST BUT VERIFY' WORKFLOW\n"
        "═══════════════════════════════════════════════════════════════\n\n"
        "Whenever you fetch a base price using query_real_estate_data, you\n"
        "MUST NOT accept that price as final truth. The CSV data may be stale.\n"
        "Follow this strict 3-step protocol:\n\n"
        "STEP 1 — FETCH BASE PRICE:\n"
        "  Call query_real_estate_data for the target location and property\n"
        "  type. Record the static base price per sqft internally.\n\n"
        "STEP 2 — VERIFY WITH LIVE WEB DATA:\n"
        "  Immediately call search_web_serper with a query formatted as:\n"
        "  'recent infrastructure development [LOCATION] Lucknow real estate "
        "news [CURRENT YEAR]'\n"
        "  Replace [LOCATION] with the actual target location (e.g.,\n"
        "  'Vibhuti Khand', 'Shaheed Path', 'Gomti Nagar Extension').\n\n"
        "STEP 3 — DYNAMIC PRICE ADJUSTMENT:\n"
        "  If the live web search reveals recent major infrastructural\n"
        "  changes (new highways, metro lines, malls, IT parks, commercial\n"
        "  hubs, government projects) that would realistically cause prices\n"
        "  to rise above the static CSV data, you MUST note this discrepancy.\n"
        "  In your <summary>, under '3. Important Discoveries', you must\n"
        "  explicitly report:\n"
        "    • The static base price from the CSV\n"
        "    • The newly discovered infrastructure news (specific project\n"
        "      names, dates, sources)\n"
        "    • A WARNING to the Strategist agent that the actual expected\n"
        "      rent/buy rate should be dynamically adjusted UPWARD based\n"
        "      on the live evidence\n"
        "  If no significant infrastructure changes are found, note that\n"
        "  the static price appears current and reliable.\n\n"
        "═══════════════════════════════════════════════════════════════\n\n"
        "GENERAL INSTRUCTIONS:\n"
        "- Use LOCAL tools first for Lucknow-specific data.\n"
        "- Use WEB tools for live market intelligence, competitor news, or "
        "  regulatory information not in the local CSVs.\n"
        "- After gathering data, SYNTHESIZE it. Do NOT copy-paste raw tool "
        "output or raw Serper JSON.\n"
        "- CRITICAL: Even with the extra web verification step, your final\n"
        "  output must STILL be strictly compacted into <summary> tags.\n"
        "  Never leak raw search results, URLs, or JSON.\n"
        "- Produce a hyper-compressed research brief covering: target "
        "demographics (with specific numbers), competitive landscape (name "
        "competitors/brokers), market size estimates (static base price AND "
        "dynamic adjustment if applicable), key local trends (with specific "
        "locations), and quantified risks or opportunities.\n\n"
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
        "You are a pragmatic operations expert acting as a HEADLESS "
        "data-extraction node. You have NO access to tools or raw data. "
        "Using ONLY the compressed strategy provided, produce a "
        "machine-parseable action plan as raw JSON.\n\n"
        "CRITICAL ACCURACY RULE: You MUST synthesize specific, hyper-local data points "
        "(e.g., actual Lucknow regions, realistic ROI percentages, specific budget figures) "
        "rather than generic placeholders. Ground all your JSON values in the provided strategy context.\n\n"
        f"{_JSON_COMPACTION_DIRECTIVE}"
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

    compact = _extract_json(raw)
    logger.debug("ACTION_TAKER  ▸  JSON output length: %d chars", len(compact))
    logger.debug("ACTION_TAKER  ▸  JSON preview: %.400s", compact)

    return {
        "final_plan": compact,
        "current_agent": "action_taker",
        "messages": [f"[Action Taker] Completed plan ({len(compact)} chars JSON)"],
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

    if current == "action_taker":
        format_rules = (
            "2. COMPACTION:\n"
            "   - Is the output STRICTLY raw, machine-parseable JSON?\n"
            "   - Is there ANY bloated text, conversational filler, greetings,\n"
            "     sign-offs, or verbose prose outside the JSON object?\n\n"
            "3. RAW DUMP DETECTION:\n"
            "   - (EXEMPTION: The Action Taker MUST output JSON. Do NOT penalize it for being JSON.)\n"
            "   - Are there unprocessed tool outputs or full CSV rows inside the JSON?\n"
            "   - Is there any data that was NOT properly structured into the JSON schema?\n\n"
        )
    else:
        format_rules = (
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
        )

    system_prompt = (
        "You are a STRICT quality-assurance and token-efficiency gatekeeper "
        "for a multi-agent business accelerator pipeline.\n\n"
        "You must evaluate the provided artifact on THREE dimensions:\n\n"
        "1. ACCURACY:\n"
        "   - Does it contain hyper-local, specific data points?\n"
        "   - Are numbers, percentages, and metrics mathematically sound?\n"
        "   - Does it name specific contacts, competitors, locations, or markets?\n"
        "   - Is it grounded in the original prompt (not generic advice)?\n\n"
        f"{format_rules}"
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


# =====================================================================
#  SUMMARIZE CONVERSATION NODE  (memory management for chat follow-ups)
# =====================================================================
def summarize_conversation_node(state: AgentState) -> dict:
    """
    Compress older chat_history turns into a rolling summary to keep
    the context window bounded.

    Logic
    ~~~~~
    1. Read ``chat_history`` and ``summary`` from state.
    2. Keep the **N most recent** turns intact (N = threshold // 2, min 2).
    3. Extract the older turns and send them (plus any existing summary)
       to the LLM for compression.
    4. Return the new ``summary`` and the trimmed ``chat_history``.

    Because ``chat_history`` uses ``_overwrite`` semantics, returning a
    shorter list directly replaces the old one in the checkpoint.

    Inputs read  : chat_history, summary
    Outputs set  : chat_history, summary, messages
    """
    chat_history = state.get("chat_history", []) or []
    existing_summary = state.get("summary", "") or ""

    logger.debug("=" * 60)
    logger.debug("SUMMARIZE_CONVERSATION NODE  ▸  ENTRY")
    logger.debug("  chat_history length : %d", len(chat_history))
    logger.debug("  existing_summary    : %.200s", existing_summary)
    logger.debug("=" * 60)

    # Keep the most recent turns for conversational continuity
    keep_count = max(settings.message_summary_threshold // 2, 2)
    old_turns = chat_history[:-keep_count]
    recent_turns = chat_history[-keep_count:]

    logger.debug("SUMMARIZE  ▸  Compressing %d old turns, keeping %d recent",
                 len(old_turns), len(recent_turns))

    # ── Build the summarisation prompt ───────────────────────────────
    system_prompt = (
        "You are a conversation summariser for a business strategy AI system. "
        "Your job is to produce an ultra-compressed summary of older chat "
        "exchanges so the system can maintain context without storing every "
        "message.\n\n"
        "RULES:\n"
        "- Output a single dense paragraph, max 150 words.\n"
        "- Capture: key questions asked, decisions made, specific data points "
        "  referenced (numbers, names, locations, prices).\n"
        "- Do NOT include greetings, meta-commentary, or filler.\n"
        "- If an existing summary is provided, MERGE it with the new "
        "  information — do not repeat what's already captured."
    )

    user_content = ""
    if existing_summary:
        user_content += f"EXISTING SUMMARY:\n{existing_summary}\n\n"
    user_content += "OLDER CHAT TURNS TO SUMMARIZE:\n"
    user_content += "\n".join(old_turns)

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content),
    ]

    logger.debug("SUMMARIZE  ▸  Invoking LLM for summary generation …")
    response = _get_llm().invoke(messages)
    new_summary = response.content.strip()

    logger.debug("SUMMARIZE  ▸  New summary length: %d chars", len(new_summary))
    logger.debug("SUMMARIZE  ▸  Summary preview: %.300s", new_summary)

    return {
        "summary": new_summary,
        "chat_history": recent_turns,
        "messages": [
            f"[Summarizer] Compressed {len(old_turns)} old turns → "
            f"{len(new_summary)} chars summary, kept {len(recent_turns)} recent"
        ],
    }


# =====================================================================
#  CHAT AGENT NODE  (follow-up questions on existing threads)
# =====================================================================
def chat_agent_node(state: AgentState) -> dict:
    """
    Answers a follow-up question using the full pipeline context stored
    in the checkpointed state.

    The chat agent has READ access to:
      - compact_research
      - compact_strategy
      - final_plan
      - user_prompt (original)
      - summary (rolling summary of older chat turns)
      - chat_history (recent Q&A turns)

    It does NOT re-run tools. It synthesises an answer from what the
    pipeline has already produced.

    Inputs read  : follow_up_question, user_prompt, compact_research,
                   compact_strategy, final_plan, summary, chat_history
    Outputs set  : follow_up_response, current_agent, messages,
                   chat_history
    """
    question = state.get("follow_up_question", "")
    existing_summary = state.get("summary", "") or ""
    chat_history = state.get("chat_history", []) or []

    logger.debug("=" * 60)
    logger.debug("CHAT_AGENT NODE  ▸  ENTRY")
    logger.debug("  follow_up_question : %.200s", question)
    logger.debug("  user_prompt        : %.200s", state.get("user_prompt", ""))
    logger.debug("  chat_history turns : %d", len(chat_history))
    logger.debug("  summary length     : %d", len(existing_summary))
    logger.debug("=" * 60)

    # ── Build system prompt with optional summary context ────────────
    summary_section = ""
    if existing_summary:
        summary_section = (
            "\nCONVERSATION SUMMARY (older exchanges):\n"
            f"{existing_summary}\n"
        )

    history_section = ""
    if chat_history:
        history_section = (
            "\nRECENT CONVERSATION HISTORY:\n"
            + "\n".join(chat_history[-6:])  # Show at most 6 recent turns
            + "\n"
        )

    system_prompt = (
        "You are a helpful business advisor answering a follow-up question. "
        "You have access to the FULL context of a previously completed "
        "multi-agent business strategy pipeline.\n\n"
        "CONTEXT PROVIDED:\n"
        "- Original Business Prompt\n"
        "- Compressed Research (market data, contacts, pricing)\n"
        "- Compressed Strategy (value prop, GTM, KPIs)\n"
        "- Final Action Plan (phased tasks, deadlines, metrics)\n"
        + ("- Conversation Summary (older exchanges)\n" if existing_summary else "")
        + ("- Recent Conversation History\n" if chat_history else "")
        + "\nINSTRUCTIONS:\n"
        "- Answer the user's follow-up question accurately using ONLY the "
        "  context provided below.\n"
        "- Be concise but thorough. Reference specific data points, names, "
        "  prices, and locations from the context.\n"
        "- Do NOT hallucinate information not present in the context.\n"
        "- If the context does not contain enough information to answer, "
        "  say so clearly.\n"
        "- Keep your response under 500 words."
    )

    user_content = (
        f"ORIGINAL BUSINESS PROMPT:\n{state.get('user_prompt', 'N/A')}\n\n"
        f"COMPRESSED RESEARCH:\n{state.get('compact_research', 'N/A')}\n\n"
        f"COMPRESSED STRATEGY:\n{state.get('compact_strategy', 'N/A')}\n\n"
        f"FINAL ACTION PLAN:\n{state.get('final_plan', 'N/A')}\n"
        f"{summary_section}"
        f"{history_section}\n"
        f"═══════════════════════════════════════════════════════════════\n"
        f"USER FOLLOW-UP QUESTION:\n{question}"
    )

    llm_messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_content),
    ]

    logger.debug("CHAT_AGENT  ▸  Invoking LLM …")
    response = _get_llm().invoke(llm_messages)
    answer = response.content.strip()

    logger.debug("CHAT_AGENT  ▸  Response length: %d chars", len(answer))
    logger.debug("CHAT_AGENT  ▸  Response preview: %.400s", answer)

    # ── Append this Q&A pair to chat_history ─────────────────────────
    updated_history = list(chat_history)
    updated_history.append(f"Q: {question}")
    updated_history.append(f"A: {answer}")

    return {
        "follow_up_response": answer,
        "current_agent": "chat_agent",
        "chat_history": updated_history,
        "messages": [f"[Chat Agent] Answered follow-up ({len(answer)} chars)"],
    }

