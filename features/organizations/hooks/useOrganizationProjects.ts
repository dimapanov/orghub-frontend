import { useState, useEffect } from "react"
import type { Project } from "@/features/dashboard/types"

export function useOrganizationProjects(organizationId: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    if (!organizationId) {
      setError("Organization ID is required")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/organizations/${organizationId}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }

      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [organizationId])

  const deleteProject = async (projectId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`)
      }

      // Обновляем локальное состояние
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred deleting project")
      throw err
    }
  }

  return {
    projects,
    isLoading,
    error,
    deleteProject,
    refetch: fetchProjects,
  }
}
