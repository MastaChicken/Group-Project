"""Contains response models for the routes module.

Todo:
    * Add model for /validate_url
"""
from pydantic import BaseModel

from app.grobid.models.article import Article


class UploadResponse(BaseModel):
    """Object used as a response model for /upload endpoint."""

    article: Article
    common_words: list[tuple[str, int]]
    phrase_ranks: list[tuple[str, int]]
    summary: list[str]
