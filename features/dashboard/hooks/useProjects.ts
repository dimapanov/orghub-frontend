import { useState, useEffect } from "react"
import { SecureTokenManager } from "@/shared/lib"
import type { Project } from "../types/index"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const token = SecureTokenManager.getToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/projects`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )

      if (!response.ok) {
        throw new Error("Не удалось загрузить проекты")
      }

      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      const token = SecureTokenManager.getToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )

      if (!response.ok) {
        throw new Error("Не удалось удалить проект")
      }

      // Обновляем список проектов после успешного удаления
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } catch (err) {
      throw err instanceof Error ? err : new Error("Произошла ошибка при удалении")
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    deleteProject,
  }
}
