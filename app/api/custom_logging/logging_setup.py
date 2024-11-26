import logging
import os
from app.api.custom_logging.log_json_formatter import LogJsonFormatter

logger = logging.getLogger()

if os.environ.get("RESET_LOGGER_HANDLERS", "False") == "True":
    logger.handlers.clear()

logger.setLevel(os.environ.get("LOGLEVEL", "INFO"))
handler = logging.StreamHandler()
formatter = LogJsonFormatter()
handler.setFormatter(formatter)
logger.handlers = []  # clear existing handlers
logger.addHandler(handler)
