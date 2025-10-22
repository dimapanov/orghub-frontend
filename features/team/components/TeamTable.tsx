'use client'

import { useState } from "react"
import { MoreVertical, Trash2, Edit, Shield } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Avatar } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
}

interface TeamMember {
  id: string
  userId: string
  role: string
  permissions: string[]
  joinedAt?: string
  addedAt?: string
  user: User
}

interface TeamTableProps {
  members: TeamMember[]
  currentUserRole?: string
  onUpdateRole?: (memberId: string, role: string, permissions: string[]) => Promise<void>
  onRemoveMember?: (memberId: string) => Promise<void>
  isLoading?: boolean
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  MANAGER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  EDITOR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEMBER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  GUEST: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Владелец",
  ADMIN: "Администратор",
  MANAGER: "Менеджер",
  EDITOR: "Редактор",
  MEMBER: "Участник",
  VIEWER: "Наблюдатель",
  GUEST: "Гость",
}

export function TeamTable({ members, currentUserRole, onUpdateRole, onRemoveMember, isLoading }: TeamTableProps) {
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const canManageMembers = currentUserRole && ['OWNER', 'ADMIN'].includes(currentUserRole)

  const handleRemoveMember = async () => {
    if (!memberToDelete || !onRemoveMember) return

    setIsDeleting(true)
    try {
      await onRemoveMember(memberToDelete.id)
      setMemberToDelete(null)
    } catch (error) {
      console.error('Failed to remove member:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Загрузка команды...
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет участников в команде
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Участник</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Дата добавления</TableHead>
              {canManageMembers && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isOwner = member.role === 'OWNER'

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {member.user.avatar ? (
                          <img src={member.user.avatar} alt={member.user.name} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.user.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.user.email}
                  </TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[member.role] || "bg-gray-100"}>
                      {ROLE_LABELS[member.role] || member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.joinedAt || member.addedAt || new Date().toISOString())}
                  </TableCell>
                  {canManageMembers && (
                    <TableCell>
                      {!isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              // TODO: Открыть диалог редактирования роли
                              console.log('Edit role for', member.id)
                            }}>
                              <Shield className="mr-2 h-4 w-4" />
                              Изменить роль
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setMemberToDelete(member)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить из команды
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить участника?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить {memberToDelete?.user.name} из команды?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
