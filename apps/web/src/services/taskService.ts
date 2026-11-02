
import type { Task } from "../types/task";
import type { CreateTaskData } from "../components/tasks/TaskForm";

const API_URL = "http://localhost:3000";

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks?status=all`);

  if (!response.ok) {
    throw new Error("Не удалось загрузить задачи");
  }

  return response.json();
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.message || "Не удалось создать задачу");
  }

  return response.json();
}

export async function updateTask(
  id: number,
  data: Partial<Task>
): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.message || "Не удалось обновить задачу");
  }

  return response.json();
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.message || "Не удалось удалить задачу");
  }
}
