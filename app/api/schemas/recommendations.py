from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class Profile(BaseModel):
    profile_id: str = Field(..., description="Unique identifier of a profile that recommendation will be made for")
    age: int = Field(..., description="Age of the person in a profile that recommendation will be made for", gt=15)
    gender: Optional[Gender] = Field(..., description="Gender of the profile that recommendation will be made for")
    relationship: str = Field(..., description="Relationship to the gift giver to the profile (i.e the gift recipient)")


class RecommendationRequest(BaseModel):
    profile: Profile
    location: str = Field(..., description="The location of the profile (i.e. gift recipient) that recommendation will be made for")
    upcoming_event: str = Field(..., description="The upcoming event to make recommendations for")
    upcoming_event_date: Optional[str] = None
    profile_interests: List[str] = Field(
        ..., 
        description="List of interests that the profile has"
    )
    count: Optional[int] = 3
    notes: Optional[str] = None  # Free text notes about the loved one
    web_search_enabled: Optional[bool] = True  # Whether to enable web search for enhanced data


class GeneralRecommendationItem(BaseModel):
    product: str
    type: str  # "product" or "experience"
    category: str
    explanation: str
    store: str
    relevance_score: float
    product_url: Optional[str] = None
    product_image: Optional[str] = None
    product_cost: Optional[str] = None

class RecommendationResponse(BaseModel):
    profile_id: str
    recommendations: List[GeneralRecommendationItem]
    generated_at: str
    provider: str

