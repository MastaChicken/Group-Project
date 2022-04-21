"""Contains response models for the routes module.

Todo:
    * Add model for /validate_url
"""
from app.grobid.models.article import Article
from pydantic import BaseModel


class UploadResponse(BaseModel):
    """Object used as a response model for /upload endpoint."""

    article: Article
    common_words: list[tuple[str, int]]
    phrase_ranks: list[tuple[str, int]]
    summary: str
