export interface BudgetCategory {
  id: string
  name: string
  description?: string | null
  color?: string | null
  icon?: string | null
  orderIndex: number
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export interface BudgetItem {
  id: string
  name: string
  description?: string | null
  planned: number
  actual: number
  quantity: number
  unitPrice: number
  supplier?: string | null
  notes?: string | null
  status: BudgetStatus
  isPaid: boolean
  paidAt?: Date | null
  categoryId: string
  projectId: string
  createdAt: Date
  updatedAt: Date
  category?: BudgetCategory
}

export enum BudgetStatus {
  PLANNED = "PLANNED",
  APPROVED = "APPROVED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export const BudgetStatusLabels: Record<BudgetStatus, string> = {
  [BudgetStatus.PLANNED]: "Запланировано",
  [BudgetStatus.APPROVED]: "Утверждено",
  [BudgetStatus.IN_PROGRESS]: "В работе",
  [BudgetStatus.COMPLETED]: "Завершено",
  [BudgetStatus.CANCELLED]: "Отменено"
}

export const BudgetStatusColors: Record<BudgetStatus, string> = {
  [BudgetStatus.PLANNED]: "bg-gray-100 text-gray-800",
  [BudgetStatus.APPROVED]: "bg-blue-100 text-blue-800",
  [BudgetStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [BudgetStatus.COMPLETED]: "bg-green-100 text-green-800",
  [BudgetStatus.CANCELLED]: "bg-red-100 text-red-800"
}