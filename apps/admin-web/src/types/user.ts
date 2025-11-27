export type UserStatus = 'active' | 'inactive' | 'pending'
export type UserRole = 'admin' | 'manager' | 'member'

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  status: UserStatus
  role: UserRole
  tenantId: string
  tenantName: string
  department?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface UserFilters {
  search: string
  status: UserStatus | 'all'
  role: UserRole | 'all'
  tenantId: string | 'all'
}
