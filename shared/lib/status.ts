export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: "secondary",
    PLANNING: "default",
    IN_PROGRESS: "default",
    REVIEW: "default",
    COMPLETED: "default",
    ARCHIVED: "secondary",
    CANCELLED: "destructive",
  }
  return colors[status] || "secondary"
}

export const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    DRAFT: "Черновик",
    PLANNING: "Планирование",
    IN_PROGRESS: "В работе",
    REVIEW: "На проверке",
    COMPLETED: "Завершен",
    ARCHIVED: "Архив",
    CANCELLED: "Отменен",
  }
  return labels[status] || status
}
