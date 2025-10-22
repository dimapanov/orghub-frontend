import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Plus, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { BudgetTable } from "./budget-table"
import { AddBudgetItemDialog } from "./add-budget-item-dialog"
import { AddCategoryDialog } from "./add-category-dialog"
import type { BudgetCategory, BudgetItem } from "./types"

interface BudgetPageProps {
  categories: BudgetCategory[]
  items: BudgetItem[]
  onCreateCategory: (data: Omit<BudgetCategory, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onUpdateCategory: (id: string, data: Partial<BudgetCategory>) => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
  onCreateItem: (data: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onUpdateItem: (id: string, data: Partial<BudgetItem>) => Promise<void>
  onDeleteItem: (id: string) => Promise<void>
}

export function BudgetPage({
  categories,
  items,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
}: BudgetPageProps) {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Расчет общих сумм
  const totalPlanned = items.reduce((sum, item) => sum + item.planned, 0)
  const totalActual = items.reduce((sum, item) => sum + item.actual, 0)
  const difference = totalPlanned - totalActual
  const percentSpent = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0

  // Фильтрация по категории
  const filteredItems = selectedCategory
    ? items.filter(item => item.categoryId === selectedCategory)
    : items

  return (
    <div className="space-y-6">
      {/* Карточки со статистикой */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Запланировано</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: "RUB",
                maximumFractionDigits: 0
              }).format(totalPlanned)}
            </div>
            <p className="text-xs text-muted-foreground">
              Общий бюджет проекта
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Потрачено</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: "RUB",
                maximumFractionDigits: 0
              }).format(totalActual)}
            </div>
            <p className="text-xs text-muted-foreground">
              {percentSpent.toFixed(1)}% от бюджета
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {difference >= 0 ? "Остаток" : "Перерасход"}
            </CardTitle>
            {difference >= 0 ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${difference >= 0 ? "text-green-600" : "text-red-600"}`}>
              {new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: "RUB",
                maximumFractionDigits: 0
              }).format(Math.abs(difference))}
            </div>
            <p className="text-xs text-muted-foreground">
              {difference >= 0 ? "Доступно для расходов" : "Превышение бюджета"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Категории</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Категорий расходов
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Основная карточка с таблицей */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Бюджет проекта</CardTitle>
              <CardDescription>
                Управление расходами и планирование бюджета
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddCategoryOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Категория
              </Button>
              <Button onClick={() => setIsAddItemOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить расход
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Фильтр по категориям */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              Все категории
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Таблица */}
          <BudgetTable
            items={filteredItems}
            categories={categories}
            onUpdateItem={onUpdateItem}
            onDeleteItem={onDeleteItem}
          />
        </CardContent>
      </Card>

      {/* Диалоги */}
      <AddBudgetItemDialog
        open={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        categories={categories}
        onSubmit={onCreateItem}
      />

      <AddCategoryDialog
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onSubmit={onCreateCategory}
      />
    </div>
  )
}