"""Unit tests for the properties and methods in Techniques."""
from pytest import raises
from spacy import load
from spacy.lang.en import English

from app.nlp.techniques import Word, Phrase
import pytextrank


class TestTechniques:
    """Unit tests for Technique methods.

    Todo:
        * Fix empty string test
    """

    empty_string = ""
    # Lorem ipsum in English
    test_string = """
    But I must explain to you how all this mistaken idea of denouncing
    of a pleasure and praising pain was born and I will give you a complete account of
    the system, and expound the actual teachings of the great explorer of the truth, the
    master-builder of human happiness. No one rejects, dislikes, or avoids pleasure
    itself, because it is pleasure, but because those who do not know how to pursue
    pleasure rationally encounter consequences that are extremely painful. Nor again is
    there anyone who loves or pursues or desires to obtain pain of itself, because it is
    pain, but occasionally circumstances occur in which toil and pain can procure him
    some great pleasure. To take a trivial example, which of us ever undertakes
    laborious physical exercise, except to obtain some advantage from it? But who has
    any right to find fault with a man who chooses to enjoy a pleasure that has no
    annoying consequences, or one who avoids a pain that produces no resultant pleasure?
    On the other hand, we denounce with righteous indignation and dislike men who are so
    beguiled and demoralized by the charms of pleasure of the moment, so blinded by
    desire, that they cannot foresee the pain and trouble that are bound to ensue; and
    equal blame belongs to those who fail in their duty through weakness of will, which
    is the same as saying through shrinking from toil and pain. These cases are
    perfectly simple and easy to distinguish. In a free hour, when our power of choice
    is untrammeled and when nothing prevents our being able to do what we like best,
    every pleasure is to be welcomed and every pain avoided. But in certain
    circumstances and owing to the claims of duty or the obligations of business it will
    frequently occur that pleasures have to be repudiated and annoyances accepted. The
    wise man therefore always holds in these matters to this principle of selection: he
    rejects pleasures to secure other greater pleasures, or else he endures pains to
    avoid worse pains
    """

    model = load("en_core_web_sm")
    model.add_pipe("textrank")

    def test_noun_frequency(self):
        """Test dictionary contain nouns in their lemma form."""
        test_dic = {"pineapple": 5, "biscuit": 7, "apple": 3}
        text_test = ""
        for k, v in test_dic.items():
            text_test += (k + " ") * v
        word_techniques = Word(self.model, text_test)
        words = word_techniques.noun_freq
        assert words == test_dic

    def test_invalid_pipeline_word(self):
        """Language model needs to contain Lemmatizer pipeline."""
        with raises(RuntimeError):
            Word(English(), self.empty_string)

    def test_threshold_words(self):
        """Test for words over threshold of n."""
        test_list_tuple: list[tuple[str, int]] = [
            ("pineapple", 5),
            ("biscuit", 7),
            ("apple", 3),
        ]
        text_test = ""
        for word, freq in test_list_tuple:
            text_test += (word + " ") * freq
        word_techniques = Word(self.model, text_test)
        result = word_techniques.words_threshold_n(4, word_techniques.noun_freq)

        assert sorted(result) == sorted([("pineapple", 5), ("biscuit", 7)])

    def test_invalid_pipeline_phrase(self):
        """Ensure phrase pipeline works when model fed in twice."""
        phrase = Phrase(self.model, self.empty_string)
        phrase2 = Phrase(self.model, self.empty_string)
        phrase.ranks
        phrase2.ranks

    text_test_phrase = """
Our investigation identified a series of opportunities for HCIR systems to support systematic reviews through automation of tasks that were described as laborious and repetitive. One initial observation is that this multi-stage process may be facilitated better by systems that, overall, model search stages explicitly. The breadth of expertise observed in those conducting systematic reviews indicates that great care must be taken when designing any technologies for systematic review automation to enable as many people as possible to participate in the review production process, particularly in data extraction. 
"""

    def test_phrase_count(self):
        """Ensure that the counting of phrase is correct"""
        phrase_techniques = Phrase(self.model, self.text_test_phrase)
        result = phrase_techniques.counts
        assert result == {
            "systematic reviews": 2,
            "systematic review automation": 1,
            "hcir systems": 1,
            "data extraction": 1,
            "review production process": 1,
            "great care": 1,
            "multi stage process": 1,
            "initial observation": 1,
        }

    def test_phrase_rank(self):
        """Ensure that the ranking of phrase is correct"""
        phrase_techniques = Phrase(self.model, self.text_test_phrase)
        result = phrase_techniques.ranks
        assert result == {
            "systematic review automation": 0.18095195032492892,
            "systematic reviews": 0.1703205852928239,
            "hcir systems": 0.15599875362242477,
            "data extraction": 0.08947992871705784,
            "review production process": 0.08487560499941071,
            "great care": 0.08284069475691935,
            "multi stage process": 0.05375667108933987,
            "initial observation": 0.021827970517453898,
        }
