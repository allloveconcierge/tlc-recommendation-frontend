import os
import uvicorn
import requests
from app.asgi import init_server_config
from app.settings.settings import APISettings
from app.api.custom_logging.logging_setup import logger


if __name__ == "__main__":
    config = init_server_config()
    uvicorn.run(
        app=config.application,
        host=config.host,
        port=config.port,
        workers=config.workers,
        # log_config=config.log_config,
        reload=APISettings().auto_reload,
    )
