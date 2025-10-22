import { useState, useEffect } from "react"
import type { Organization } from "../types"

export function useOrganization(organizationId: string) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!organizationId) {
        setError("Organization ID is required")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        const response = await fetch(`/api/organizations/${organizationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch organization: ${response.statusText}`)
        }

        const data = await response.json()
        setOrganization(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setOrganization(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganization()
  }, [organizationId])

  return {
    organization,
    isLoading,
    error,
  }
}
