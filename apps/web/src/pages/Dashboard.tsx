
import { useEffect, useState } from "react";
import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import StatsCards from "../components/dashboard/StatsCards";
import TaskList from "../components/tasks/TaskList";
import TaskForm from "../components/tasks/TaskForm";
import AssistantPanel from "../components/assistant/AssistantPanel";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import type { CreateTaskData } from "../components/tasks/TaskForm";
import type { Task } from "../types/task";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  async function loadTasks() {
    try {
      setError("");
      const data = await getTasks();
      setTasks(data.filter((task) => task.status !== "cancelled"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Неизвестная ошибка"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  async function handleCreateTask(data: CreateTaskData) {
    await createTask(data);
    await loadTasks();
    setIsFormOpen(false);
  }
    async function handleCompleteTask(id: number) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  const newStatus = task.status === "completed"
    ? "pending"
    : "completed";

  try {
    await updateTask(id, { status: newStatus });
    await loadTasks();
  } catch (err) {
    window.alert(
      err instanceof Error ? err.message : "Не удалось обновить задачу"
    );
  }
}

async function handleDeleteTask(id: number) {
  const confirmed = window.confirm(
    "Ты действительно хочешь удалить эту задачу?"
  );

  if (!confirmed) return;

  try {
    await deleteTask(id);
    await loadTasks();
  } catch (err) {
    window.alert(
      err instanceof Error ? err.message : "Не удалось удалить задачу"
    );
  }
}

async function handleEditTask(data: CreateTaskData) {
  if (!editingTask) return;

  await updateTask(editingTask.id, data);
  await loadTasks();
  setEditingTask(null);
}


  const now = Date.now();

  const completed = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pending = tasks.filter(
    (task) =>
      task.status === "pending" ||
      task.status === "in_progress"
  ).length;

  const overdue = tasks.filter(
    (task) =>
      task.status !== "completed" &&
      new Date(task.due_at).getTime() < now
  ).length;

  const upcomingTasks = [...tasks]
    .filter((task) => task.status !== "completed")
    .sort(
      (a, b) =>
        new Date(a.due_at).getTime() -
        new Date(b.due_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="dashboard">
      <WelcomeHeader
        onCreateTask={() => setIsFormOpen(true)}
      />

      <StatsCards
        total={tasks.length}
        completed={completed}
        pending={pending}
        overdue={overdue}
      />

      {loading && (
        <div className="content-card loading-state">
          Загружаем задачи...
        </div>
      )}

      {error && (
        <div className="content-card error-state">
          <strong>Не удалось подключиться к ИКАР API</strong>
          <span>{error}</span>
          <small>
            Проверь, запущен ли сервер на localhost:3000.
          </small>
          <button
            className="cancel-button"
            onClick={() => void loadTasks()}
          >
            Повторить
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="dashboard-grid">
            <TaskList
            tasks={upcomingTasks}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
            onEdit={setEditingTask}
            />
          <AssistantPanel />
        </div>
      )}

      {(isFormOpen || editingTask !== null) && (
        <TaskForm
            key={editingTask?.id ?? "new-task"}
            task={editingTask}
            onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
            }}
            onSubmit={editingTask ? handleEditTask : handleCreateTask}
        />
        )}
    </div>
  );
}
