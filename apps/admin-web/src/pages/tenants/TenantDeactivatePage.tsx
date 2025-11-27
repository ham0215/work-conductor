import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Tenant } from '../../types/tenant'
import '../../components/PageHeader.css'
import '../../components/TenantForm.css'
import './TenantDeactivatePage.css'

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

export function TenantDeactivatePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
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
          if (foundTenant.status === 'suspended') {
            setError('This tenant is already suspended')
          } else {
            setTenant(foundTenant)
          }
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

  const handleDeactivate = async () => {
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Deactivating tenant:', id)
      // In a real app, this would be an API call
      navigate('/tenants/list')
    } catch {
      console.error('Failed to deactivate tenant')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/tenants/list')
  }

  if (loading) {
    return (
      <div className="tenant-deactivate-page loading-state">
        <div className="loading-spinner" />
        <p>Loading tenant...</p>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="tenant-deactivate-page error-state">
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
    <div className="tenant-deactivate-page">
      <div className="page-header">
        <h2>Deactivate Tenant</h2>
        <p className="page-description">Suspend tenant access to the platform</p>
      </div>

      <div className="deactivate-card">
        <div className="warning-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3>Are you sure you want to deactivate this tenant?</h3>
        <p className="description">
          Deactivating a tenant will immediately suspend all user access. Users will not be able to log in
          or access any data until the tenant is reactivated.
        </p>

        <div className="tenant-info">
          <div className="tenant-info-row">
            <span className="tenant-info-label">Name</span>
            <span className="tenant-info-value">{tenant.name}</span>
          </div>
          <div className="tenant-info-row">
            <span className="tenant-info-label">Slug</span>
            <span className="tenant-info-value">{tenant.slug}</span>
          </div>
          <div className="tenant-info-row">
            <span className="tenant-info-label">Plan</span>
            <span className="tenant-info-value">{tenant.plan}</span>
          </div>
          <div className="tenant-info-row">
            <span className="tenant-info-label">Active Users</span>
            <span className="tenant-info-value">{tenant.userCount}</span>
          </div>
        </div>

        <div className="confirmation-section">
          <label>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={isSubmitting}
            />
            <span>
              I understand that this action will suspend all {tenant.userCount} user(s) from accessing the
              platform
            </span>
          </label>
        </div>

        <div className="deactivate-actions">
          <button
            type="button"
            className="btn-danger"
            onClick={handleDeactivate}
            disabled={!confirmed || isSubmitting}
          >
            {isSubmitting ? 'Deactivating...' : 'Deactivate Tenant'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
