"""Unit tests for the properties and methods in Techniques."""
from pytest import raises
from spacy import load

from app.nlp.techniques import Techniques
from spacy.lang.en import English


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

    def test_noun_frequency(self):
        """Test for the frequency of manually lemmatized nouns"""
        test_dic = {"pineapple": 5, "biscuit": 7, "apple": 3}
        text_test = ""
        for k, v in test_dic.items():
            for n in range(0, v):
                text_test += k + " "
        techniques = Techniques(self.model, text_test)
        words = techniques.noun_freq
        # print(words, "LISTEN HERE")
        assert words == test_dic

    def test_invalid_pipeline(self):
        """Test for pipeline without lemmatizer component"""
        with raises(RuntimeError):
            Techniques(English(), self.empty_string)

    def test_threshold_words(self):
        """Test for words over threshold of n"""
        test_list_tuple = [("pineapple", 5), ("biscuit", 7), ("apple", 3)]
        text_test = ""
        for word_freq in test_list_tuple:
            for n in range(0, word_freq[1]):
                text_test += word_freq[0] + " "
        techniques = Techniques(self.model, text_test)
        result = techniques.words_threshold_n(4)
        print(result)
        assert result == test_list_tuple[:-1]
