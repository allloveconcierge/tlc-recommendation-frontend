from typing import Callable
from fastapi import FastAPI

from app.api.custom_logging.logging_setup import logger


def start_app_handler(app: FastAPI) -> Callable:
    """application startup method"""

    def startup() -> None:
        logger.info("Running app start handler.")

    return startup


def stop_app_handler(app: FastAPI) -> Callable:
    """application shutdown method"""

    def shutdown() -> None:
        logger.info("Running app shutdown handler.")

    return shutdown
