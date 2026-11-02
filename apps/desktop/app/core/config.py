import os
from pathlib import Path

from dotenv import load_dotenv


# Определяем путь к папке desktop
BASE_DIR = Path(__file__).resolve().parents[2]

# Загружаем переменные из .env
load_dotenv(BASE_DIR / ".env")

# Адрес backend API
API_URL = os.getenv("API_URL", "http://localhost:3000")