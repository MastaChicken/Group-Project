from collections import Counter

import spacy
from app.parser import Parser

nlp = spacy.load("en_core_web_sm")

with open("samples/sampleScholar.pdf", "rb") as file:
    pdf = Parser(file.read())

data = pdf.text

doc = nlp(data)

# noun tokens that arent stop words or punctuations
nouns = [
    token.text
    for token in doc
    if (not token.is_stop and not token.is_punct and token.pos_ == "PROPN")
]

# five most common noun tokens
noun_freq = Counter(nouns)
common_nouns = noun_freq.most_common(5)

print(common_nouns)
