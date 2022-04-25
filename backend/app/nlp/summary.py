"""Represents the summarisation methods."""
import httpx

from spacy.language import Language
from spacy.tokens.doc import Doc
from spacy.tokens.span import Span
from transformers.models.bart.tokenization_bart import BartTokenizer


class TextRank:
    """Rank sentences from text using Textrank."""

    model: Language
    doc: Doc

    def __init__(self, model: Language, text: str) -> None:
        """Create Doc object using spaCy model with textrank pipeline.

        Args:
            model: spaCy Language model
            text: text to be ranked
        """
        if not model.has_pipe("textrank"):
            model.add_pipe("textrank")
        self.model = model
        self.doc = model(text)

    @property
    def sentences(self) -> list[str]:
        """Ranked sentences in order."""
        sentences: list[str] = []
        sentence: Span
        for sentence in self.doc._.textrank.summary(
            preserve_order=True,
            level="paragraph",
        ):
            sentences.append(sentence.text)

        return sentences


class Bart:
    """Create summary from text using BART model."""

    TOKEN_LIMIT = 3143  # floor(1024 / 0.3)
    MAX_TOKENS = 1024  # BART token limit
    MIN_TOKENS = 682  # floor(1024 / 1.5)
    MIN_MULTIPLIER = 0.2
    MAX_MULTIPLIER = 0.3

    api_token: str
    text: str
    use_gpu: bool
    model_id: str
    min_length: int
    max_length: int

    def __init__(
        self,
        api_token: str,
        text: str,
        use_gpu: bool = True,
        model_id: str = "facebook/bart-large-cnn",
    ) -> None:
        """Define variables and tokenize text.

        Args:
            api_token: used for HuggingFace API authorization
            text: text to be summarised
            use_gpu: use GPU instead of CPU for inference
            model_id: ID of model according to HuggingFace
        """
        self.api_token = api_token
        self.text = text
        self.use_gpu = use_gpu
        self.model_id = model_id
        tokenizer = BartTokenizer.from_pretrained(model_id)
        tokens = tokenizer.tokenize(text)
        if (no_tokens := len(tokens)) >= self.TOKEN_LIMIT:
            self.min_length = self.MIN_TOKENS
            self.max_length = self.MAX_TOKENS
        else:
            self.min_length = int(no_tokens * self.MIN_MULTIPLIER)
            self.max_length = int(no_tokens * self.MAX_MULTIPLIER)

    @property
    async def summary(self) -> str:
        """
        Use HuggingFace Inference API to get summary of text.

        Raises:
            HTTPStatusError: if request fails

        Returns:
            summarised text or empty string
        """
        headers = {"Authorization": f"Bearer {self.api_token}"}
        url = f"https://api-inference.huggingface.co/models/{self.model_id}"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url=url,
                headers=headers,
                data={
                    "inputs": self.text,
                    "parameters": {
                        "max_length": self.max_length,
                        "min_length": self.min_length,
                    },
                    "options": {"use_gpu": self.use_gpu},
                },
            )

        response.raise_for_status()

        r_json = response.json()
        text = ""

        if r_json:
            text = r_json[0]["summary_text"]

        return text
