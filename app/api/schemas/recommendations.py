from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any

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
    profile: Profile = Field(..., description='Information on Profile for Gift recommendation')
    location: str = Field(..., description="The location of the profile (i.e. gift recipient) that recommendation will be made for")
    upcoming_event: str = Field(..., description="The upcoming event to make recommendations for")
    profile_interests: List[str] = Field(
        ..., 
        description="Profile interests for generating recommendations"
    )
    context: Optional[str] = Field(
        None, 
        description="Additional context for the recommendation"
    )
    count: int = Field(
        10, 
        description="Number of recommendations to generate",
        ge=1,
        le=20
    )


class BaseRecommendationItem(BaseModel):
    title: str
    product: str
    explanation: str
    store: str
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    metadata: Optional[Dict[str, Any]] = None


class GeneralRecommendationItem(BaseRecommendationItem):
    category: str


class MomentRecommendationItem(BaseRecommendationItem):
    gift_type: str

class CategoriesResponse(BaseModel):
    categories: List[str]
    provider: str
class RecommendationResponse(BaseModel):
    profile_id: str
    recommendations: List[GeneralRecommendationItem]
    generated_at: str
    provider: str


class MomentsRecommendationRequest(BaseModel):
    profile: Profile = Field(..., description='Information on Profile for Gift recommendation')
    moment_type: str = Field(..., description="Milestone event to make recommendations for")
    moment_date: date = Field(..., description='The date of the milestone event to make recommendations for')
    profile_interests: List[str] = Field(
        ..., 
        description="Profile interests for generating recommendations"
    )
    context: Optional[str] = Field(
        None, 
        description="Additional context for the recommendation"
    )
    count: int = Field(
        10, 
        description="Number of recommendations to generate",
        ge=1,
        le=20
    )


    @validator('moment_date')
    def validate_future_date(cls, _date):
        today = date.today()
        if _date < today:
            raise ValueError('Moment Date must be today or in the future')

        return _date


class MomentsRecommendationResponse(BaseModel):
    profile_id: str
    milestone_event: str
    event_date: date
    recommendations: List[MomentRecommendationItem]
    generated_at: str
    provider: str

