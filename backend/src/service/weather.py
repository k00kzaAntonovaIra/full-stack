import httpx
# Заменяем импорт: берем именно объект settings из файла config или settings
from ..core.settings import settings 

async def get_weather_by_city(city: str):
    # Если город не передан или пустой, не мучаем API
    if not city:
        return None

    url = "https://api.openweathermap.org/data/2.5/weather"
    
    # Теперь settings.WEATHER_API_KEY должен подхватиться
    params = {
        "q": city,
        "appid": settings.WEATHER_API_KEY, 
        "units": "metric",
        "lang": "ru"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                return {
                    "temp": round(data["main"]["temp"]),
                    "description": data["weather"][0]["description"],
                    "icon": data["weather"][0]["icon"]
                }
            return None
        except Exception as e:
            print(f"Ошибка Weather API: {e}")
            return None