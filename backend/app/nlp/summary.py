import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from heapq import nlargest
from string import punctuation
from app.parser import Parser
from spacy.tokens import span
from app.nlp.main import extractive_summarisation, topCommonNWords

# Summarisation need to be improved so that it takes the headings and summarises text underneath
with open("samples/sampleScholar.pdf", "rb") as file:
    doc = Parser(file.read())

    stopwords = list(STOP_WORDS)

    punctuation = punctuation + "\n"

    nlp = spacy.load("en_core_web_sm")

    # from pprint import pprint

    # pprint(doc.spans)

    text = ""
    for values in doc.spans[1]:
        text += values["text"] + " "

    print("\n")
    doc = nlp(text)

    print(extractive_summarisation(doc, 5))
    print("\n\n\n")
    print(topCommonNWords(doc, 10))
