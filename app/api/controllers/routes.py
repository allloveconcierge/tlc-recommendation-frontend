import os
from asyncio import Semaphore

from fastapi import APIRouter, HTTPException, responses
from starlette.requests import Request

from app.api.schemas.output import Healthcheck

router = APIRouter()

# Create a semaphore with a limit of 50
semaphore = Semaphore(os.environ.get("CONCURRENCY", 50))


@router.get("/health", response_model=Healthcheck)
async def check_health():
    """Returns healthcheck"""

    heartbeat = Healthcheck(isAlive=True)
    return responses.ORJSONResponse(heartbeat.model_dump())


@router.get("/recommend")
async def get_recommendations():
    """Fetches gift recommendations"""

    return {}

