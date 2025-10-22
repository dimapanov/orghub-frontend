export interface User {
  id: string
  email: string
  name: string
  avatar?: string | null
  createdAt: string
  lastLoginAt?: string | null
  emailVerified: boolean
}

export interface UpdateProfileData {
  name: string
  avatar?: string | null
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface DeleteAccountData {
  password: string
}
