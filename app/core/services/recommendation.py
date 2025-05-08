import json
import datetime
from typing import Dict, Any

from app.api.schemas.recommendations import RecommendationRequest, RecommendationResponse, RecommendationItem
from app.core.services.llm.base import LLMClient

class RecommendationService:
    """Service for generating recommendations using an LLM."""
    
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
        
    async def generate_recommendation(self, request: RecommendationRequest) -> RecommendationResponse:
        """
        Generate recommendations based on user preferences.
        
        Args:
            request: The recommendation request
            
        Returns:
            A recommendation response with recommended items
        """
        # Create a prompt for the LLM
        prompt = self._create_prompt(request)
        
        # Generate recommendations from the LLM
        llm_response = await self.llm_client.generate(
            prompt=prompt,
            max_tokens=5000,
            temperature=0.7
        )
        
        # Parse the LLM response into recommendation items
        recommendations = self._parse_recommendations(llm_response["text"], request.count)
        
        return RecommendationResponse(
            recommendations=recommendations,
            generated_at=datetime.datetime.now().isoformat(),
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
        
    def _parse_recommendations(self, llm_text: str, expected_count: int) -> list[RecommendationItem]:
        """
        Parse the LLM response text into RecommendationItem objects.
        
        This function handles various formats that the LLM might return and extracts
        the recommendations.
        
        Args:
            llm_text: The text response from the LLM
            expected_count: The expected number of recommendations
            
        Returns:
            A list of RecommendationItem objects
        """
        # Try to extract JSON from the response
        try:
            # Look for JSON array in the text
            start_idx = llm_text.find('[')
            end_idx = llm_text.rfind(']') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_text = llm_text[start_idx:end_idx]
                recommendations_data = json.loads(json_text)
                
                # Convert to RecommendationItem objects
                recommendations = []
                for item in recommendations_data[:expected_count]:
                    recommendations.append(
                        RecommendationItem(
                            title=item["title"],
                            description=item["description"],
                            relevance_score=item.get("relevance_score", 0.5),
                            metadata=item.get("metadata")
                        )
                    )
                return recommendations
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            # Fallback: Create a default recommendation if parsing fails
            return [
                RecommendationItem(
                    title=f"Recommendation {i+1}",
                    description="We were unable to parse the recommendation details.",
                    relevance_score=0.5
                ) 
                for i in range(min(expected_count, 3))
            ]
