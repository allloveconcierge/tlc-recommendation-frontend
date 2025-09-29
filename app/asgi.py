import os
import uvicorn

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.event_handlers import start_app_handler, stop_app_handler
from app.api.controllers.routes import router

# Import frontend serving for Replit deployment
try:
    from serve_frontend import setup_frontend_serving
    FRONTEND_SERVING_AVAILABLE = True
except ImportError:
    FRONTEND_SERVING_AVAILABLE = False

load_dotenv()

def get_app() -> FastAPI:
    """method to set and get FASTAPI app"""
    fast_app = FastAPI(
        title="TLC Gift Recommendation API",
        version="0.1.0",
        description="ML API for generating TLC recommendations for gifts and experiences.",
        debug=False,
    )
    
    # Add CORS middleware FIRST, before routes
    allowed_origins_str = os.environ.get("ALLOWED_ORIGINS", "*")
    
    # Handle CORS origins - allow all for now to fix the issue
    if allowed_origins_str == "*":
        cors_origins = ["*"]
    else:
        cors_origins = [origin.strip() for origin in allowed_origins_str.split(",")]
        # Always include the frontend domain
        if "https://tlc-recommendation-frontend.netlify.app" not in cors_origins:
            cors_origins.append("https://tlc-recommendation-frontend.netlify.app")
    
    print(f"CORS Origins: {cors_origins}")  # Debug logging
    
    fast_app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    
    # Add routes after CORS middleware
    fast_app.include_router(router=router)
    fast_app.add_event_handler("startup", start_app_handler(fast_app))
    fast_app.add_event_handler("shutdown", stop_app_handler(fast_app))
    
    # Setup frontend serving for Replit deployment
    if FRONTEND_SERVING_AVAILABLE and os.environ.get("SERVE_FRONTEND", "false").lower() == "true":
        setup_frontend_serving(fast_app)
    
    return fast_app


app = get_app()


class Config:
    # pylint: disable=too-many-instance-attributes
    """
    Instantiating application server configurations
    """

    def __init__(self) -> None:
        self._host = None
        self._port = None
        self._application = None
        self._workers = None
        self._timeout_keep_alive = None
        self._log_level = None
        self._log_config = None

    @property
    def log_level(self) -> str:
        """
        Returns:
        str: loglevel
        """
        return self._log_level

    @property
    def host(self) -> str:
        """returns hostname

        Returns:
            [str]: [hostname]
        """
        return self._host

    @property
    def port(self) -> int:
        """returns port number

        Returns:
            int: port number
        """
        return self._port

    @property
    def application(self) -> str:
        """returns application object

        Returns:
            str: fastapi application
        """
        return self._application

    @property
    def workers(self) -> int:
        """returns worker count

        Returns:
            int: worker count
        """
        return self._workers

    @property
    def timeout_keep_alive(self) -> int:
        """
        Returns:
        int: timeout in seconds"""
        return self._timeout_keep_alive

    @property
    def log_config(self) -> int:
        """returns log_config

        Returns:
            dict: log_config
        """
        return self._log_config

    @host.setter
    def host(self, hostname: str):
        self._host = hostname

    @port.setter
    def port(self, port: int):
        self._port = port

    @application.setter
    def application(self, application: str):
        self._application = application

    @workers.setter
    def workers(self, workers: int):
        self._workers = workers

    @timeout_keep_alive.setter
    def timeout_keep_alive(self, timeout_keep_alive: int):
        self._timeout_keep_alive = timeout_keep_alive

    @log_level.setter
    def log_level(self, log_level: str):
        self._log_level = log_level

    @log_config.setter
    def log_config(self, log_config: dict):
        self._log_config = log_config


def init_server_config() -> Config:
    """initializes application server with custom configurations

    Returns:
        Config: custom configuration
    """
    config = Config()
    config.application = "app.asgi:app"
    config.host = "0.0.0.0"
    config.port = int(os.environ.get("PORT", 8000))
    config.workers = int(os.environ.get("WORKERS", 1))
    # The app keep alive time must be longer than the aws elastic load balancer idle time, which is 125 in prod
    # Ref: https://repost.aws/knowledge-center/elb-alb-troubleshoot-502-errors
    config.timeout_keep_alive = int(os.environ.get("TIMEOUT", 130))
    config.log_level = os.environ.get("LOGLEVEL", "INFO")
    # Define a new json log formatter for uvicorn. This ends up as a python logging.LogFormatter
    log_config = uvicorn.config.LOGGING_CONFIG
    # "class" which is () needs to be the absolute path to the class, using imported LogJsonFormatter didn't work
    log_config["formatters"]["json"] = {"()": "app.api.custom_logging.log_json_formatter.LogJsonFormatter"}

    # Now configure uvicorn default and access type logs to use the json formatter
    log_config["handlers"]["default"]["formatter"] = "json"
    log_config["handlers"]["access"]["formatter"] = "json"

    config.log_config = log_config

    return config
