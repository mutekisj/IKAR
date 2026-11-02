
import { Plus, Search, Bell } from "lucide-react";
import { formatDate } from "../../utils/dateFormatter";

interface WelcomeHeaderProps {
  onCreateTask: () => void;
}

export default function WelcomeHeader({
  onCreateTask,
}: WelcomeHeaderProps) {
  const currentDate = formatDate(new Date());

  return (
    <header className="welcome-header">
      <div className="welcome-text">
        <span className="eyebrow">PERSONAL WORKSPACE / OVERVIEW</span>
        <h1>Добро пожаловать.</h1>
        <p>
          Сегодня {currentDate}. Давай сделаем этот день продуктивным.
        </p>
      </div>

      <div className="header-actions">
        <button className="icon-button" aria-label="Поиск">
          <Search size={19} />
        </button>

        <button className="icon-button" aria-label="Уведомления">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <button className="create-task-button" onClick={onCreateTask}>
          <Plus size={18} />
          <span>Новая задача</span>
        </button>
      </div>
    </header>
  );
}
