import os
from asyncio import Semaphore

from fastapi import APIRouter, Depends, HTTPException, responses
from starlette.requests import Request

from app.api.schemas.output import Healthcheck
from app.api.schemas.recommendations import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.settings.settings import get_settings
from app.core.services.llm.llm_factory import get_llm_client
from app.core.services.recommendation import RecommendationService

router = APIRouter()

# Create a semaphore with a limit of 50
semaphore = Semaphore(os.environ.get("CONCURRENCY", 50))

llm_settings = get_settings()

# Dependency to get LLM client
def get_recommendation_service():
    llm_client = get_llm_client(llm_settings)
    return RecommendationService(llm_client)


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
        result = await service.generate_recommendation(request_params)
        return responses.ORJSONResponse(result)
    except Exception as e:
        print(f'The following error occurred: {e}')
        raise HTTPException(status_code=500, detail=str(e))


