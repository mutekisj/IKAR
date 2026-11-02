
export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  due_at: string;
  status: TaskStatus;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}
