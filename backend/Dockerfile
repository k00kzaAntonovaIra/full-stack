FROM python:3.11-slim
WORKDIR /app

# Копируем только требования сначала (для кеширования)
COPY requirements.txt .

# Ставим библиотеки без тяжелой сборки
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

# Копируем остальной код
COPY . .

# Запускаем сервер
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
