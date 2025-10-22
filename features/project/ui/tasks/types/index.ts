export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REVIEW" | "CANCELLED" | "ON_HOLD"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority | null
  startDate: string | null
  endDate: string | null
  taskGroupId: string | null
  orderIndex?: number
  parentId?: string | null
  children?: Task[]
  assignee: {
    id: string
    name: string
    avatar: string | null
  } | null
}

export type TaskListProps = {
  tasks: Task[]
  limit?: number
  onViewAll?: () => void
}

export type SortableTaskListProps = {
  tasks: Task[]
  limit?: number
  onViewAll?: () => void
  onReorder?: (tasks: Task[]) => void
  enableReordering?: boolean
  onToggleStatus?: (taskId: string) => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onAddSubtask?: (parentId: string, taskData: Partial<Task> & { title: string }) => Promise<any>
  onDelete?: (taskId: string) => Promise<any>
}

export type SortableTaskItemProps = {
  task: Task
  isDragging?: boolean
  onToggleStatus?: (taskId: string) => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onAddSubtask?: (parentId: string, taskData: Partial<Task> & { title: string }) => Promise<any>
  onDelete?: (taskId: string) => Promise<any>
  level?: number
  dropPosition?: 'top' | 'center' | 'bottom' | null
  activeTaskId?: string | null
}
