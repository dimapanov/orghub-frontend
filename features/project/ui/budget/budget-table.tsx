import { useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Input } from "@/shared/ui/input"
import {
  Pencil,
  Trash2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2
} from "lucide-react"
import type { BudgetItem, BudgetCategory } from "./types"
import { BudgetStatus, BudgetStatusLabels, BudgetStatusColors } from "./types"

interface BudgetTableProps {
  items: BudgetItem[]
  categories: BudgetCategory[]
  onUpdateItem: (id: string, data: Partial<BudgetItem>) => Promise<void>
  onDeleteItem: (id: string) => Promise<void>
}

export function BudgetTable({
  items,
  categories,
  onUpdateItem,
  onDeleteItem
}: BudgetTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<BudgetItem>>({})
  const [sortField, setSortField] = useState<keyof BudgetItem>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Сортировка
  const sortedItems = [...items].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc"
        ? aValue - bValue
        : bValue - aValue
    }

    return 0
  })

  const handleSort = (field: keyof BudgetItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id)
    setEditingData({
      name: item.name,
      planned: item.planned,
      actual: item.actual,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      supplier: item.supplier,
      status: item.status
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData({})
  }

  const saveEdit = async () => {
    if (editingId) {
      await onUpdateItem(editingId, editingData)
      setEditingId(null)
      setEditingData({})
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот расход?")) {
      await onDeleteItem(id)
    }
  }

  const togglePaid = async (item: BudgetItem) => {
    await onUpdateItem(item.id, {
      isPaid: !item.isPaid,
      paidAt: !item.isPaid ? new Date() : null
    })
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : "Без категории"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0
    }).format(amount)
  }

  const SortIcon = ({ field }: { field: keyof BudgetItem }) => {
    if (sortField !== field) return null
    return sortDirection === "asc"
      ? <ChevronUp className="h-4 w-4 inline ml-1" />
      : <ChevronDown className="h-4 w-4 inline ml-1" />
  }

  return (
    <Table>
      <TableCaption>
        Всего расходов: {items.length}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("name")}
          >
            Название <SortIcon field="name" />
          </TableHead>
          <TableHead>Категория</TableHead>
          <TableHead className="text-center">Кол-во</TableHead>
          <TableHead className="text-right">Цена за ед.</TableHead>
          <TableHead
            className="text-right cursor-pointer"
            onClick={() => handleSort("planned")}
          >
            План <SortIcon field="planned" />
          </TableHead>
          <TableHead
            className="text-right cursor-pointer"
            onClick={() => handleSort("actual")}
          >
            Факт <SortIcon field="actual" />
          </TableHead>
          <TableHead className="text-center">Статус</TableHead>
          <TableHead className="text-center">Оплачено</TableHead>
          <TableHead>Поставщик</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              {editingId === item.id ? (
                <Input
                  value={editingData.name || ""}
                  onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                  className="h-8"
                />
              ) : (
                item.name
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {getCategoryName(item.categoryId)}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              {editingId === item.id ? (
                <Input
                  type="number"
                  value={editingData.quantity || 0}
                  onChange={(e) => setEditingData({ ...editingData, quantity: parseInt(e.target.value) || 0 })}
                  className="h-8 w-16"
                />
              ) : (
                item.quantity
              )}
            </TableCell>
            <TableCell className="text-right">
              {editingId === item.id ? (
                <Input
                  type="number"
                  value={editingData.unitPrice || 0}
                  onChange={(e) => setEditingData({ ...editingData, unitPrice: parseInt(e.target.value) || 0 })}
                  className="h-8 w-24"
                />
              ) : (
                formatCurrency(item.unitPrice)
              )}
            </TableCell>
            <TableCell className="text-right">
              {editingId === item.id ? (
                <Input
                  type="number"
                  value={editingData.planned || 0}
                  onChange={(e) => setEditingData({ ...editingData, planned: parseInt(e.target.value) || 0 })}
                  className="h-8 w-24"
                />
              ) : (
                formatCurrency(item.planned)
              )}
            </TableCell>
            <TableCell className="text-right">
              {editingId === item.id ? (
                <Input
                  type="number"
                  value={editingData.actual || 0}
                  onChange={(e) => setEditingData({ ...editingData, actual: parseInt(e.target.value) || 0 })}
                  className="h-8 w-24"
                />
              ) : (
                <span className={item.actual > item.planned ? "text-red-600 font-semibold" : ""}>
                  {formatCurrency(item.actual)}
                </span>
              )}
            </TableCell>
            <TableCell className="text-center">
              {editingId === item.id ? (
                <select
                  value={editingData.status || item.status}
                  onChange={(e) => setEditingData({ ...editingData, status: e.target.value as BudgetStatus })}
                  className="h-8 px-2 border rounded"
                >
                  {Object.entries(BudgetStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              ) : (
                <Badge className={BudgetStatusColors[item.status]}>
                  {BudgetStatusLabels[item.status]}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePaid(item)}
                className={item.isPaid ? "text-green-600" : "text-gray-400"}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>
              {editingId === item.id ? (
                <Input
                  value={editingData.supplier || ""}
                  onChange={(e) => setEditingData({ ...editingData, supplier: e.target.value })}
                  className="h-8"
                />
              ) : (
                item.supplier || "-"
              )}
            </TableCell>
            <TableCell className="text-right">
              {editingId === item.id ? (
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={saveEdit}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}