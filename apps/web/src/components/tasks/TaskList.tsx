
import { CalendarDays, Check, Circle, Trash2} from "lucide-react";
import type { Task } from "../../types/task";
import { formatDateTime } from "../../utils/dateFormatter";

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

export default function TaskList({
  tasks,
  onComplete,
  onDelete,
  onEdit,
}: TaskListProps) {
  const priorityLabels = {
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
  };

  if (tasks.length === 0) {
    return (
      <section className="content-card task-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR WORKSPACE</span>
            <h2>Ближайшие задачи</h2>
          </div>
        </div>

        <div className="empty-state">
          <Circle size={30} />
          <strong>Пока здесь тихо</strong>
          <span>Создай первую задачу, и она появится здесь.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="content-card task-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2>Ближайшие задачи</h2>
        </div>
        <span className="task-count">{tasks.length} задач</span>
      </div>

      <div className="task-list">
        {tasks.map((task) => {
          const dueDate = new Date(task.due_at);
          const isOverdue = dueDate.getTime() < Date.now();
          const isCompleted = task.status === "completed";

          return (
            <article className="task-row" key={task.id}>
              <button
                className={`task-status-icon ${isCompleted ? "completed" : ""}`}
                onClick={() => onComplete(task.id)}
                title={isCompleted ? "Вернуть в работу" : "Завершить задачу"}
              >
                {isCompleted ? <Check size={17} /> : <Circle size={17} />}
              </button>

              <button
                type="button"
                className="task-main task-edit-trigger"
                onClick={() => onEdit(task)}
                title="Редактировать задачу"
                >
                <strong className={isCompleted ? "task-completed" : ""}>
                    {task.title}
                </strong>
                <span>{task.description || "Описание отсутствует"}</span>
                </button>

              <div className="task-meta">
                <span className={`priority-badge ${task.priority}`}>
                  {priorityLabels[task.priority]}
                </span>

                <span className={isOverdue && !isCompleted ? "due-date overdue" : "due-date"}>
                  <CalendarDays size={14} />
                  {formatDateTime(task.due_at)}
                </span>

                <button
                  className="task-action-button delete"
                  onClick={() => onDelete(task.id)}
                  title="Удалить задачу"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
