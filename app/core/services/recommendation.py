import datetime
import json
import logging
import time
from typing import Union, List
import re
import os
import asyncio

from app.api.schemas.recommendations import (GeneralRecommendationItem,RecommendationRequest, RecommendationResponse)
from app.core.services.llm.base import LLMClient
from app.core.services.prompts.v1 import (create_recommendation_prompt)
from app.core.services.websearch import enrich_with_exa_async


logger = logging.getLogger(__name__)
class RecommendationService:
    """Service for generating recommendations using an LLM."""
    
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
    
    async def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """Generate recommendations based on a profile's preferences."""
        start_time = time.time()
        # Create a prompt for the LLM
        # Force direct mode in prompt to keep parser stable; we will enrich with web search separately if enabled
        prompt_request = request.model_copy(update={"web_search_enabled": False})
        prompt = create_recommendation_prompt(prompt_request)
        logger.info(f'Making call to LLM for recommendations')
        # logger.info(f'Making call to LLM for recommendations with prompt: {prompt}')
        llm_response = await self.llm_client.generate(
            prompt=prompt,
            # max_tokens=5000,
            temperature=0.7
        )

        # Parse the LLM response into recommendation items
        recommendations = self._parse_recommendations(llm_response["text"], request.count)

        # Enrich with enhanced web search (Exa) if enabled
        if getattr(request, "web_search_enabled", False):
            try:
                t0 = time.perf_counter()
                recommendations = await asyncio.wait_for(
                    enrich_with_exa_async(recommendations),
                    timeout=8
                )
                logger.info(f"Exa enrichment latency: {time.perf_counter() - t0:.3f}s")
            except asyncio.TimeoutError:
                logger.warning("Exa enrichment timed out; using base recommendations.")
            except Exception as ex:
                logger.warning(f"Exa enrichment failed; using base recommendations. Error: {ex}")

        end_time = time.time()
        execution_time = end_time - start_time
        logger.info(f"Recommendation took {execution_time:.6f} seconds to execute end-to-end.")

        # logger.info(f"Recommendations: {recommendations}")
        
        return RecommendationResponse(
            profile_id=request.profile.profile_id,
            recommendations=recommendations,
            generated_at=datetime.datetime.now().isoformat(),
            provider=self.llm_client.provider_name
        )

    def _parse_llm_response(self, llm_text: str) -> List[dict]:
        """Parse JSON from LLM response with fallback extraction."""
        try:
            parsed_response = json.loads(llm_text)
            
            # Handle case where LLM returns response wrapped in a 'categories' field
            if isinstance(parsed_response, dict) and 'categories' in parsed_response:
                logger.info("Found 'categories' field in LLM response, extracting recommendations")
                return parsed_response['categories']
            
            # Handle case where LLM returns direct array
            if isinstance(parsed_response, list):
                return parsed_response
                
            # If it's a dict but no 'categories' field, return empty list
            logger.warning(f"Unexpected response format: {type(parsed_response)}")
            return []
            
        except json.JSONDecodeError:
            logger.warning("Direct JSON parsing failed, attempting to extract JSON from response")
            # Try to extract JSON array
            json_match = re.search(r'\[.*\]', llm_text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    logger.error("Failed to parse extracted JSON")
            else:
                logger.error("No JSON array found in LLM response")
            return []

    def _parse_recommendations(self, llm_text: str, expected_count: int) -> list[GeneralRecommendationItem]:
        """Parse the LLM response text into RecommendationItem objects"""
        # Try to extract JSON from the response
        try:
            recommendations_data = self._parse_llm_response(llm_text)

            # Convert to RecommendationItem objects
            recommendations = []
            for item in recommendations_data[:expected_count]:
                # Create general recommendation item
                recommendation_item = GeneralRecommendationItem(
                    product=item["product"],
                    type=item["type"],
                    category=item["category"],
                    explanation=item["explanation"],
                    store=item["store"],
                    relevance_score=item.get("relevance_score", 0.5),
                    product_url=item.get("product_link") or f"https://{item.get('store', 'example.com')}",
                    product_image=item.get("image_url"),
                    product_cost=item.get("price", {}).get("display", "Price not available")
                )
                recommendations.append(recommendation_item)
            return recommendations
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            # Fallback: Create a default recommendation if parsing fails
            logger.error(f"Failed to create recommendation items: {e}")
            return []
            