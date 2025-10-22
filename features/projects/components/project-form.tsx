'use client'

import { useState, useEffect } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { SecureTokenManager } from "@/shared/lib"
import { Calendar, MapPin, Building2, AlertCircle } from "lucide-react"

interface Organization {
  id: string
  name: string
}

interface ProjectFormProps {
  onSuccess?: (projectId: string) => void
  onCancel?: () => void
}

export function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    organizationId: "",
    type: "OTHER" as "CONFERENCE" | "MEETUP" | "WORKSHOP" | "WEBINAR" | "OTHER"
  })
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const token = SecureTokenManager.getToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/organizations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch organizations')

      const data = await response.json()
      setOrganizations(data)

      // Auto-select first organization if available
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, organizationId: data[0].id }))
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
      setError('Не удалось загрузить список организаций')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!formData.name.trim()) {
      setError("Название проекта обязательно")
      setIsLoading(false)
      return
    }

    if (!formData.organizationId) {
      setError("Выберите организацию")
      setIsLoading(false)
      return
    }

    try {
      const token = SecureTokenManager.getToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/projects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || undefined,
            date: formData.date || undefined,
            location: formData.location || undefined,
            organizationId: formData.organizationId,
            type: formData.type,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create project')
      }

      const project = await response.json()
      onSuccess?.(project.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при создании проекта')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">
          Название проекта <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Например: Годовая конференция 2025"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">
          Организация <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.organizationId}
          onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите организацию" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {org.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Тип проекта</Label>
        <Select
          value={formData.type}
          onValueChange={(value: any) => setFormData({ ...formData, type: value })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONFERENCE">Конференция</SelectItem>
            <SelectItem value="MEETUP">Митап</SelectItem>
            <SelectItem value="WORKSHOP">Воркшоп</SelectItem>
            <SelectItem value="WEBINAR">Вебинар</SelectItem>
            <SelectItem value="OTHER">Другое</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          placeholder="Краткое описание проекта..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">
            <Calendar className="h-4 w-4 inline mr-1" />
            Дата проведения
          </Label>
          <Input
            id="date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            <MapPin className="h-4 w-4 inline mr-1" />
            Место проведения
          </Label>
          <Input
            id="location"
            placeholder="Адрес или название места"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              Создание...
            </div>
          ) : (
            'Создать проект'
          )}
        </Button>
      </div>
    </form>
  )
}
