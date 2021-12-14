import spacy
from app.parser import Parser
from app.nlp.main import extractive_summarisation, topCommonNWords

nlp = spacy.load("en_core_web_sm")

# Summarisation need to be improved so that it takes the headings and summarises text underneath
with open("samples/sampleScholar.pdf", "rb") as file:
    doc = Parser(file.read())

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
