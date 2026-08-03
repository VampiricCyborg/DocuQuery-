from app.llm.stream import token_event


def test_token_event_keeps_streamed_whitespace_exactly():
    assert token_event(" there") == 'event: token\ndata: " there"\n\n'
    assert token_event("\n\nNext paragraph") == 'event: token\ndata: "\\n\\nNext paragraph"\n\n'
