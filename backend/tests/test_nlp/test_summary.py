"""Unit tests for the summary module."""


import en_core_web_sm
from pytest import raises

from app.nlp.summary import Bart, TextRank


class TestTextRank:
    """Unit tests for TextRank class."""

    model = en_core_web_sm.load()

    def test_add_missing_pipe(self):
        """Constructor adds textrank pipeline if missing."""
        TextRank("test", self.model)
        assert self.model.has_pipe("textrank") is True

    def test_empty_text(self):
        """Text must not be an empty string."""
        with raises(RuntimeError, match="Text cannot be empty"):
            TextRank("", self.model)


class TestBart:
    """Unit tests for Bart class."""

    def test_mising_api_token(self):
        """Hugging Face API token cannot be empty string."""
        with raises(RuntimeError, match="API token is missing"):
            Bart("", "", 0)

    def test_empty_text(self):
        """Text must not be an empty string."""
        with raises(RuntimeError, match="Text cannot be empty"):
            Bart("test", "", 0)
