'use client'

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface AddMemberDialogProps {
  onAddMember: (userId: string, role: string, permissions: string[]) => Promise<void>
  availableRoles: { value: string; label: string }[]
  children?: React.ReactNode
  type?: 'organization' | 'project'
}

const DEFAULT_ORG_ROLES = [
  { value: 'ADMIN', label: 'Администратор' },
  { value: 'MANAGER', label: 'Менеджер' },
  { value: 'MEMBER', label: 'Участник' },
  { value: 'GUEST', label: 'Гость' },
]

const DEFAULT_PROJECT_ROLES = [
  { value: 'ADMIN', label: 'Администратор' },
  { value: 'EDITOR', label: 'Редактор' },
  { value: 'VIEWER', label: 'Наблюдатель' },
  { value: 'GUEST', label: 'Гость' },
]

export function AddMemberDialog({
  onAddMember,
  availableRoles,
  children,
  type = 'organization'
}: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState(type === 'organization' ? 'MEMBER' : 'VIEWER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roles = availableRoles.length > 0
    ? availableRoles
    : type === 'organization'
      ? DEFAULT_ORG_ROLES
      : DEFAULT_PROJECT_ROLES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!userId.trim()) {
      setError('ID пользователя обязателен')
      return
    }

    setIsLoading(true)
    try {
      await onAddMember(userId.trim(), role, [])
      setOpen(false)
      setUserId('')
      setRole(type === 'organization' ? 'MEMBER' : 'VIEWER')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при добавлении участника')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Добавить участника
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Добавить участника</DialogTitle>
            <DialogDescription>
              Добавьте нового участника в {type === 'organization' ? 'организацию' : 'проект'} и назначьте ему роль.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">ID пользователя</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Введите ID пользователя"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Введите ID пользователя, которого хотите добавить
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Роль</Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((roleOption) => (
                    <SelectItem key={roleOption.value} value={roleOption.value}>
                      {roleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Добавление...' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
