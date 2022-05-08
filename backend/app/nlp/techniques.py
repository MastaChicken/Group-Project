"""Contains the NLP techiniques that can be applied onto text chunks.

Example::

    text: str
    nlp = Techniques(text)

"""
from collections import Counter
from functools import cached_property
from math import ceil

import pytextrank  # noqa: F401
from spacy.language import Language
from spacy.tokens.doc import Doc
from spacy.tokens.span import Span
from spacy.util import registry


class Word:
    """Apply word extraction on text."""

    __doc: Doc
    __accepted_pos_tags = {"NOUN", "PROPN"}

    def __init__(self, text: str, model: Language):
        """Run English spacy model on text chunk.

        Args:
            model : spaCy language model
            text : chunk of text from scholarly article

        Raises:
            RunTimeError: if pipeline doesn't contain lemmatizer

        """
        if not model.has_pipe("lemmatizer"):
            raise RuntimeError("Language models requires lemmatizer pipeline")

        self.__doc = model(text)

    @cached_property
    def noun_freq(self) -> dict[str, int]:
        """Calculate the frequencies of noun lemmas in a given document.

        Returns:
            Dictionary containing the frequency of each word
        """
        word_frequencies = {}
        for word in self.__doc:
            if (
                not word.is_punct
                and not word.is_stop
                and word.pos_ in self.__accepted_pos_tags
                and len(word.lemma_) > 2
                and word.text[0].isalpha()
            ):
                if word.lemma_ not in word_frequencies.keys():
                    word_frequencies[word.lemma_] = 1
                else:
                    word_frequencies[word.lemma_] += 1

        return word_frequencies

    def words_threshold_n(self, n: int) -> list[tuple[str, int]]:
        """Return list of tuples containing words that occur more than n times.

        Args:
            n : threshold of occurances for word to be returned

        Returns:
            List of n words including their frequency
        """
        noun_freq = Counter({k: c for k, c in self.noun_freq.items() if c >= n})

        return noun_freq.most_common()


class Phrase:
    """Apply phrase extraction on text."""

    __doc: Doc

    def __init__(self, text: str, model: Language):
        """Run English spacy model on text chunk.

        Args:
            model : spaCy language model
            text : chunk of text from scholarly article

        """
        if model.has_pipe("positionrank"):
            model.remove_pipe("positionrank")

        model.add_pipe(
            "positionrank",
            config={"scrubber": {"@misc": "prefix_scrubber"}},
        )
        self.__doc = model(text)

    @cached_property
    def ranks(self) -> list[tuple[str, int]]:
        """Return sorted dictionary with phrases and their normalised rank.

        If normalised rank is zero, the phrase is ignored.

        Returns:
            Sorted dictionary of phrases mapping to their normalised rank
        """
        phrases = []

        for phrase in self.__doc._.phrases:
            n_rank = ceil(phrase.rank * 100)
            if phrase.text and n_rank:
                phrases.append((phrase.text, n_rank))

        return phrases

    @cached_property
    def counts(self) -> dict[str, int]:
        """Return sorted dictionary with phrases ranked by their count.

        Returns:
            Dictionary of phrases mapping to their count
        """
        phrases = {}

        for phrase in self.__doc._.phrases:
            if phrase.text:
                phrases[phrase.text] = phrase.count

        return dict(sorted(phrases.items(), key=lambda item: item[1], reverse=True))

    @registry.misc("prefix_scrubber")
    def prefix_scrubber():
        """Scrub spans.

        Ensures that it removes leading determinants, punctuation, stopwords and also
        single word results.

        Returns:
            Scrubbed string
        """

        def scrubber_func(span: Span) -> str:

            result = []

            while span[0].pos_ == "DET":
                span = span[1:]

            for token in span:
                if (
                    len(token.text) > 1
                    and not token.is_punct
                    and not token.is_stop
                    and (token.is_alpha or token.is_digit)
                ):
                    result.append(token.text.lower())

            if len(result) == 1:
                return ""

            return " ".join(result)

        return scrubber_func
