export type ProjectStatus =
  | "DRAFT"
  | "PLANNING"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED"

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REVIEW" | "CANCELLED" | "ON_HOLD"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type ProjectRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER" | "GUEST"

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

export type TaskGroup = {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  orderIndex: number
  isVisible: boolean
  projectId: string
  createdAt: string
  updatedAt: string
}

export type ProjectMember = {
  id: string
  role: ProjectRole
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

export type Activity = {
  id: string
  type: string
  action: string
  description: string | null
  createdAt: string
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

export type DetailedProject = {
  id: string
  name: string
  description: string | null
  date: string | null
  endDate: string | null
  location: string | null
  client: string | null
  status: ProjectStatus
  type: string
  budgetPlanned: number
  budgetActual: number
  guestCount: number
  progress: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  organization: {
    id: string
    name: string
    logo: string | null
  }
  tasks: Task[]
  taskGroups: TaskGroup[]
  members: ProjectMember[]
  activities: Activity[]
}
