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

// Tenant Settings Types
export interface CustomLabel {
  id: string
  name: string
  color: string
  description?: string
}

export interface WorkCategory {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
}

export interface OrgNode {
  id: string
  name: string
  title: string
  parentId: string | null
  children?: OrgNode[]
}

export interface TenantSettings {
  tenantId: string
  customLabels: CustomLabel[]
  workCategories: WorkCategory[]
  orgChart: OrgNode[]
}
