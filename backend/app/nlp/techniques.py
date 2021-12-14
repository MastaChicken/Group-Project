"""Contains the techniques used within the nlp process."""
from collections import Counter
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
from heapq import nlargest
from spacy.tokens.doc import Doc


# adds the newline token to the punctuation array
punctuation += "\n"
stopwords = list(STOP_WORDS)


def word_freq(doc: Doc) -> dict:
    """Calculates the frequencies of word in a given document.

    Args:
        doc: document containing the text to work the frequencies of

    Returns:
        dictionary containing the frequency of each word
    """
    word_frequencies = {}
    for word in doc:
        if (
            word.text.lower() not in stopwords
            and word.text.lower() not in punctuation
            and word.pos_ == "NOUN"
        ):
            if word.text not in word_frequencies.keys():
                word_frequencies[word.text] = 1
            else:
                word_frequencies[word.text] += 1

    return word_frequencies


def extractive_summarisation(doc: Doc, n: int) -> list[str]:
    """Returns extractive summarisation of given document down to 'n' amount of sentences.

    Args:
        doc: document containing text to be summarised
        n : amount of sentences to be reduced down to

    Returns:
        list of strings containing the extractive summarisation
    """
    word_frequencies = word_freq(doc)

    max_frequency = max(word_frequencies.values())
    for word in word_frequencies.keys():
        word_frequencies[word] = word_frequencies[word] / max_frequency

    # need to optimise this, only counts sentence if fullstop, space then capital letter/punctuation/number
    sentence_tokens = [sent for sent in doc.sents]

    sentence_scores = {}
    for sent in sentence_tokens:
        for word in sent:
            if word.text.lower() in word_frequencies.keys():
                if sent not in sentence_scores.keys():
                    sentence_scores[sent] = word_frequencies[word.text.lower()]
                else:
                    sentence_scores[sent] += word_frequencies[word.text.lower()]

    summarised_sentences = nlargest(n, sentence_scores, key=sentence_scores.get)

    final_sentences = [w.text for w in summarised_sentences]
    return final_sentences


def top_common_n_words(doc: Doc, n: int) -> tuple[str, int]:
    """Returns tuple containing most common n amount of words in given text.

    Args:
        doc (Doc): document with text to find most common n words
        n (int): amount of common words to return

    Returns:
        tuple[str, int]: first element is the word, second element is the frequency
    """
    word_frequencies = word_freq(doc)

    # five most common noun tokens
    noun_freq = Counter(word_frequencies)
    common_nouns = noun_freq.most_common(n)

    return common_nouns
