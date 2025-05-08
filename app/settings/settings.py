from pathlib import Path
from typing import Any, Optional, Union

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic_settings.sources import DotenvType, ENV_FILE_SENTINEL


class EnvSettings(BaseSettings):
    """Base settings class for all environments."""

    env: str = "PROD"

    def __init__(
        self,
        _case_sensitive: Optional[bool] = None,
        _env_prefix: Optional[str] = None,
        _env_file: Optional[DotenvType] = ENV_FILE_SENTINEL,
        _env_file_encoding: Optional[str] = None,
        _env_nested_delimiter: Optional[str] = None,
        _secrets_dir: Optional[Union[str, Path]] = None,
        **values: Any
    ) -> None:
        super().__init__(
            _case_sensitive,
            _env_prefix,
            _env_file,
            _env_file_encoding,
            _env_nested_delimiter,
            _secrets_dir,
            **values,
        )

    def is_dev_env(self) -> bool:
        """Check if the environment is DEV."""
        return self.env == "DEV"


class APISettings(BaseSettings):
    """Settings for the API."""

    model_config = SettingsConfigDict(
        # env_file=ENV_FILE_SENTINEL,
        env_file=".env",
        extra="ignore",
        # case_sensitive=True,
        env_ignore_empty=True
    )

    auto_reload: Optional[bool] = False


class LLMSettings(BaseSettings):
    # Application settings
    app_name: str = "LLM Service API"
    debug: bool = False
    
    # LLM provider settings
    # ToDo: make this configurable in client initialization
    llm_provider: str = "gemini"  # Options: claude, openai, gemini, gemma, flash
    
    # Claude settings
    claude_api_key: str = ""
    claude_model: str = "claude-3-7-sonnet-20250219"
    
    # OpenAI settings
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    
    # Google settings
    google_api_key: str = ""
    gemini_model: str = "gemini-2.5-pro-preview-03-25"
    
    # Gemma settings
    gemma_api_key: str = ""
    gemma_model: str = "gemma-7b"
    
    # Flash settings
    flash_api_key: str = ""
    flash_model: str = "gemini-2.5-flash-preview-04-17"
    
    # Timeout settings
    request_timeout: int = 30  # seconds
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra="ignore"

@lru_cache()
def get_settings():
    return LLMSettings()

