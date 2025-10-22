'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { Users, Briefcase, MoreVertical, Trash2, Settings } from "lucide-react"
import type { Organization } from "../types/index"
import { formatDate } from "@/shared/lib"

interface OrganizationCardProps {
  organization: Organization
  onDelete: (organizationId: string) => Promise<void>
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "owner":
      return "default"
    case "admin":
      return "secondary"
    case "member":
      return "outline"
    default:
      return "outline"
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case "owner":
      return "Владелец"
    case "admin":
      return "Администратор"
    case "member":
      return "Участник"
    default:
      return role
  }
}

export function OrganizationCard({ organization, onDelete }: OrganizationCardProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCardClick = () => {
    router.push(`/organizations/${organization.id}`)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(organization.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Ошибка при удалении организации:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const canDelete = organization.role === "owner"

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow relative cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge variant={getRoleBadgeVariant(organization.role) as any}>
              {getRoleLabel(organization.role)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/organizations/${organization.id}/settings`)
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Настройки
                </DropdownMenuItem>
                {canDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-xl line-clamp-2">{organization.name}</CardTitle>
          {organization.description && (
            <CardDescription className="line-clamp-2">
              {organization.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {organization.memberCount !== undefined && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {organization.memberCount}{" "}
                  {organization.memberCount === 1
                    ? "участник"
                    : organization.memberCount < 5
                    ? "участника"
                    : "участников"}
                </span>
              </div>
            )}
            {organization.projectCount !== undefined && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>
                  {organization.projectCount}{" "}
                  {organization.projectCount === 1
                    ? "проект"
                    : organization.projectCount < 5
                    ? "проекта"
                    : "проектов"}
                </span>
              </div>
            )}
            <div className="pt-2 border-t text-xs">
              Создана: {formatDate(organization.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить организацию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить организацию "{organization.name}"? Это действие
              нельзя отменить. Все проекты и данные организации будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
