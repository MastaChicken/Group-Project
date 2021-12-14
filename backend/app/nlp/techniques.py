"""Contains the NLP techiniques that can be applied onto text chunks.

Example::

    text: str
    nlp = Techniques(text)
    nlp.extractive_summarisation(5)

Todo:
    * Add more techiniques
"""
from collections import Counter
from functools import cached_property
from heapq import nlargest

from spacy import load
from spacy.lang.en.stop_words import STOP_WORDS
from spacy.tokens.doc import Doc
from spacy.tokens.span import Span


class Techniques:
    """Apply NLP techiniques on text.

    Attributes:
        __doc: spaCy Doc class
    """

    __doc: Doc

    def __init__(self, text: str):
        """Run English spacy model on text chunk.

        Args:
            text : chunk of text from scholarly article
        """
        nlp = load("en_core_web_sm")
        self.__doc = nlp(text)

    @cached_property
    def word_freq(self) -> dict:
        """Calculate the frequencies of word in a given document.

        Returns:
            Dictionary containing the frequency of each word
        """
        from string import punctuation

        punctuation += "\n"

        word_frequencies = {}
        for word in self.__doc:
            if (
                word.text.lower() not in STOP_WORDS
                and word.text.lower() not in punctuation
                and word.pos_ == "NOUN"
            ):
                if word.text not in word_frequencies.keys():
                    word_frequencies[word.text] = 1
                else:
                    word_frequencies[word.text] += 1

        return word_frequencies

    def extractive_summarisation(self, n: int) -> list[str]:
        """Return summary down to 'n' amount of sentences.

        Args:
            n : amount of sentences to be reduced down to

        Returns:
            List of strings containing the extractive summarisation
        """
        word_frequencies = self.word_freq

        max_frequency = max(word_frequencies.values())
        for word in word_frequencies.keys():
            word_frequencies[word] = word_frequencies[word] / max_frequency

        # need to optimise this, only counts sentence if fullstop,
        # space then capital letter/punctuation/number
        sentence_tokens = [sent for sent in self.__doc.sents]

        sentence_scores: dict[Span, float] = {}
        for sent in sentence_tokens:
            for word in sent:
                if word.text.lower() in word_frequencies.keys():
                    if sent not in sentence_scores.keys():
                        sentence_scores[sent] = word_frequencies[word.text.lower()]
                    else:
                        sentence_scores[sent] += word_frequencies[word.text.lower()]

        summarised_sentences = nlargest(
            n, sentence_scores, key=lambda k: sentence_scores[k]
        )

        final_sentences = [w.text for w in summarised_sentences]

        return final_sentences

    def top_common_n_words(self, n: int) -> list[tuple[str, int]]:
        """Return tuple containing most common n amount of words in given text.

        Args:
            n : amount of common words to return

        Returns:
            List of n words including their frequency
        """
        word_frequencies = self.word_freq

        noun_freq = Counter(word_frequencies)
        common_nouns = noun_freq.most_common(n)

        return common_nouns
