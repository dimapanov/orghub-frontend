export const formatDate = (dateString: string | null) => {
  if (!dateString) return "Дата не указана"
  const date = new Date(dateString)
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
