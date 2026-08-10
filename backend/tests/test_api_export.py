def test_export_csv_headers_and_body(client):
    response = client.post("/api/export/csv", json={"text": "run"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert response.headers["content-disposition"].startswith('attachment; filename="ejcsv_')
    assert response.headers["content-disposition"].endswith('.csv"')

    body = response.content
    assert body.startswith(b"\xef\xbb\xbf")
    text = body.decode("utf-8-sig")
    lines = text.splitlines()
    assert lines[0] == "word,translation,example_sentence"
    assert lines[1] == "run,走る / 経営する / ...,She runs every morning."


def test_export_csv_unknown_word_has_empty_cells(client):
    response = client.post("/api/export/csv", json={"text": "xenodochial"})
    text = response.content.decode("utf-8-sig")
    lines = text.splitlines()
    assert lines[1] == "xenodochial,,"
