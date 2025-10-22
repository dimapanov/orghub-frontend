import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import type { BudgetCategory } from "./types"

interface AddCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<BudgetCategory, "id" | "createdAt" | "updatedAt">) => Promise<void>
}

// Предустановленные иконки для категорий
const categoryIcons = [
  { value: "🏢", label: "Место проведения" },
  { value: "🍽️", label: "Кейтеринг" },
  { value: "🎭", label: "Развлечения" },
  { value: "📸", label: "Фото/Видео" },
  { value: "🎵", label: "Музыка" },
  { value: "💐", label: "Декорации" },
  { value: "🚗", label: "Транспорт" },
  { value: "👔", label: "Персонал" },
  { value: "🎁", label: "Подарки" },
  { value: "📄", label: "Документы" },
  { value: "🔧", label: "Техническое обеспечение" },
  { value: "📢", label: "Маркетинг" },
  { value: "💡", label: "Прочее" }
]

// Предустановленные цвета
const categoryColors = [
  { value: "#ef4444", label: "Красный" },
  { value: "#f97316", label: "Оранжевый" },
  { value: "#f59e0b", label: "Янтарный" },
  { value: "#eab308", label: "Желтый" },
  { value: "#84cc16", label: "Лайм" },
  { value: "#22c55e", label: "Зеленый" },
  { value: "#10b981", label: "Изумрудный" },
  { value: "#14b8a6", label: "Бирюзовый" },
  { value: "#06b6d4", label: "Циан" },
  { value: "#0ea5e9", label: "Голубой" },
  { value: "#3b82f6", label: "Синий" },
  { value: "#6366f1", label: "Индиго" },
  { value: "#8b5cf6", label: "Фиолетовый" },
  { value: "#a855f7", label: "Пурпурный" },
  { value: "#d946ef", label: "Фуксия" },
  { value: "#ec4899", label: "Розовый" },
]

export function AddCategoryDialog({
  open,
  onOpenChange,
  onSubmit
}: AddCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "💡",
    color: "#6366f1",
    orderIndex: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      alert("Введите название категории")
      return
    }

    await onSubmit({
      ...formData,
      projectId: "" // Will be set by parent
    })

    // Reset form
    setFormData({
      name: "",
      description: "",
      icon: "💡",
      color: "#6366f1",
      orderIndex: 0
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Добавить категорию</DialogTitle>
            <DialogDescription>
              Создайте новую категорию для группировки расходов
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Название */}
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Декорации"
                required
              />
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание категории"
              />
            </div>

            {/* Иконка */}
            <div className="space-y-2">
              <Label htmlFor="icon">Иконка</Label>
              <select
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categoryIcons.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.value} {icon.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Цвет */}
            <div className="space-y-2">
              <Label htmlFor="color">Цвет</Label>
              <div className="flex gap-2 items-center">
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categoryColors.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
                <div
                  className="w-10 h-10 rounded-md border"
                  style={{ backgroundColor: formData.color }}
                />
              </div>
            </div>

            {/* Порядок сортировки */}
            <div className="space-y-2">
              <Label htmlFor="orderIndex">Порядок сортировки</Label>
              <Input
                id="orderIndex"
                type="number"
                min="0"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Создать категорию
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}