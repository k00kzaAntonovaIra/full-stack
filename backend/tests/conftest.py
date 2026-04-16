import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    """Создает тестового клиента для запросов"""
    with TestClient(app) as c:
        yield c