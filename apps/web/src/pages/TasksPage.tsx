
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ListTodo,
} from "lucide-react";

import TaskList from "../components/tasks/TaskList";
import TaskForm from "../components/tasks/TaskForm";
import type { CreateTaskData } from "../components/tasks/TaskForm";
import type { Task, TaskStatus, TaskPriority } from "../types/task";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

type StatusFilter = "all" | TaskStatus;
type PriorityFilter = "all" | TaskPriority;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  async function loadTasks() {
    try {
      setError("");
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить задачи"
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

  async function handleEditTask(data: CreateTaskData) {
    if (!editingTask) return;

    await updateTask(editingTask.id, data);
    await loadTasks();
    setEditingTask(null);
  }

  async function handleCompleteTask(id: number) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    await updateTask(id, { status: newStatus });
    await loadTasks();
  }

  async function handleDeleteTask(id: number) {
    if (!window.confirm("Ты действительно хочешь удалить эту задачу?")) {
      return;
    }

    await deleteTask(id);
    await loadTasks();
  }

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (statusFilter !== "all" && task.status !== statusFilter) {
          return false;
        }

        if (
          priorityFilter !== "all" &&
          task.priority !== priorityFilter
        ) {
          return false;
        }

        const query = search.trim().toLowerCase();

        if (
          query &&
          !task.title.toLowerCase().includes(query) &&
          !(task.description ?? "").toLowerCase().includes(query)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const difference =
          new Date(a.due_at).getTime() -
          new Date(b.due_at).getTime();

        return sortOrder === "asc" ? difference : -difference;
      });
  }, [tasks, search, statusFilter, priorityFilter, sortOrder]);

  const activeCount = tasks.filter(
    (task) => task.status === "pending" || task.status === "in_progress"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  return (
    <div className="tasks-page">
      <header className="tasks-page-header">
        <div>
          <span className="eyebrow">TASK MANAGEMENT / WORKSPACE</span>
          <h1>Мои задачи</h1>
          <p>Управляй своими делами и следи за сроками.</p>
        </div>

        <button
          className="create-task-button"
          onClick={() => setIsFormOpen(true)}
        >
          + Новая задача
        </button>
      </header>

      <div className="tasks-overview">
        <div className="tasks-overview-card">
          <span>Всего задач</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="tasks-overview-card">
          <span>Активные</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="tasks-overview-card">
          <span>Выполненные</span>
          <strong>{completedCount}</strong>
        </div>
      </div>

      <section className="content-card tasks-workspace">
        <div className="tasks-toolbar">
          <div className="tasks-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <label className="filter-control">
            <SlidersHorizontal size={15} />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="all">Все статусы</option>
              <option value="pending">Ожидают</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Выполнены</option>
              <option value="cancelled">Отменены</option>
            </select>
          </label>

          <label className="filter-control">
            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value as PriorityFilter)
              }
            >
              <option value="all">Все приоритеты</option>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
          </label>

          <button
            className="sort-button"
            onClick={() =>
              setSortOrder((current) => current === "asc" ? "desc" : "asc")
            }
            title="Изменить порядок сортировки"
          >
            <ArrowUpDown size={16} />
            {sortOrder === "asc" ? "Сначала ближайшие" : "Сначала дальние"}
          </button>
        </div>

        <div className="tasks-results-heading">
          <div>
            <ListTodo size={18} />
            <strong>Список задач</strong>
          </div>
          <span>Найдено: {filteredTasks.length}</span>
        </div>

        {loading && (
          <div className="empty-state">Загружаем задачи...</div>
        )}

        {error && (
          <div className="error-state">
            <strong>Не удалось загрузить задачи</strong>
            <span>{error}</span>
            <button className="cancel-button" onClick={() => void loadTasks()}>
              Повторить
            </button>
          </div>
        )}

        {!loading && !error && (
          <TaskList
            tasks={filteredTasks}
            onComplete={(id) => void handleCompleteTask(id)}
            onDelete={(id) => void handleDeleteTask(id)}
            onEdit={setEditingTask}
          />
        )}
      </section>

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
