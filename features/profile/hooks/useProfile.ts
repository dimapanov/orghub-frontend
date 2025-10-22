import { useState, useEffect } from 'react'
import { SecureTokenManager } from '@/shared/lib'
import type { User, UpdateProfileData, ChangePasswordData, DeleteAccountData } from '../types'

export function useProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const token = SecureTokenManager.getToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/profile`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )

      if (!response.ok) {
        throw new Error('Не удалось загрузить профиль')
      }

      const data = await response.json()
      setUser(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const token = SecureTokenManager.getToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось обновить профиль')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      return updatedUser
    } catch (err) {
      throw err instanceof Error ? err : new Error('Произошла ошибка при обновлении')
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    try {
      const token = SecureTokenManager.getToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/profile/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось изменить пароль')
      }

      return await response.json()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Произошла ошибка при изменении пароля')
    }
  }

  const deleteAccount = async (data: DeleteAccountData) => {
    try {
      const token = SecureTokenManager.getToken()

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/profile`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось удалить аккаунт')
      }

      // Clear token after successful deletion
      SecureTokenManager.clearToken()

      return await response.json()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Произошла ошибка при удалении аккаунта')
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    user,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
    changePassword,
    deleteAccount,
  }
}
