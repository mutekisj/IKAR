import requests

from app.core.config import API_URL


class IkarAPI:
    """Клиент для взаимодействия desktop-приложения с backend."""

    def __init__(self):
        self.base_url = API_URL

    def check_connection(self):
        """Проверяет доступность backend."""

        try:
            response = requests.get(
                f"{self.base_url}/health",
                timeout=5
            )

            response.raise_for_status()
            return True

        except requests.RequestException:
            return False

    def get_tasks(self):
        """Получает все задачи."""

        response = requests.get(
            f"{self.base_url}/tasks?status=all",
            timeout=5
        )

        response.raise_for_status()
        return response.json()

    def create_task(self, title, description, priority, due_at):
        """Создаёт новую задачу."""

        data = {
            "title": title,
            "description": description,
            "priority": priority,
            "due_at": due_at
        }

        response = requests.post(
            f"{self.base_url}/tasks",
            json=data,
            timeout=5
        )

        response.raise_for_status()
        return response.json()