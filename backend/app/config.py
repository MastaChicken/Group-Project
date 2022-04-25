"""Represents the app settings."""
from functools import lru_cache

from pydantic import BaseSettings
from pydantic.networks import AnyHttpUrl


class Settings(BaseSettings):
    """App settings."""

    # Required
    grobid_api_url: AnyHttpUrl

    # Optional
    huggingface_api_token: str = ""
    grobid_api_timeout: int = 15
    huggingface_api_timeout: int = 60

    class Config:
        """Use .env for environment variables."""

        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    """Read from file once, then from cache."""
    return Settings()
