import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Tenant } from '../../types/tenant'
import '../../components/PageHeader.css'
import './TenantListPage.css'

// Mock data - will be replaced with API calls
const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    status: 'active',
    plan: 'Enterprise',
    userCount: 45,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-20T15:30:00Z',
  },
  {
    id: '2',
    name: 'Tech Startup Inc',
    slug: 'tech-startup',
    status: 'active',
    plan: 'Professional',
    userCount: 12,
    createdAt: '2024-03-22T09:00:00Z',
    updatedAt: '2024-11-18T11:00:00Z',
  },
  {
    id: '3',
    name: 'Global Solutions Ltd',
    slug: 'global-solutions',
    status: 'active',
    plan: 'Enterprise',
    userCount: 78,
    createdAt: '2023-11-01T14:00:00Z',
    updatedAt: '2024-11-25T09:15:00Z',
  },
  {
    id: '4',
    name: 'New Ventures Co',
    slug: 'new-ventures',
    status: 'pending',
    plan: 'Starter',
    userCount: 3,
    createdAt: '2024-11-20T16:00:00Z',
    updatedAt: '2024-11-20T16:00:00Z',
  },
  {
    id: '5',
    name: 'Old Company LLC',
    slug: 'old-company',
    status: 'suspended',
    plan: 'Professional',
    userCount: 0,
    createdAt: '2023-06-10T08:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z',
  },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function TenantListPage() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setTenants(mockTenants)
      setLoading(false)
    }

    fetchTenants()
  }, [])

  const handleEdit = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.id}/edit`)
  }

  const handleDeactivate = (tenant: Tenant) => {
    navigate(`/tenants/${tenant.id}/deactivate`)
  }

  if (loading) {
    return (
      <div className="tenant-list-page loading-state">
        <div className="loading-spinner" />
        <p>Loading tenants...</p>
      </div>
    )
  }

  return (
    <div className="tenant-list-page">
      <div className="page-header-actions">
        <div className="page-header">
          <h2>Tenants</h2>
          <p className="page-description">Manage tenant organizations</p>
        </div>
        <Link to="/tenants/new" className="btn-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Tenant
        </Link>
      </div>

      <div className="tenant-table-container">
        {tenants.length === 0 ? (
          <div className="empty-state">
            <p>No tenants found. Create your first tenant to get started.</p>
          </div>
        ) : (
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Users</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>
                    <div className="tenant-name">{tenant.name}</div>
                    <div className="tenant-slug">{tenant.slug}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${tenant.status}`}>{tenant.status}</span>
                  </td>
                  <td>{tenant.plan}</td>
                  <td>{tenant.userCount}</td>
                  <td>{formatDate(tenant.createdAt)}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleEdit(tenant)}
                        title="Edit tenant"
                        aria-label={`Edit ${tenant.name}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {tenant.status !== 'suspended' && (
                        <button
                          type="button"
                          className="btn-icon danger"
                          onClick={() => handleDeactivate(tenant)}
                          title="Deactivate tenant"
                          aria-label={`Deactivate ${tenant.name}`}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
