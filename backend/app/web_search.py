"""Tavily-backed live web search for Hybrid chat mode."""

from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class WebSearchResult:
    title: str
    url: str
    content: str


async def search_web(query: str) -> list[WebSearchResult]:
    settings = get_settings()
    if not settings.tavily_api_key:
        logger.info("[web] Tavily is not configured; skipping live search")
        return []

    payload = {
        "query": query,
        "search_depth": settings.tavily_search_depth,
        "max_results": settings.tavily_max_results,
        "include_answer": False,
        "include_raw_content": False,
    }
    headers = {"Authorization": f"Bearer {settings.tavily_api_key}"}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post("https://api.tavily.com/search", json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("[web] Tavily search failed: %s", exc)
        return []

    return [
        WebSearchResult(
            title=str(item.get("title", "Web result")),
            url=str(item.get("url", "")),
            content=str(item.get("content", "")),
        )
        for item in data.get("results", [])
        if item.get("url") and item.get("content")
    ]


def build_web_context(results: list[WebSearchResult]) -> str:
    if not results:
        return ""
    blocks = ["LIVE WEB SOURCES (retrieved for this question):"]
    for index, result in enumerate(results, start=1):
        blocks.append(f"[{index}] {result.title}\nURL: {result.url}\n{result.content.strip()}")
    return "\n\n".join(blocks)
