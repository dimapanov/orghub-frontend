export interface Organization {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  role: 'owner' | 'admin' | 'member'
  memberCount?: number
  projectCount?: number
}

export interface OrganizationMember {
  id: string
  userId: string
  userName: string
  userEmail: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}
