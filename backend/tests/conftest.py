import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from tests.fixtures.build_test_db import build_test_db

# conftest.pyはどのテストモジュールがapp.mainをimportするより前に読み込まれるため、
# ここでDB_PATHをfixture DBに向けておくことでlifespan起動時のDBチェックが
# 本番のejcsv.dbに一切依存しなくなる。
_fixture_db_path = Path(tempfile.mkdtemp(prefix="ejcsv-test-")) / "ejcsv_test.db"
build_test_db(_fixture_db_path)
os.environ["DB_PATH"] = str(_fixture_db_path)


@pytest.fixture()
def client():
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
