'use client'

import { useParams } from "next/navigation"
import { useBudget } from "@/features/project/hooks"
import { BudgetPage } from "@/features/project/ui/budget"

export default function ProjectBudgetPage() {
  const params = useParams()
  const id = params.id as string

  const {
    categories,
    items,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem
  } = useBudget(id)

  return (
    <BudgetPage
      categories={categories}
      items={items}
      onCreateCategory={createCategory}
      onUpdateCategory={updateCategory}
      onDeleteCategory={deleteCategory}
      onCreateItem={createItem}
      onUpdateItem={updateItem}
      onDeleteItem={deleteItem}
    />
  )
}
