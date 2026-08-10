from app.models.schemas import LookupRequest, LookupResponse

API_DOC_EXAMPLE = {
    "results": [
        {
            "word": "run",
            "translation": "走る / 経営する / ...",
            "example": "She runs every morning.",
            "translation_found": True,
            "example_found": True,
        },
        {
            "word": "give up",
            "translation": "あきらめる",
            "example": None,
            "translation_found": True,
            "example_found": False,
        },
        {
            "word": "listen",
            "translation": "聞く",
            "example": "Listen to me carefully.",
            "translation_found": True,
            "example_found": True,
        },
        {
            "word": "xenodochial",
            "translation": None,
            "example": None,
            "translation_found": False,
            "example_found": False,
        },
    ],
    "count": 4,
}


def test_lookup_response_matches_api_doc_example():
    response = LookupResponse.model_validate(API_DOC_EXAMPLE)
    assert response.model_dump() == API_DOC_EXAMPLE


def test_lookup_request_accepts_multiline_text():
    request = LookupRequest.model_validate({"text": "run\ngive up, listen\nxenodochial"})
    assert request.text == "run\ngive up, listen\nxenodochial"
