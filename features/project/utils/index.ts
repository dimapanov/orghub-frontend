import type { TaskPriority, TaskStatus } from "../types"

export const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case "CRITICAL":
      return "destructive"
    case "HIGH":
      return "destructive"
    case "MEDIUM":
      return "secondary"
    case "LOW":
      return "outline"
    default:
      return "outline"
  }
}

export const getTaskStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "COMPLETED":
      return "default"
    case "IN_PROGRESS":
      return "secondary"
    case "REVIEW":
      return "secondary"
    case "PENDING":
      return "outline"
    case "CANCELLED":
      return "destructive"
    case "ON_HOLD":
      return "outline"
    default:
      return "outline"
  }
}

export const getTaskStatusLabel = (status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    PENDING: "В ожидании",
    IN_PROGRESS: "В процессе",
    COMPLETED: "Завершена",
    REVIEW: "На проверке",
    CANCELLED: "Отменена",
    ON_HOLD: "Приостановлена",
  }
  return labels[status] || status
}

export const getPriorityLabel = (priority: TaskPriority): string => {
  const labels: Record<TaskPriority, string> = {
    LOW: "Низкий",
    MEDIUM: "Средний",
    HIGH: "Высокий",
    CRITICAL: "Критический",
  }
  return labels[priority] || priority
}
