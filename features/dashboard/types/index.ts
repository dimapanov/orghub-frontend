export type Project = {
  id: string
  name: string
  description: string | null
  date: string | null
  location: string | null
  status: string
  type: string
  progress: number
  organization: {
    id: string
    name: string
    logo: string | null
  }
  tasks: {
    id: string
    status: string
    priority: string
  }[]
}

export type ProjectStatus =
  | "DRAFT"
  | "PLANNING"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED"
