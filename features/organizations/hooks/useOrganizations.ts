import { useState, useEffect } from "react"
import { SecureTokenManager } from "@/shared/lib"
import type { Organization } from "../types/index"

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      const token = SecureTokenManager.getToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/organizations`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )

      if (!response.ok) {
        throw new Error("Не удалось загрузить организации")
      }

      const data = await response.json()
      setOrganizations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteOrganization = async (organizationId: string) => {
    try {
      const token = SecureTokenManager.getToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/organizations/${organizationId}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )

      if (!response.ok) {
        throw new Error("Не удалось удалить организацию")
      }

      setOrganizations((prev) => prev.filter((org) => org.id !== organizationId))
    } catch (err) {
      throw err instanceof Error ? err : new Error("Произошла ошибка при удалении")
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  return {
    organizations,
    isLoading,
    error,
    refetch: fetchOrganizations,
    deleteOrganization,
  }
}
