import { useState, useEffect, useCallback } from "react"

export interface TeamMember {
  id: string
  userId: string
  organizationId: string
  role: string
  permissions: string[]
  joinedAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

export function useOrganizationTeam(organizationId: string) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!organizationId) {
      setError("Organization ID is required")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/organizations/${organizationId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.statusText}`)
      }

      const data = await response.json()
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const addMember = async (userId: string, role: string, permissions: string[] = []) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/organizations/${organizationId}/members`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role, permissions }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to add member: ${response.statusText}`)
      }

      const newMember = await response.json()
      setMembers((prev) => [...prev, newMember])
      return newMember
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred adding member"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateMember = async (memberId: string, updates: { role?: string; permissions?: string[] }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update member: ${response.statusText}`)
      }

      const updatedMember = await response.json()
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updatedMember : m)))
      return updatedMember
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred updating member"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const removeMember = async (memberId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to remove member: ${response.statusText}`)
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred removing member"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    members,
    isLoading,
    error,
    addMember,
    updateMember,
    removeMember,
    refetch: fetchMembers,
  }
}
