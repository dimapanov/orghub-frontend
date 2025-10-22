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
import type { BudgetCategory, BudgetItem, BudgetStatus } from "./types"
import { BudgetStatusLabels } from "./types"

interface AddBudgetItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: BudgetCategory[]
  onSubmit: (data: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">) => Promise<void>
}

export function AddBudgetItemDialog({
  open,
  onOpenChange,
  categories,
  onSubmit
}: AddBudgetItemDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    quantity: 1,
    unitPrice: 0,
    planned: 0,
    actual: 0,
    supplier: "",
    notes: "",
    status: "PLANNED" as BudgetStatus,
    isPaid: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.categoryId) {
      alert("Заполните обязательные поля: название и категорию")
      return
    }

    await onSubmit({
      ...formData,
      planned: formData.planned || formData.quantity * formData.unitPrice,
      projectId: "", // Will be set by parent
      paidAt: formData.isPaid ? new Date() : null
    })

    // Reset form
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      quantity: 1,
      unitPrice: 0,
      planned: 0,
      actual: 0,
      supplier: "",
      notes: "",
      status: "PLANNED" as BudgetStatus,
      isPaid: false
    })

    onOpenChange(false)
  }

  const handleCalculatePlanned = () => {
    setFormData(prev => ({
      ...prev,
      planned: prev.quantity * prev.unitPrice
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Добавить расход</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом расходе в бюджете проекта
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Основная информация */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Аренда зала"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория *</Label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon && `${cat.icon} `}{cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание расхода"
              />
            </div>

            {/* Количество и цена */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Цена за единицу</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Итого (план)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={formData.planned}
                    onChange={(e) => setFormData({ ...formData, planned: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCalculatePlanned}
                    title="Рассчитать автоматически"
                  >
                    =
                  </Button>
                </div>
              </div>
            </div>

            {/* Факт и статус */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actual">Фактическая стоимость</Label>
                <Input
                  id="actual"
                  type="number"
                  min="0"
                  value={formData.actual}
                  onChange={(e) => setFormData({ ...formData, actual: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BudgetStatus })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(BudgetStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Поставщик и примечания */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Поставщик</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Название компании"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Примечания</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Дополнительная информация"
                />
              </div>
            </div>

            {/* Оплачено */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPaid"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPaid" className="font-normal">
                Оплачено
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить расход
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}