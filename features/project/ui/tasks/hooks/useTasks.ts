import type { Task } from "../types"

export function useTasks(projectId: string | undefined) {
  const updateTask = async (
    taskId: string,
    updates: { startDate?: string; endDate?: string; progress?: number }
  ) => {
    if (!projectId) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      throw err
    }
  }

  const reorderTasks = async (reorderedTasks: Task[]) => {
    if (!projectId) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}/tasks/reorder`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: reorderedTasks.map((task, index) => ({
            id: task.id,
            orderIndex: index,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to reorder tasks: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      throw err
    }
  }

  return {
    updateTask,
    reorderTasks,
  }
}
