from pydantic import BaseSettings
from functools import lru_cache

from pydantic.networks import AnyHttpUrl


class Settings(BaseSettings):
    """App settings."""

    # Required
    grobid_api_url: AnyHttpUrl

    class Config:
        """Use .env for environment variables."""

        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    """Read from file once, then from cache."""
    return Settings()
