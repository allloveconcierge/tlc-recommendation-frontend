from pathlib import Path
from typing import Any, Optional, Union

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

