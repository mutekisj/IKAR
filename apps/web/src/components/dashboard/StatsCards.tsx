
import {
  ListTodo,
  CircleCheck,
  Clock3,
  AlertCircle,
} from "lucide-react";

interface StatsCardsProps {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export default function StatsCards({
  total,
  completed,
  pending,
  overdue,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Всего задач",
      value: total,
      description: "Все активные задачи",
      icon: ListTodo,
      color: "teal",
    },
    {
      title: "Выполнено",
      value: completed,
      description: "Успешно завершено",
      icon: CircleCheck,
      color: "green",
    },
    {
      title: "Ожидают",
      value: pending,
      description: "Требуют внимания",
      icon: Clock3,
      color: "blue",
    },
    {
      title: "Просрочено",
      value: overdue,
      description: "Нужно разобраться",
      icon: AlertCircle,
      color: "red",
    },
  ];

  return (
    <section className="stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article className="stat-card" key={stat.title}>
            <div className={`stat-icon ${stat.color}`}>
              <Icon size={20} strokeWidth={1.8} />
            </div>

            <div className="stat-info">
              <span>{stat.title}</span>
              <strong>{stat.value}</strong>
              <small>{stat.description}</small>
            </div>
          </article>
        );
      })}
    </section>
  );
}
