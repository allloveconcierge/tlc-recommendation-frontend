import os
import asyncio
import logging
from typing import List, Optional

import aiohttp
from app.api.schemas.recommendations import GeneralRecommendationItem

logger = logging.getLogger(__name__)

EXA_ENDPOINT = "https://api.exa.ai/search"

def _base_domain(domain: str) -> str:
    if not domain:
        return ""
    parts = domain.lower().split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else domain.lower()

def _build_query(item: GeneralRecommendationItem) -> str:
    parts: List[str] = []
    if getattr(item, "product", None):
        parts.append(item.product)
    if getattr(item, "category", None):
        parts.append(item.category)
    dom = _base_domain(getattr(item, "store", "") or "")
    if dom:
        parts.append(f"site:{dom}")
    parts.append("UK")
    q = " ".join(p for p in parts if p).strip()
    return q or "gift UK"

async def enrich_with_exa_async(
    items: List[GeneralRecommendationItem],
    *,
    num_results: int = 3,
    concurrency: int = 6,
    timeout_s: float = 12.0,
) -> List[GeneralRecommendationItem]:
    """
    Fill missing product_url fields via Exa search.
    - Leaves items unchanged if no API key or items empty.
    - Only updates items whose product_url is missing or the default placeholder.
    """
    key = os.getenv("EXA_API_KEY")
    if not key or not items:
        return items

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    timeout = aiohttp.ClientTimeout(total=timeout_s)
    sem = asyncio.Semaphore(concurrency)

    async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session:
        async def fetch_one(it: GeneralRecommendationItem):
            try:
                if getattr(it, "product_url", None) and it.product_url != "https://example.com":
                    return
                query = _build_query(it)
                payload = {"query": query, "numResults": num_results}
                async with sem:
                    async with session.post(EXA_ENDPOINT, json=payload) as resp:
                        if resp.status != 200:
                            return
                        data = await resp.json()
                first = (data.get("results") or [None])[0]
                if not first:
                    return
                url = first.get("url") or first.get("link")
                if url:
                    it.product_url = url
            except Exception as e:
                logger.debug(f"Exa enrich error: {e}")

        await asyncio.gather(*(fetch_one(it) for it in items))

    return items

__all__ = ["enrich_with_exa_async"]