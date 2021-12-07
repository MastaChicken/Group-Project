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

data = """Health secretary Sajid Javid on Monday confirmed that community transmission of the new Omicron variant of coronavirus was occurring in England, as the number of cases climbed to 336 across the UK.

Javid told the House of Commons there remained many unknowns in relation to the variant first identified in South Africa, but said the government would leave nothing to “chance” and proceed with “proportionate” measures.

“We don’t yet have a complete picture of whether Omicron causes more severe disease or indeed how it interacts with vaccines,” he told MPs. “We can’t say for certain at this point whether Omicron has the potential to knock us off our road to recovery.”

Javid said 261 Omicron cases have been identified in England, 71 in Scotland and 4 in Wales, adding that several cases were not linked to travel abroad.

“It is highly likely that there is now community transmission across multiple regions of England,” the health secretary said.

Despite the spread of the new variant, Boris Johnson, prime minister, earlier on Monday defended the government’s strategy, arguing that more time was needed to assess the true impact of Omicron.

“We’re still waiting to see exactly how dangerous it is, what sort of effect it has in terms of deaths and hospitalisations,” he told reporters while on a visit to Merseyside.

Over the weekend, the government announced fresh changes to travel restrictions. From 4am on Tuesday, all passengers arriving into the UK, regardless of their vaccination status, will be required to show proof of a negative pre-departure coronavirus test.

Meanwhile, Nigeria was added to the red list of countries, meaning that from Tuesday, individuals who are not UK or Irish nationals and have been in Nigeria over the past 10 days, will not be permitted to enter the UK.

“Analysis from [UK Health Security Agency] shows that at least 21 Omicron cases in England alone are linked to travel from Nigeria,” Javid said, adding the country had “very strong travel links with South Africa” and was the second most popular flight destination from Johannesburg.

The health secretary confirmed MPs would be given a further update on the situation next week, adding that the government’s strategy was to buy time and strengthen defences while scientists assess the new variant.
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
    # print(freq_word.most_common(5))

    max_freq = Counter(keywords).most_common(1)[0][1]
    for word in freq_word.keys():
        freq_word[word] = freq_word[word] / max_freq
    # print(freq_word.most_common(5))

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


def extractive_summarisation2(doc: Doc):
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
    print(summary)


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


extractive_summarisation2(doc)
print("\n\n")
extractive_summarisation1(doc)
