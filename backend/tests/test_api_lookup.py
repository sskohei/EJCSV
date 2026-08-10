def test_lookup_matches_api_doc_example(client):
    response = client.post("/api/lookup", json={"text": "run\ngive up, listen\nxenodochial"})
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 4
    assert data["results"] == [
        {
            "word": "run",
            "translation": "走る / 経営する / ...",
            "example": "She runs every morning.",
            "sentence_id": 1,
            "translation_found": True,
            "example_found": True,
        },
        {
            "word": "give up",
            "translation": "あきらめる",
            "example": None,
            "sentence_id": None,
            "translation_found": True,
            "example_found": False,
        },
        {
            "word": "listen",
            "translation": "聞く",
            "example": "Listen to me carefully.",
            "sentence_id": 2,
            "translation_found": True,
            "example_found": True,
        },
        {
            "word": "xenodochial",
            "translation": None,
            "example": None,
            "sentence_id": None,
            "translation_found": False,
            "example_found": False,
        },
    ]


def test_lookup_preserves_duplicate_words(client):
    response = client.post("/api/lookup", json={"text": "run,run"})
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    assert [r["word"] for r in data["results"]] == ["run", "run"]


def test_lookup_rejects_too_many_words_with_422(client):
    text = "\n".join(f"word{i}" for i in range(201))
    response = client.post("/api/lookup", json={"text": text})
    assert response.status_code == 422
    assert response.json() == {"detail": "Too many words: 201 submitted, maximum is 200."}
