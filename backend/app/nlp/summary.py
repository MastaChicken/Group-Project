"""Represents the summarisation methods."""
import httpx
import json

from spacy.language import Language
from spacy.tokens.doc import Doc
from spacy.tokens.span import Span
from transformers.models.bart.tokenization_bart import BartTokenizer


class TextRank:
    """Rank sentences from text using Textrank."""

    model: Language
    doc: Doc

    def __init__(self, text: str, model: Language) -> None:
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

    MAX_TOKENS = 1024  # BART token limit
    MAX_LENGTH = 307  # floor(MAX_TOKENS, 0.3)
    MIN_LENGTH = 204  # floor(MAX_TOKENS, 0.2)

    api_token: str
    text: str
    use_gpu: bool
    model_id: str

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

        Raises:
            RuntimeError: if API token or text is empty string
        """
        if not api_token:
            raise RuntimeError("API token is missing")
        if not text:
            raise RuntimeError("Text cannot be empty")
        self.api_token = api_token
        self.use_gpu = use_gpu
        self.model_id = model_id
        tokenizer = BartTokenizer.from_pretrained(model_id)
        encoded_input = tokenizer(text, truncation=True, max_length=self.MAX_TOKENS - 1)
        decoded_input = tokenizer.decode(
            encoded_input["input_ids"], skip_special_tokens=True
        )
        # NOTE: according to Wil, this reduces hallucination
        self.text = "\n" + decoded_input

    @property
    async def summary(self) -> str:
        """
        Use HuggingFace Inference API to get summary of text.

        Raises:
            HTTPStatusError: if request fails

        Returns:
            summarised text or original text
        """
        headers = {"Authorization": f"Bearer {self.api_token}"}
        url = f"https://api-inference.huggingface.co/models/{self.model_id}"

        data = json.dumps(
            {
                "inputs": self.text,
                "parameters": {
                    "max_length": self.MAX_LENGTH,
                    "min_length": self.MIN_LENGTH,
                },
                "options": {"use_gpu": self.use_gpu, "use_cache": False},
            }
        )
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(url=url, headers=headers, data=data)

        response.raise_for_status()

        r_json = json.loads(response.content.decode("utf-8"))
        text = self.text

        if r_json:
            text = r_json[0]["summary_text"]

        return text
