from app.core.security import create_session, hash_password, read_session, verify_password


def test_password_hash_is_not_reversible_and_verifies():
    encoded = hash_password("correct horse battery staple")
    assert encoded != "correct horse battery staple"
    assert verify_password("correct horse battery staple", encoded)
    assert not verify_password("wrong password", encoded)


def test_session_round_trip_and_tamper_rejection():
    token = create_session("user-123")
    assert read_session(token) == "user-123"
    assert read_session(token + "tampered") is None
