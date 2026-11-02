
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Clock3,
  Settings,
  CircleHelp,
  Command,
} from "lucide-react";

type Page = "dashboard" | "tasks" | "calendar" | "history";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navigation = [
  { title: "Обзор", icon: LayoutDashboard, page: "dashboard" as const },
  { title: "Мои задачи", icon: CheckSquare, page: "tasks" as const },
  { title: "Календарь",
    icon: CalendarDays,
    page: "calendar" as const,},
  { title: "История", icon: Clock3, page: "history" as const },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Command size={23} />
        </div>
        <div>
          <h1>IKAR</h1>
          <span>PERSONAL ASSISTANT</span>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">РАБОЧЕЕ ПРОСТРАНСТВО</span>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className={`nav-item ${activePage === item.page ? "active" : ""}`}
                onClick={() => {
                    if (item.page) onNavigate(item.page);
                }}
                disabled={!item.page}
                >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="nav-item">
          <CircleHelp size={19} />
          <span>Помощь</span>
        </button>

        <button className="nav-item">
          <Settings size={19} />
          <span>Настройки</span>
        </button>

        <div className="sidebar-user">
          <div className="user-avatar">G</div>
          <div className="user-info">
            <strong>Пользователь</strong>
            <span>Личный аккаунт</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
