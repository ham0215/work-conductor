import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TenantForm } from '../../components/TenantForm'
import type { Tenant, TenantFormData } from '../../types/tenant'
import '../../components/PageHeader.css'

// Mock data - will be replaced with API calls
const mockTenants: Record<string, Tenant> = {
  '1': {
    id: '1',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    status: 'active',
    plan: 'Enterprise',
    userCount: 45,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-20T15:30:00Z',
  },
  '2': {
    id: '2',
    name: 'Tech Startup Inc',
    slug: 'tech-startup',
    status: 'active',
    plan: 'Professional',
    userCount: 12,
    createdAt: '2024-03-22T09:00:00Z',
    updatedAt: '2024-11-18T11:00:00Z',
  },
  '3': {
    id: '3',
    name: 'Global Solutions Ltd',
    slug: 'global-solutions',
    status: 'active',
    plan: 'Enterprise',
    userCount: 78,
    createdAt: '2023-11-01T14:00:00Z',
    updatedAt: '2024-11-25T09:15:00Z',
  },
}

export function TenantEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTenant = async () => {
      setLoading(true)
      setError(null)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        const foundTenant = id ? mockTenants[id] : null
        if (foundTenant) {
          setTenant(foundTenant)
        } else {
          setError('Tenant not found')
        }
      } catch {
        setError('Failed to load tenant')
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
  }, [id])

  const handleSubmit = async (data: TenantFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Updating tenant:', { id, ...data })
      // In a real app, this would be an API call
      navigate('/tenants/list')
    } catch {
      console.error('Failed to update tenant')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/tenants/list')
  }

  if (loading) {
    return (
      <div className="tenant-edit-page loading-state">
        <div className="loading-spinner" />
        <p>Loading tenant...</p>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="tenant-edit-page error-state">
        <div className="page-header">
          <h2>Error</h2>
          <p className="page-description">{error || 'Tenant not found'}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/tenants/list')}>
          Back to Tenants
        </button>
      </div>
    )
  }

  return (
    <div className="tenant-edit-page">
      <div className="page-header">
        <h2>Edit Tenant</h2>
        <p className="page-description">Update tenant information for {tenant.name}</p>
      </div>

      <TenantForm
        initialData={{
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
