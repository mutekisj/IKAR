
import { useState, type SyntheticEvent } from "react";
import { X, CalendarDays, Flag, FileText } from "lucide-react";
import type { Task, TaskPriority } from "../../types/task";

export interface CreateTaskData {
  title: string;
  description: string;
  priority: TaskPriority;
  due_at: string;
}

interface TaskFormProps {
  onClose: () => void;
  onSubmit: (data: CreateTaskData) => Promise<void>;
  task?: Task | null;
  initialDate?: Date;
}

function getLocalDateTime(date: string) {
  const value = new Date(date);

  const pad = (number: number) => String(number).padStart(2, "0");

  return {
    date: `${pad(value.getDate())}.${pad(value.getMonth() + 1)}.${value.getFullYear()}`,
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}`,
  };
}

function formatDateForInput(date: Date): string {
  const pad = (number: number) => String(number).padStart(2, "0");

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function parseRussianDateTime(date: string, time: string): Date | null {
  const dateMatch = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  const timeMatch = time.match(/^(\d{2}):(\d{2})$/);

  if (!dateMatch || !timeMatch) return null;

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (
    month < 1 || month > 12 ||
    hours > 23 || minutes > 59
  ) {
    return null;
  }

  const result = new Date(year, month - 1, day, hours, minutes);

  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return null;
  }

  return result;
}


export default function TaskForm({
  onClose,
  onSubmit,
  task,
  initialDate,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "medium"
  );
  const initialDateTime = task
  ? getLocalDateTime(task.due_at)
  : {
      date: initialDate ? formatDateForInput(initialDate) : "",
      time: "",
    };
  const [dueDate, setDueDate] = useState(initialDateTime.date);
  const [dueTime, setDueTime] = useState(initialDateTime.time);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Введите название задачи.");
      return;
    }

    if (!dueDate || !dueTime) {
        setError("Укажите дату и время выполнения.");
        return;
    }

    const selectedDate = parseRussianDateTime(dueDate, dueTime);

    if (!selectedDate) {
    setError("Введите корректную дату и время. Пример: 30.10.2026 и 19:45.");
    return;
    }

    if (selectedDate.getTime() <= Date.now()) {
      setError("Дата выполнения должна быть в будущем.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_at: selectedDate.toISOString(),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить задачу."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {task ? "TASK MANAGEMENT / EDIT" : "TASK MANAGEMENT / NEW"}
            </span>

            <h2 id="task-modal-title">
              {task ? "Редактирование задачи" : "Новая задача"}
            </h2>

            <p>
              {task
                ? "Измени необходимые данные задачи."
                : "Заполни информацию о предстоящем деле."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Название задачи</span>
            <input
              type="text"
              placeholder="Например, подготовить диплом"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              autoFocus
            />
          </label>

          <label className="form-field">
            <span>
              <FileText size={15} />
              Описание
              <small>Необязательно</small>
            </span>

            <textarea
              placeholder="Добавь подробности задачи..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </label>

          <label className="form-field">
            <span>
              <Flag size={15} />
              Приоритет
            </span>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority)
              }
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </label>

          <label className="form-field">
            <span>
              <CalendarDays size={15} />
              Дата и время выполнения
            </span>
            <div className="date-time-fields">
            <label className="form-field">
                <span>Дата</span>
                <input
                type="text"
                placeholder="ДД.ММ.ГГГГ"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                maxLength={10}
                />
            </label>

            <label className="form-field">
                <span>Время</span>
                <input
                type="text"
                placeholder="ЧЧ:ММ"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
                maxLength={5}
                />
            </label>
            </div>
          </label>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={submitting}
            >
              Отмена
            </button>

            <button
              type="submit"
              className="create-task-button"
              disabled={submitting}
            >
              {submitting
                ? "Сохранение..."
                : task
                  ? "Сохранить изменения"
                  : "Создать задачу"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
