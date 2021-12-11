from collections import Counter


import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
from heapq import nlargest
from spacy.tokens.doc import Doc
from app.parser import Parser

punctuation += "\n"
nlp = spacy.load("en_core_web_sm")
stopwords = list(STOP_WORDS)

data = """Systematic reviews involve a well established process [21], applied in most research disciplines, including our own community (e.g., Kelly & Sugimoto’s systematic review of IIR Evaluation [26]). Brereton et al. [7] acknowledge 10 stages of a systematic review that span the planning, execution, and documentation of systematic reviews: 1) plan research questions, 2) specify review protocol, 3) validate review protocol, 4) identify relevant research, 5) select primary studies, 6) assess study quality, 7) extract required data, 8) synthesize data, 9) write review report, 10) validate report. In comparison to a literature review, a systematic review is designed to 1) parameterise a literature review space to define what will be included and excluded, 2) survey all the available research that meets those criteria, 3) synthesise the studies’ combined data (e.g., through meta-analysis), and 4) present quantifiable recommendations based on the synthesised data [17]. While a literature review might outwardly look for possible extant literature that relates by any one criteria, a systematic review looks inwardly to find all the literature that matches all the prespecified criteria, to the exclusion of results that only partially meet the criteria. Brereton et al. applied their 10 stages to software engineering literature, and dicovered that poor quality abstracts and lack of infrastructure make such reviews difficult. Thus, they need to be adapted to suit different domains. Athukorala et al., for example, found that literature searching was a highly collaborative experience for the computer scientists they studied [3]. Papaioannou et al. studied the different search tactics used by social scientists in systematic reviews, noting that beyond reference lists, checking and expert contacts were needed to reach rigorous standards [31]. More recently, Booth performed an in depth systematic review of methodologies used in qualitative systematic reviews [6], noting the data extraction of comparable specific detail as an open challenge. The stages of the systematic review task lend themselves to different roles, similar to the Prospector and Miner proposed by Golovchinsky et al. [16], where one person’s role is to find sources of information, and another person’s role is to extract data from them. In 2005, Harris studied the crucial role that a medical research librarian plays in the process, in collaboration with researchers on a project [20]. Similarly, Beverley et al. studied 11 different roles that may be performed by an information specialist in healthcare literature reviews [5]. It could be argued that Systematic Reviews are made up of a series of Work Tasks, such as selecting primary studies, reviewing papers, etc.; however, as our results further highlight below, each of the stages are closely integrated and depend on shared document artefacts.
"""

doc = nlp(data)


def extractive_summarisation1(doc: Doc):
    # print(len(list(doc.sents)))

    keywords = []
    stopwords = list(STOP_WORDS)
    pos_tag = ["PROPN", "ADJ", "NOUN", "VERB"]
    for token in doc:
        if token.text in stopwords or token.text in punctuation:
            continue
        if token.pos_ in pos_tag:
            keywords.append(token.text)

    freq_word = Counter(keywords)
    print(freq_word.most_common(5))

    max_freq = Counter(keywords).most_common(1)[0][1]
    for word in freq_word.keys():
        freq_word[word] = freq_word[word] / max_freq
    print(freq_word.most_common(5))

    sent_strength = {}
    for sent in doc.sents:
        for word in sent:
            if word.text in freq_word.keys():
                if sent in sent_strength.keys():
                    sent_strength[sent] += freq_word[word.text]
                else:
                    sent_strength[sent] = freq_word[word.text]
    # print(sent_strength)

    summarised_sentences = nlargest(5, sent_strength, key=sent_strength.get)
    # print(summarised_sentences)

    final_sentences = [w.text for w in summarised_sentences]
    summary = " ".join(final_sentences)
    print(summary)


def extractive_summarisation2(doc: Doc) -> str:
    tokens = [token.text for token in doc]

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

    from heapq import nlargest

    select_length = int(len(sentence_scores) * 0.3)
    summary = nlargest(select_length, sentence_scores, key=sentence_scores.get)

    final_summary = [word.text for word in summary]
    summary = " ".join(final_summary)
    return summary


def omar(n):
    # noun tokens that arent stop words or punctuations
    nouns = [
        token.text
        for token in doc
        if (not token.is_stop and not token.is_punct and token.pos_ == "NOUN")
    ]

    # five most common noun tokens
    noun_freq = Counter(nouns)
    common_nouns = noun_freq.most_common(5)

    print(common_nouns)


if __name__ == "__main__":
    # extractive_summarisation1(doc)
    print("\n\n")
    print(extractive_summarisation2(doc))
