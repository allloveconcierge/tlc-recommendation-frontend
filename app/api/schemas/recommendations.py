from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class RecommendationRequest(BaseModel):
    user_preferences: List[str] = Field(
        ..., 
        description="User preferences for generating recommendations"
    )
    context: Optional[str] = Field(
        None, 
        description="Additional context for the recommendation"
    )
    category: str = Field(
        ..., 
        description="Category for recommendation (e.g., movies, books, products)"
    )
    count: int = Field(
        10, 
        description="Number of recommendations to generate",
        ge=1,
        le=20
    )

class RecommendationItem(BaseModel):
    title: str
    description: str
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    metadata: Optional[Dict[str, Any]] = None

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    generated_at: str
    provider: str
