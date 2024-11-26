import os
import uvicorn
import requests
from app.asgi import init_server_config
from app.settings.settings import APISettings
from app.api.custom_logging.logging_setup import logger


def get_ip():
    """get ip of the instance hosting datadog agent"""
    # for local test, use localhost
    if os.environ.get("DD_ENV", "dev") == "dev":
        logger.info("APM is enabled to send traces to localhost")
        return "localhost"

    # for aws IP, use Amazon’s EC2 metadata endpoint (IMDSv1)
    r = requests.get("http://169.254.169.254/latest/meta-data/local-ipv4", timeout=5)
    logger.info(f"APM is enabled to send traces to {r.text}")
    return r.text


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
