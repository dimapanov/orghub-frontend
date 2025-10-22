'use client'

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { OrganizationForm } from "./organization-form"

interface CreateOrganizationDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function CreateOrganizationDialog({
  children,
  onSuccess,
}: CreateOrganizationDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать организацию</DialogTitle>
          <DialogDescription>
            Создайте новую организацию для управления проектами и командой
          </DialogDescription>
        </DialogHeader>
        <OrganizationForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  )
}
