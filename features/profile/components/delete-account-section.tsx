'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'
import type { DeleteAccountData } from '../types'

interface DeleteAccountSectionProps {
  onDelete: (data: DeleteAccountData) => Promise<void>
}

export function DeleteAccountSection({ onDelete }: DeleteAccountSectionProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    setError(null)

    if (!password) {
      setError('Введите пароль для подтверждения')
      return
    }

    try {
      setIsDeleting(true)
      await onDelete({ password })
      // Redirect to home page after successful deletion
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Опасная зона
        </CardTitle>
        <CardDescription>
          Необратимые действия с вашим аккаунтом
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              Удалить аккаунт
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие нельзя отменить. Будут безвозвратно удалены:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Ваш профиль и все данные</li>
                  <li>Все созданные организации</li>
                  <li>Все проекты и задачи</li>
                  <li>История активности</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deletePassword">
                  Введите пароль для подтверждения
                </Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ваш пароль"
                  disabled={isDeleting}
                />
              </div>
              {error && (
                <div className="text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Отмена
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? 'Удаление...' : 'Да, удалить аккаунт'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
