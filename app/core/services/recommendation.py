import datetime
import json
import logging
import time
from typing import Union

from app.api.schemas.recommendations import (
    CategoriesResponse,
    GeneralRecommendationItem,
    MomentRecommendationItem,
    MomentsRecommendationRequest,
    MomentsRecommendationResponse,
    RecommendationRequest,
    RecommendationResponse,
)
from app.core.services.llm.base import LLMClient
from app.core.services.prompts.v1 import (
    create_category_determination_prompt,
    create_general_recommendation_prompt,
    create_recommendation_for_moment_prompt,
)


logger = logging.getLogger(__name__)
class RecommendationService:
    """Service for generating recommendations using an LLM."""
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
        
    async def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """
        Generate general recommendations based on a profile's preferences.
        
        Args:
            request: The recommendation request
            
        Returns:
            A recommendation response with recommended items
        """
        start_time = time.time()

        # Create a prompt for the LLM
        response = await self._get_categories(request)
        logger.info(f'Creating prompt with categories {response}')
        prompt = create_general_recommendation_prompt(request, response.categories)
        

        # Generate recommendations from the LLM
        logger.info(f'Making call to LLM for recommendations with prompt: {prompt}')
        llm_response = await self.llm_client.generate(
            prompt=prompt,
            # max_tokens=5000,
            temperature=0.7
        )

        # Parse the LLM response into recommendation items
        recommendations = self._parse_recommendations(llm_response["text"], request.count)

        end_time = time.time()
        execution_time = end_time - start_time
        logger.info(f"Recommendation took {execution_time:.6f} seconds to execute end-to-end.")

        return RecommendationResponse(
            profile_id=request.profile.profile_id,
            recommendations=recommendations,
            generated_at=datetime.datetime.now().isoformat(),
            provider=self.llm_client.provider_name
        )


    async def generate_recommendations_for_moments(self, request: MomentsRecommendationRequest) -> MomentsRecommendationResponse:
        """
        Generates moment-specific recommendations based on a profile's preferences.
        
        Args:
            request: The recommendation request
            recomendation_type: the type of recommendation to be made; available options are general or moments
            
        Returns:
            A recommendation response with recommended items
        """
        start_time = time.time()

        # Create a prompt for the LLM
        prompt = create_recommendation_for_moment_prompt(request)
        

        # Generate recommendations from the LLM
        logger.info(f'Making call to LLM for momemt-specific recommendations with prompt: {prompt}')
        llm_response = await self.llm_client.generate(
            prompt=prompt,
            # max_tokens=5000,
            temperature=0.7
        )

        # Parse the LLM response into recommendation items
        recommendations = self._parse_recommendations(
            llm_response["text"],
            request.count,
            recommendation_type='moments'
        )

        end_time = time.time()
        execution_time = end_time - start_time
        logger.info(f"Recommendation took {execution_time:.6f} seconds to execute end-to-end.")

        return MomentsRecommendationResponse(
            profile_id=request.profile.profile_id,
            milestone_event=request.moment_type,
            event_date=request.moment_date,
            recommendations=recommendations,
            generated_at=datetime.datetime.now().isoformat(),
            provider=self.llm_client.provider_name
        )


    async def _get_categories(self, request: RecommendationRequest) -> CategoriesResponse:
        """
        Generates categories for gift/experience recommendations based on a profile
        
        Args:
            request: The recommendation request
            
        Returns:
            A categories response with a list of categories to be used in generating recommendations
        """
        prompt = create_category_determination_prompt(request)

        # Generate categories from the LLM
        logger.info(f'Making call to LLM to fetch relevant categories with prompt: {prompt}')
        _categories = await self.llm_client.generate(
            prompt=prompt,
            # max_tokens=5000,
            temperature=0.7
        )
        categories = json.loads(self._parse_llm_response(_categories['text']))

        return CategoriesResponse(
            categories=categories,
            provider=self.llm_client.provider_name
        )

        
    def _create_prompt(self, request: RecommendationRequest) -> str:
        """Create a prompt for the LLM based on the recommendation request."""
        return f"""
        Your task is to generate {request.count} recommendations in the category of {request.category}.
        
        User preferences: {json.dumps(request.user_preferences)}
        
        Additional context: {request.context if request.context else "No additional context provided."}
        
        Please provide a list of recommendations with the following JSON structure:
        [
            {{
                "title": "Recommendation title",
                "description": "Detailed description explaining why this was recommended",
                "relevance_score": 0.95,  # A score between 0 and 1 indicating how well it matches preferences
                "metadata": {{
                    "key1": "value1",
                    "key2": "value2"
                }}
            }},
            ... more recommendations
        ]
        
        Ensure all recommendations are relevant to the user's preferences.
        """


    def _parse_llm_response(self, llm_text: str) -> str:
        """
        Extracts and parses the LLM response text into usable format

        Args:
            llm_text: The text response from the LLM

        Returns:
            A json_text string
        """

        # Look for JSON array in the text
        start_idx = llm_text.find('[')
        end_idx = llm_text.rfind(']') + 1

        if start_idx != -1 and end_idx != -1:
            json_text = llm_text[start_idx:end_idx]

        return json_text


    def _parse_recommendations(self, llm_text: str, expected_count: int, recommendation_type: str = 'general') -> list[Union[GeneralRecommendationItem, MomentRecommendationItem]]:
        """
        Parse the LLM response text into RecommendationItem objects.
        
        This function handles various formats that the LLM might return and extracts
        the recommendations.
        
        Args:
            llm_text: The text response from the LLM
            expected_count: The expected number of recommendations
            recommendation_type: Either 'general' or 'moments'

        Returns:
            A list of RecommendationItem objects
        """
        # Try to extract JSON from the response
        try:
            json_text = self._parse_llm_response(llm_text)
            recommendations_data = json.loads(json_text)

            # Convert to RecommendationItem objects
            recommendations = []

            for item in recommendations_data[:expected_count]:
                # Base fields that are common to both types
                base_fields = {
                    'title': item["title"],
                    'product': item["product"],
                    'explanation': item["explanation"],
                    'store': item["store"],
                    'relevance_score': item.get("relevance_score", 0.5),
                    'metadata': item.get("metadata")
                }

                # Create type-specific recommendation
                if recommendation_type == 'general':
                    recommendation_item = GeneralRecommendationItem(
                        **base_fields,
                        category=item.get("category", "General")
                    )
                elif recommendation_type == 'moments':
                    recommendation_item = MomentRecommendationItem(
                        **base_fields,
                        gift_type=item.get("gift_type", "General Gift")
                    )
                else:
                    raise ValueError(f"Unknown recommendation_type: {recommendation_type}")
                recommendations.append(recommendation_item)

            return recommendations
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            # Fallback: Create a default recommendation if parsing fails
            default_recommendations = []

            for i in range(min(expected_count, 3)):
                if recommendation_type == 'general':
                    default_item = GeneralRecommendationItem(
                        title=f"Recommendation {i+1}",
                        product="",
                        category="General",
                        explanation="",
                        store="",
                        relevance_score=0.01
                    )
                elif recommendation_type == 'moments':
                    default_item = MomentRecommendationItem(
                        title=f"Recommendation {i+1}",
                        product="",
                        gift_type="Special Moment Gift",
                        explanation="",
                        store="",
                        relevance_score=0.01
                    )
                else:
                    raise ValueError(f"Unknown recommendation_type: {recommendation_type}")
                    
                default_recommendations.append(default_item)

            return default_recommendations
