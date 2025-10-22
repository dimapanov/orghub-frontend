'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { ProjectForm } from "./project-form"

interface CreateProjectDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function CreateProjectDialog({
  children,
  onSuccess,
}: CreateProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSuccess = (projectId: string) => {
    setOpen(false)
    onSuccess?.()
    // Redirect to the new project page
    router.push(`/events/${projectId}`)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать проект</DialogTitle>
          <DialogDescription>
            Заполните информацию о проекте, чтобы начать работу
          </DialogDescription>
        </DialogHeader>
        <ProjectForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  )
}
