import pytest
from src.core.settings import settings

def test_settings_load():
    assert settings is not None
    public_attributes = [a for a in dir(settings) if not a.startswith('_')]
    
    assert len(public_attributes) > 0
    print(f"Доступные настройки: {public_attributes}")

def test_weather_logic_mock():
    sample_weather = {"main": {"temp": 20}, "weather": [{"description": "sunny"}]}
    assert "temp" in sample_weather["main"]