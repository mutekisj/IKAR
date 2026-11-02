import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
} from "lucide-react";

import type { Task } from "../types/task";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

import TaskList from "../components/tasks/TaskList";
import TaskForm, {
  type CreateTaskData,
} from "../components/tasks/TaskForm";

import { formatDate } from "../utils/dateFormatter";

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setError("");
    } catch (err) {
      setError("Не удалось загрузить задачи");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // Формируем сетку календаря на 42 ячейки
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = (firstDay.getDay() + 6) % 7;

    const startDate = new Date(year, month, 1 - startDay);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    });
  }, [currentDate]);

  // Задачи, относящиеся к выбранному дню
  const selectedTasks = tasks.filter(
    (task) =>
      getDateKey(new Date(task.due_at)) === getDateKey(selectedDate)
  );

  function getTasksForDay(date: Date) {
    return tasks.filter(
      (task) =>
        getDateKey(new Date(task.due_at)) === getDateKey(date)
    );
  }

  function changeMonth(direction: number) {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + direction,
        1
      )
    );
  }

  function goToToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }

  async function handleSubmit(data: CreateTaskData) {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }

    setIsFormOpen(false);
    setEditingTask(null);
    await loadTasks();
  }

  async function handleCompleteTask(id: number) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    await updateTask(id, {
      status: task.status === "completed" ? "pending" : "completed",
    });

    await loadTasks();
  }

  async function handleDeleteTask(id: number) {
    await deleteTask(id);
    await loadTasks();
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  function handleCreateTask() {
  setEditingTask(null);
  setIsFormOpen(true);
    }

  const monthTitle = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const todayKey = getDateKey(new Date());
  const selectedKey = getDateKey(selectedDate);

  return (
    <div className="calendar-page">
      <header className="calendar-page-header">
        <div>
          <span className="page-eyebrow">ПЛАНИРОВАНИЕ</span>
          <h1>Календарь</h1>
          <p>Все твои планы и задачи в одном месте</p>
        </div>

        <button className="calendar-create-button" onClick={handleCreateTask}>
          <Plus size={18} />
          Новая задача
        </button>
      </header>

      {error && <div className="calendar-error">{error}</div>}

      <div className="calendar-layout">
        <section className="calendar-main">
          <div className="calendar-toolbar">
            <div className="calendar-month-navigation">
              <button
                className="calendar-arrow"
                onClick={() => changeMonth(-1)}
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft size={20} />
              </button>

              <h2>{monthTitle}</h2>

              <button
                className="calendar-arrow"
                onClick={() => changeMonth(1)}
                aria-label="Следующий месяц"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <button className="calendar-today-button" onClick={goToToday}>
              Сегодня
            </button>
          </div>

          <div className="calendar-grid">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            ))}

            {calendarDays.map((date) => {
              const dateKey = getDateKey(date);
              const dayTasks = getTasksForDay(date);
              const isCurrentMonth =
                date.getMonth() === currentDate.getMonth();
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedKey;

              return (
                <button
                  key={dateKey}
                  className={[
                    "calendar-day",
                    !isCurrentMonth ? "other-month" : "",
                    isToday ? "today" : "",
                    isSelected ? "selected" : "",
                  ].join(" ")}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="calendar-day-number">
                    {date.getDate()}
                  </span>

                  <div className="calendar-day-tasks">
                    {dayTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`calendar-task-dot priority-${task.priority} ${
                          task.status === "completed" ? "task-completed" : ""
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </span>
                    ))}

                    {dayTasks.length > 3 && (
                      <span className="calendar-more">
                        +{dayTasks.length - 3} ещё
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span><i className="legend-dot high" /> Высокий приоритет</span>
            <span><i className="legend-dot medium" /> Средний приоритет</span>
            <span><i className="legend-dot low" /> Низкий приоритет</span>
          </div>
        </section>

        <aside className="calendar-sidebar">
          <div className="calendar-selected-header">
            <div className="calendar-selected-icon">
              <CalendarDays size={20} />
            </div>
            <div>
              <span>ВЫБРАННАЯ ДАТА</span>
              <h3>{formatDate(selectedDate)}</h3>
            </div>
          </div>

          <div className="calendar-selected-content">
            <div className="calendar-selected-title">
              <h3>Задачи на день</h3>
              <span>{selectedTasks.length}</span>
            </div>

            {loading ? (
              <p className="calendar-empty">Загрузка задач...</p>
            ) : selectedTasks.length > 0 ? (
              <TaskList
                tasks={selectedTasks}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
              />
            ) : (
              <div className="calendar-empty">
                <CalendarDays size={30} />
                <p>На этот день задач пока нет</p>
                <button onClick={handleCreateTask}>
                  <Plus size={16} />
                  Добавить задачу
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {isFormOpen && (
        <TaskForm
            onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
            }}
            onSubmit={handleSubmit}
            task={editingTask}
            initialDate={selectedDate}
        />
    )}
    </div>
  );
}

export default CalendarPage;