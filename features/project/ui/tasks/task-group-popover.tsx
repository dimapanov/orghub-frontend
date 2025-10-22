import { useState, useEffect, type ReactNode } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Trash2 } from "lucide-react"
import type { TaskGroup } from "../../types"

interface TaskGroupPopoverProps {
  group?: TaskGroup
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreate?: (groupData: { name: string; description?: string; color?: string }) => Promise<any>
  onUpdate?: (groupId: string, updates: { name?: string; description?: string; color?: string }) => Promise<any>
  onDelete?: (groupId: string) => Promise<any>
}

export function TaskGroupPopover({
  group,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onCreate,
  onUpdate,
  onDelete
}: TaskGroupPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const isCreateMode = !group

  const [formData, setFormData] = useState({
    name: group?.name || "",
    description: group?.description || "",
  })

  // Сброс формы при открытии
  useEffect(() => {
    if (open) {
      if (isCreateMode) {
        setFormData({
          name: "",
          description: "",
        })
      } else if (group) {
        setFormData({
          name: group.name,
          description: group.description || "",
        })
      }
    }
  }, [open, isCreateMode, group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isCreateMode && onCreate && formData.name.trim()) {
      await onCreate({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })
    } else if (!isCreateMode && group && onUpdate) {
      await onUpdate(group.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })
    }
    setOpen(false)
  }

  const handleDelete = async () => {
    if (!group || !onDelete) return

    if (confirm(`Вы уверены, что хотите удалить группу "${group.name}"?`)) {
      await onDelete(group.id)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="end"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              {isCreateMode ? "Новая группа" : "Редактировать группу"}
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название группы..."
              required
              autoFocus={isCreateMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (опционально)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Добавьте описание..."
            />
          </div>

          <div className="flex justify-between gap-2 pt-2">
            {!isCreateMode && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                className="h-10 w-10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={!formData.name.trim()}>
                {isCreateMode ? "Создать" : "Сохранить"}
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
