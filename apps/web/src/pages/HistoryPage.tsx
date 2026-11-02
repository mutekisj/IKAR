import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  History,
  CalendarDays,
} from "lucide-react";

import type { Task } from "../types/task";
import { getTasks, updateTask } from "../services/taskService";
import { formatDateTime } from "../utils/dateFormatter";

type HistoryFilter = "all" | "completed" | "cancelled";

function HistoryPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");

  async function loadTasks() {
    try {
      setLoading(true);

      const data = await getTasks();

      setTasks(
        data.filter(
          (task) =>
            task.status === "completed" ||
            task.status === "cancelled"
        )
      );

      setError("");
    } catch {
      setError("Не удалось загрузить историю задач");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const searchValue = search.toLowerCase().trim();

        const matchesSearch =
          task.title.toLowerCase().includes(searchValue) ||
          (task.description || "").toLowerCase().includes(searchValue);

        const matchesFilter =
          filter === "all" || task.status === filter;

        return matchesSearch && matchesFilter;
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime()
      );
  }, [tasks, search, filter]);

  async function restoreTask(task: Task) {
    try {
      await updateTask(task.id, { status: "pending" });
      await loadTasks();
    } catch {
      setError("Не удалось восстановить задачу");
    }
  }

  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const cancelledCount = tasks.filter(
    (task) => task.status === "cancelled"
  ).length;

  return (
    <div className="history-page">
      <header className="history-header">
        <div>
          <span className="page-eyebrow">АРХИВ ДЕЙСТВИЙ</span>
          <h1>История</h1>
          <p>Все завершённые и отменённые задачи</p>
        </div>

        <div className="history-header-icon">
          <History size={26} />
        </div>
      </header>

      <section className="history-stats">
        <div className="history-stat-card">
          <div className="history-stat-icon completed">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Выполнено</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon cancelled">
            <XCircle size={21} />
          </div>
          <div>
            <span>Отменено</span>
            <strong>{cancelledCount}</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon total">
            <History size={21} />
          </div>
          <div>
            <span>Всего в истории</span>
            <strong>{tasks.length}</strong>
          </div>
        </div>
      </section>

      <section className="history-workspace">
        <div className="history-toolbar">
          <div className="history-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Поиск по истории..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="history-filters">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Все
            </button>

            <button
              className={filter === "completed" ? "active" : ""}
              onClick={() => setFilter("completed")}
            >
              Выполненные
            </button>

            <button
              className={filter === "cancelled" ? "active" : ""}
              onClick={() => setFilter("cancelled")}
            >
              Отменённые
            </button>
          </div>
        </div>

        {error && <div className="history-error">{error}</div>}

        <div className="history-results-heading">
          <h2>Архив задач</h2>
          <span>
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "задача" : "задач"}
          </span>
        </div>

        {loading ? (
          <div className="history-empty">
            Загрузка истории...
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="history-list">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === "completed";

              return (
                <article className="history-task-card" key={task.id}>
                  <div
                    className={`history-task-status ${
                      isCompleted ? "completed" : "cancelled"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={21} />
                    ) : (
                      <XCircle size={21} />
                    )}
                  </div>

                  <div className="history-task-content">
                    <div className="history-task-title-row">
                      <h3>{task.title}</h3>

                      <span
                        className={`history-status-label ${
                          isCompleted ? "completed" : "cancelled"
                        }`}
                      >
                        {isCompleted ? "Выполнено" : "Отменено"}
                      </span>
                    </div>

                    {task.description && (
                      <p className="history-task-description">
                        {task.description}
                      </p>
                    )}

                    <div className="history-task-meta">
                      <span>
                        <CalendarDays size={14} />
                        Срок: {formatDateTime(task.due_at)}
                      </span>

                      <span>
                        Приоритет:{" "}
                        {task.priority === "high"
                          ? "Высокий"
                          : task.priority === "medium"
                            ? "Средний"
                            : "Низкий"}
                      </span>
                    </div>
                  </div>

                  <button
                    className="history-restore-button"
                    onClick={() => restoreTask(task)}
                    title="Восстановить задачу"
                  >
                    <RotateCcw size={16} />
                    <span>Восстановить</span>
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="history-empty">
            <History size={34} />
            <h3>
              {search || filter !== "all"
                ? "Ничего не найдено"
                : "История пока пуста"}
            </h3>
            <p>
              {search || filter !== "all"
                ? "Попробуй изменить поисковый запрос или фильтр."
                : "Здесь будут отображаться выполненные и отменённые задачи."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default HistoryPage;