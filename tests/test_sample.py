import pytest


def capital_case(x):
    return x.capitalize()


@pytest.mark.parametrize("test_input,expected", [("hello", "Hello"), ("hello world", "Hello world")])
def test_capital_case(test_input, expected):
    assert capital_case(test_input) == expected


@pytest.mark.parametrize("test_input,expected", [("hello world", "Hello World")])
def test_capital_case_with_multiple_words(test_input, expected):
    assert capital_case(test_input) != expected
