import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from heapq import nlargest
from string import punctuation

stopwords = list(STOP_WORDS)

punctuation = punctuation + "\n"

text = """ A Systematic Review, as a formal approach to literature review,
is a Recall-oriented task [19], that appears in most disciplines. In
their extreme forms, within evidence based medicine and legal
e-discovery [29], all relevant documents must be found to be confident that decisions are being made in the light of all possible data,
and that no data is missed. As an activity, a systematic review is usally performed by experts, under very tightly controlled parameters
that have been prescribed as the task was assigned. In practice, however, systematic reviews might be spread across multiple people
as a collaborative search activity [16], and is typically performed
across a complex multi-stage process [22]. Further, multiple people
with different skills and expertise often take different roles at different stages. Systematic reviews must be rigorously performed
and are currently laborious and repetitive. First, they must be sufficiently inclusive and comprehensive to include all relevant research,
and second, researchers must then find, comprehend, extract, and
integrate the data from within the search results.
We aimed to reveal the full nature of the Systematic Reviews, as
a Work Task [24], or indeed as a series of multiple Work Tasks. Our
research questions were as follows:
RQ1 What is the nature of the work task, and its sub-tasks?
RQ2 What opportunities exist to support the work task with
search systems?
In contrast to published protocols on how systematic reviews should
be performed, this paper’s main contribution lies in presenting
a detailed Cognitive Work Analysis [39] of actual working practices around systematic reviews (Section 4), based on a focused ethnography study [28]. Our results lay the foundations for future
research into the design of search systems that support this high recall collaborative work task """

nlp = spacy.load("en_core_web_sm")
doc = nlp(text)
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

select_length = int(len(sentence_tokens) * 0.3)
summary = nlargest(select_length, sentence_scores, key=sentence_scores.get)

final_summary = [word.text for word in summary]
summary = "".join(final_summary)
print(summary)
