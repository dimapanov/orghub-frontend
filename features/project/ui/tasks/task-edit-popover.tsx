import { useState, useEffect, type ReactNode } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { DatePicker } from "@/shared/ui/date-picker"
import { Info, Trash2 } from "lucide-react"
import type { Task, TaskStatus, TaskPriority } from "./types"

interface TaskEditPopoverProps {
  task?: Task
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onCreate?: (taskData: Partial<Task> & { title: string }) => Promise<any>
  onDelete?: (taskId: string) => Promise<any>
}

export function TaskEditPopover({
  task,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onUpdate,
  onCreate,
  onDelete
}: TaskEditPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const isCreateMode = !task

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "PENDING" as TaskStatus,
    priority: task?.priority || "NONE",
    startDate: task?.startDate ? new Date(task.startDate) : null,
    endDate: task?.endDate ? new Date(task.endDate) : null,
  })

  // Сброс формы при открытии в режиме создания
  useEffect(() => {
    if (open && isCreateMode) {
      setFormData({
        title: "",
        description: "",
        status: "PENDING",
        priority: "NONE",
        startDate: null,
        endDate: null,
      })
    }
  }, [open, isCreateMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isCreateMode && onCreate) {
      await onCreate({
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority === "NONE" ? undefined : (formData.priority as TaskPriority),
        startDate: formData.startDate ? formData.startDate.toISOString() : undefined,
        endDate: formData.endDate ? formData.endDate.toISOString() : undefined,
      })
    } else if (!isCreateMode && task && onUpdate) {
      onUpdate(task.id, {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority === "NONE" ? null : (formData.priority as TaskPriority),
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
      })
    }

    setOpen(false)
  }

  const handleDelete = async () => {
    if (!task || !onDelete) return

    if (confirm(`Вы уверены, что хотите удалить задачу "${task.title}"?`)) {
      await onDelete(task.id)
      setOpen(false)
    }
  }

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Info className="h-4 w-4" />
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-96"
        align="end"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              {isCreateMode ? "Новая задача" : "Редактировать задачу"}
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название задачи..."
              required
              autoFocus={isCreateMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Добавьте описание..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">В ожидании</SelectItem>
                  <SelectItem value="IN_PROGRESS">В работе</SelectItem>
                  <SelectItem value="COMPLETED">Завершено</SelectItem>
                  <SelectItem value="REVIEW">На проверке</SelectItem>
                  <SelectItem value="CANCELLED">Отменено</SelectItem>
                  <SelectItem value="ON_HOLD">Приостановлено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Приоритет</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Без приоритета</SelectItem>
                  <SelectItem value="LOW">Низкий</SelectItem>
                  <SelectItem value="MEDIUM">Средний</SelectItem>
                  <SelectItem value="HIGH">Высокий</SelectItem>
                  <SelectItem value="CRITICAL">Критический</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала</Label>
              <DatePicker
                date={formData.startDate}
                onSelect={(date) => setFormData({ ...formData, startDate: date || null })}
                placeholder="Выберите дату начала"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания</Label>
              <DatePicker
                date={formData.endDate}
                onSelect={(date) => setFormData({ ...formData, endDate: date || null })}
                placeholder="Выберите дату окончания"
              />
            </div>
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
              <Button type="submit">
                {isCreateMode ? "Создать" : "Сохранить"}
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
