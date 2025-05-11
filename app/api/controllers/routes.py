import os
from asyncio import Semaphore

from fastapi import APIRouter, Depends, HTTPException, responses
from starlette.requests import Request

from app.api.schemas.output import Healthcheck
from app.api.schemas.recommendations import (
    MomentsRecommendationRequest,
    RecommendationRequest,
    RecommendationResponse,
)
from app.api.schemas.summarization import (
    SummarizationRequest,
    SummarizationResponse,
)
from app.settings.settings import get_settings
from app.core.services.llm.llm_factory import get_llm_client
from app.core.services.recommendation import RecommendationService
from app.core.services.summarization import SummarizationService

router = APIRouter()

# Create a semaphore with a limit of 50
semaphore = Semaphore(os.environ.get("CONCURRENCY", 50))

llm_settings = get_settings()

# Dependency to get LLM client
def get_recommendation_service():
    llm_client = get_llm_client(llm_settings)
    return RecommendationService(llm_client)

def get_summarization_service():
    llm_client = get_llm_client(llm_settings)
    return SummarizationService(llm_client)


@router.get("/health", response_model=Healthcheck)
async def check_health():
    """Returns healthcheck"""

    heartbeat = Healthcheck(isAlive=True)
    return responses.ORJSONResponse(heartbeat.model_dump())


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(
    request: Request,
    request_params: RecommendationRequest,
    service: RecommendationService = Depends(get_recommendation_service)
):
    """Fetches gift recommendations"""

    try:
        result = await service.generate_recommendations(request_params)
        return responses.ORJSONResponse(result.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommend_for_moment", response_model=RecommendationResponse)
async def get_recommendations_for_moments(
    request: Request,
    request_params: MomentsRecommendationRequest,
    service: RecommendationService = Depends(get_recommendation_service)
):
    """Fetches gift recommendations"""

    try:
        result = await service.generate_recommendations_for_moments(request_params)
        return responses.ORJSONResponse(result.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summarize", response_model=SummarizationResponse)
async def summarize_user_profile(
    request: Request,
    request_params: SummarizationRequest,
    service: SummarizationService = Depends(get_summarization_service)
):
    try:
        result = await service.generate_summary(request_params)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

