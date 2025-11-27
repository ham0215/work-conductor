export type TenantStatus = 'active' | 'suspended' | 'pending'

export interface Tenant {
  id: string
  name: string
  slug: string
  status: TenantStatus
  plan: string
  userCount: number
  createdAt: string
  updatedAt: string
}

export interface TenantFormData {
  name: string
  slug: string
  plan: string
}
