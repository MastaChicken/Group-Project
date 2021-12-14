"""Contains the techniques used within the nlp process."""
from collections import Counter
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
from heapq import nlargest
from spacy.tokens.doc import Doc


# adds the newline token to the punctuation array
punctuation += "\n"
stopwords = list(STOP_WORDS)


def extractive_summarisation(doc: Doc, n: int) -> str:
    """Returns extractive summarisation of given document down to 'n' amount of sentences.

    Args:
        doc (Doc): document containing text to be summarised
        n (int): amount of sentences to be reduced down to

    Returns:
        str: the summarised text
    """
    word_frequencies = {}
    for word in doc:
        if word.text.lower() not in stopwords:
            if word.text.lower() not in punctuation:
                if word.text not in word_frequencies.keys():
                    word_frequencies[word.text] = 1
                else:
                    word_frequencies[word.text] += 1

    max_frequency = max(word_frequencies.values())
    for word in word_frequencies.keys():
        word_frequencies[word] = word_frequencies[word] / max_frequency

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
    summary = "\n\n".join(final_sentences)
    return summary


def topcommonnwords(doc: Doc, n: int) -> tuple[str, int]:
    """Returns tuple containing most common n amount of words in given text.

    Args:
        doc (Doc): document with text to find most common n words
        n (int): amount of common words to return

    Returns:
        tuple[str, int]: first element is the word, second element is the frequency
    """
    nouns = [
        token.text
        for token in doc
        if (not token.is_stop and not token.is_punct and token.pos_ == "NOUN")
    ]

    # five most common noun tokens
    noun_freq = Counter(nouns)
    common_nouns = noun_freq.most_common(n)

    return common_nouns
