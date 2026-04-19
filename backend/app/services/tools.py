"""
services/tools.py
─────────────────
Quad-Engine Data Pipeline tools for the Researcher agent.

Engine 1 — Vector RAG:
    Embeds ``lucknow_brokers.csv``, ``lucknow_lawyers.csv``, and
    ``lucknow_business_types.csv`` into an in-memory FAISS vector store
    using ``OllamaEmbeddings(model="nomic-embed-text")``.
    Exposes ``search_local_contacts`` tool.

Engine 2 — Structured Query:
    Loads ``lucknow_data.csv`` into a global Pandas DataFrame.
    Exposes ``query_real_estate_data`` tool.

Engine 3 — Web Search (Serper):
    Live Google search via the Serper API.
    Exposes ``search_web_serper`` tool.
    Tool-level compaction: returns only title+snippet of top 3-4 results.

Engine 4 — Web Scraping (Firecrawl):
    Scrapes a URL into Markdown via the Firecrawl API.
    Exposes ``scrape_website_firecrawl`` tool.
    Tool-level compaction: truncates to max 3,000 characters.

All tools return **minified compact strings** — never raw JSON dumps or
full page content.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional

import re

import httpx
import pandas as pd
from langchain_core.tools import tool

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Resolve data directory ──────────────────────────────────────────
_DATA_DIR = Path(__file__).resolve().parents[2] / "data"
logger.debug("Tools data directory: %s", _DATA_DIR)


# =====================================================================
#  ENGINE 1 — VECTOR RAG  (FAISS + OllamaEmbeddings)
# =====================================================================
_vector_store = None  # lazy-loaded


def _build_vector_store():
    """
    Load the three contact/context CSVs, concatenate each row into a
    single text document, embed with nomic-embed-text, and store in FAISS.
    """
    from langchain_community.vectorstores import FAISS
    from langchain_ollama import OllamaEmbeddings

    logger.info("Building FAISS vector store from contact CSVs …")

    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    csv_files = [
        ("lucknow_brokers.csv", "broker"),
        ("lucknow_lawyers.csv", "lawyer"),
        ("lucknow_business_types.csv", "business_type"),
    ]

    documents: list[str] = []
    metadatas: list[dict] = []

    for fname, source_type in csv_files:
        fpath = _DATA_DIR / fname
        if not fpath.exists():
            logger.warning("CSV not found: %s — skipping", fpath)
            continue

        df = pd.read_csv(fpath)
        logger.debug("  Loaded %s: %d rows, cols=%s", fname, len(df), df.columns.tolist())

        for _, row in df.iterrows():
            # Concatenate all columns into one searchable string
            text = " | ".join(
                f"{col}: {val}" for col, val in row.items() if pd.notna(val)
            )
            documents.append(text)
            metadatas.append({"source": fname, "type": source_type})

    if not documents:
        logger.error("No documents to embed — vector store will be empty")
        return None

    logger.info("Embedding %d documents with nomic-embed-text …", len(documents))
    store = FAISS.from_texts(documents, embeddings, metadatas=metadatas)
    logger.info("FAISS vector store ready ✓  (%d vectors)", len(documents))
    return store


def _get_vector_store():
    global _vector_store
    if _vector_store is None:
        _vector_store = _build_vector_store()
    return _vector_store


@tool
def search_local_contacts(query: str) -> str:
    """Search Lucknow brokers, lawyers, and business-type data for contacts
    and local business intelligence matching the query. Returns top 3 compact
    results."""
    logger.debug("TOOL search_local_contacts  ▸  query='%s'", query)

    store = _get_vector_store()
    if store is None:
        logger.warning("Vector store unavailable — returning empty result")
        return "No local contact data available."

    results = store.similarity_search(query, k=3)
    logger.debug("TOOL search_local_contacts  ▸  %d results returned", len(results))

    # Minify: strip whitespace, join compactly
    compact_results = []
    for i, doc in enumerate(results, 1):
        # Remove excess whitespace from the document content
        text = " ".join(doc.page_content.split())
        source = doc.metadata.get("type", "unknown")
        compact_results.append(f"[{i}/{len(results)} {source}] {text}")

    output = "\n".join(compact_results)
    logger.debug("TOOL search_local_contacts  ▸  output length: %d chars", len(output))
    logger.debug("TOOL search_local_contacts  ▸  output: %.500s", output)
    return output


# =====================================================================
#  ENGINE 2 — STRUCTURED QUERY  (Pandas DataFrame)
# =====================================================================
_real_estate_df: pd.DataFrame | None = None


def _load_real_estate_data() -> pd.DataFrame:
    """Load lucknow_data.csv into a global DataFrame."""
    fpath = _DATA_DIR / "lucknow_data.csv"
    if not fpath.exists():
        logger.error("lucknow_data.csv not found at %s", fpath)
        return pd.DataFrame()

    df = pd.read_csv(fpath)
    logger.info("Loaded lucknow_data.csv: %d rows × %d cols", len(df), len(df.columns))
    logger.debug("  Columns: %s", df.columns.tolist())
    return df


def _get_real_estate_df() -> pd.DataFrame:
    global _real_estate_df
    if _real_estate_df is None:
        _real_estate_df = _load_real_estate_data()
    return _real_estate_df


@tool
def query_real_estate_data(
    location: str,
    property_type: str,
    max_price_per_sqft: Optional[float] = None,
) -> str:
    """Query the Lucknow real estate dataset by location, property type,
    and optional max price per sqft. Returns top 5 matching properties as
    a compact minified string."""
    logger.debug(
        "TOOL query_real_estate_data  ▸  location='%s'  property_type='%s'  max_price=%s",
        location, property_type, max_price_per_sqft,
    )

    df = _get_real_estate_df()
    if df.empty:
        logger.warning("Real estate DataFrame is empty")
        return "No real estate data available."

    # ── Apply filters (case-insensitive partial match) ────────────────
    mask = pd.Series([True] * len(df), index=df.index)

    if location:
        mask &= df["location"].str.contains(location, case=False, na=False)
        logger.debug("  After location filter: %d rows", mask.sum())

    if property_type:
        mask &= df["property_type"].str.contains(property_type, case=False, na=False)
        logger.debug("  After property_type filter: %d rows", mask.sum())

    if max_price_per_sqft is not None:
        mask &= df["estimated_price_per_sqft"] <= max_price_per_sqft
        logger.debug("  After price filter: %d rows", mask.sum())

    filtered = df[mask]

    if filtered.empty:
        logger.debug("  No results found after filtering")
        return f"No properties found for location='{location}', type='{property_type}', max_price={max_price_per_sqft}."

    # ── Sort by price, take top 5, minify ────────────────────────────
    top = filtered.sort_values("estimated_price_per_sqft").head(5)
    logger.debug("  Returning top %d of %d matching rows", len(top), len(filtered))

    # Convert to compact dict list (selected columns only)
    compact_cols = [
        "id", "location", "sub_locality", "property_type",
        "estimated_price_per_sqft", "demand_level", "roi_category",
        "zone_type", "growth_potential", "best_for",
    ]
    # Only include columns that exist
    compact_cols = [c for c in compact_cols if c in top.columns]

    records = top[compact_cols].to_dict("records")

    # Minified JSON — no extra whitespace
    output = json.dumps(records, separators=(",", ":"), default=str)

    logger.debug("TOOL query_real_estate_data  ▸  output length: %d chars", len(output))
    logger.debug("TOOL query_real_estate_data  ▸  output: %.500s", output)
    return output

# =====================================================================
#  ENGINE 3 — WEB SEARCH  (Serper API)
# =====================================================================
_SERPER_ENDPOINT = "https://google.serper.dev/search"


@tool
def search_web_serper(query: str) -> str:
    """Search the live web using Google via the Serper API. Returns the
    title and snippet of the top 3-4 organic results as a compact string.
    Use this to find competitor news, Lucknow regulations, market trends,
    or any live data not available in local CSVs."""
    logger.debug("TOOL search_web_serper  ▸  query='%s'", query)

    api_key = settings.serper_api_key
    if not api_key or api_key.startswith("YOUR_"):
        logger.warning("Serper API key not configured — returning fallback")
        return "Web search unavailable: SERPER_API_KEY not set in .env"

    headers = {
        "X-API-KEY": api_key,
        "Content-Type": "application/json",
    }
    payload = {"q": query, "num": 4}

    try:
        resp = httpx.post(_SERPER_ENDPOINT, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.exception("TOOL search_web_serper  ▸  API call failed")
        return f"Web search error: {e!s}"

    # ── Tool-level compaction: extract only title+snippet, top 3-4 ───
    organic = data.get("organic", [])[:4]
    logger.debug("TOOL search_web_serper  ▸  %d organic results", len(organic))

    compact_lines = []
    for i, item in enumerate(organic, 1):
        title = item.get("title", "").strip()
        snippet = " ".join(item.get("snippet", "").split())  # collapse whitespace
        compact_lines.append(f"[{i}] {title}: {snippet}")

    output = "\n".join(compact_lines) if compact_lines else "No results found."
    logger.debug("TOOL search_web_serper  ▸  output length: %d chars", len(output))
    logger.debug("TOOL search_web_serper  ▸  output: %.500s", output)
    return output


# =====================================================================
#  ENGINE 4 — WEB SCRAPING  (Firecrawl API)
# =====================================================================
_FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v1/scrape"
_SCRAPE_MAX_CHARS = 3000


@tool
def scrape_website_firecrawl(url: str) -> str:
    """Scrape a webpage into readable Markdown using the Firecrawl API.
    Returns the core text content, truncated to 3000 characters max.
    Use this to read specific competitor pages, government regulation
    documents, or market reports."""
    logger.debug("TOOL scrape_website_firecrawl  ▸  url='%s'", url)

    api_key = settings.firecrawl_api_key
    if not api_key or api_key.startswith("YOUR_"):
        logger.warning("Firecrawl API key not configured — returning fallback")
        return "Web scraping unavailable: FIRECRAWL_API_KEY not set in .env"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "url": url,
        "formats": ["markdown"],
    }

    try:
        resp = httpx.post(_FIRECRAWL_ENDPOINT, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.exception("TOOL scrape_website_firecrawl  ▸  API call failed")
        return f"Web scraping error: {e!s}"

    # ── Extract markdown content ─────────────────────────────────────
    md_content = data.get("data", {}).get("markdown", "")
    if not md_content:
        logger.warning("TOOL scrape_website_firecrawl  ▸  No markdown in response")
        return "Scraping returned empty content."

    # ── Tool-level compaction: strip whitespace, truncate to 3000 chars
    md_content = re.sub(r'\n{3,}', '\n\n', md_content)  # collapse blank lines
    md_content = md_content.strip()

    if len(md_content) > _SCRAPE_MAX_CHARS:
        md_content = md_content[:_SCRAPE_MAX_CHARS] + "\n… [TRUNCATED]"
        logger.debug("TOOL scrape_website_firecrawl  ▸  Truncated to %d chars", _SCRAPE_MAX_CHARS)

    logger.debug("TOOL scrape_website_firecrawl  ▸  output length: %d chars", len(md_content))
    logger.debug("TOOL scrape_website_firecrawl  ▸  output: %.500s", md_content)
    return md_content


# ── Public list for binding to agents ────────────────────────────────
RESEARCHER_TOOL_LIST = [
    search_local_contacts,
    query_real_estate_data,
    search_web_serper,
    scrape_website_firecrawl,
]
