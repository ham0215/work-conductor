import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { User, UserFilters, UserStatus, UserRole } from '../../types/user'
import '../../components/PageHeader.css'
import './UserListPage.css'

// Mock data - will be replaced with API calls
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.smith@acme.com',
    displayName: 'John Smith',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    status: 'active',
    role: 'admin',
    tenantId: '1',
    tenantName: 'Acme Corporation',
    department: 'Engineering',
    lastLoginAt: '2024-11-27T09:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-27T09:30:00Z',
  },
  {
    id: '2',
    email: 'jane.doe@acme.com',
    displayName: 'Jane Doe',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    status: 'active',
    role: 'manager',
    tenantId: '1',
    tenantName: 'Acme Corporation',
    department: 'Product',
    lastLoginAt: '2024-11-26T14:22:00Z',
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-11-26T14:22:00Z',
  },
  {
    id: '3',
    email: 'bob.wilson@techstartup.com',
    displayName: 'Bob Wilson',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    status: 'active',
    role: 'member',
    tenantId: '2',
    tenantName: 'Tech Startup Inc',
    department: 'Development',
    lastLoginAt: '2024-11-25T16:45:00Z',
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-11-25T16:45:00Z',
  },
  {
    id: '4',
    email: 'alice.brown@acme.com',
    displayName: 'Alice Brown',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    status: 'inactive',
    role: 'member',
    tenantId: '1',
    tenantName: 'Acme Corporation',
    department: 'Marketing',
    lastLoginAt: '2024-10-15T10:00:00Z',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z',
  },
  {
    id: '5',
    email: 'mike.johnson@global.com',
    displayName: 'Mike Johnson',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    status: 'active',
    role: 'admin',
    tenantId: '3',
    tenantName: 'Global Solutions Ltd',
    department: 'IT',
    lastLoginAt: '2024-11-27T08:15:00Z',
    createdAt: '2023-11-01T14:00:00Z',
    updatedAt: '2024-11-27T08:15:00Z',
  },
  {
    id: '6',
    email: 'sarah.davis@global.com',
    displayName: 'Sarah Davis',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    status: 'pending',
    role: 'member',
    tenantId: '3',
    tenantName: 'Global Solutions Ltd',
    department: 'Finance',
    createdAt: '2024-11-20T16:00:00Z',
    updatedAt: '2024-11-20T16:00:00Z',
  },
  {
    id: '7',
    email: 'david.lee@techstartup.com',
    displayName: 'David Lee',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    status: 'active',
    role: 'manager',
    tenantId: '2',
    tenantName: 'Tech Startup Inc',
    department: 'Operations',
    lastLoginAt: '2024-11-26T11:30:00Z',
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-11-26T11:30:00Z',
  },
  {
    id: '8',
    email: 'emily.chen@acme.com',
    displayName: 'Emily Chen',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    status: 'active',
    role: 'member',
    tenantId: '1',
    tenantName: 'Acme Corporation',
    department: 'Design',
    lastLoginAt: '2024-11-27T07:45:00Z',
    createdAt: '2024-05-12T13:00:00Z',
    updatedAt: '2024-11-27T07:45:00Z',
  },
]

const ITEMS_PER_PAGE = 5

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function UserListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
    tenantId: 'all',
  })
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUsers(mockUsers)
      setLoading(false)
    }

    fetchUsers()
  }, [])

  // Get unique tenants for filter dropdown
  const tenants = useMemo(() => {
    const tenantMap = new Map<string, string>()
    users.forEach((user) => {
      tenantMap.set(user.tenantId, user.tenantName)
    })
    return Array.from(tenantMap.entries()).map(([id, name]) => ({ id, name }))
  }, [users])

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          user.displayName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.department?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== 'all' && user.status !== filters.status) {
        return false
      }

      // Role filter
      if (filters.role !== 'all' && user.role !== filters.role) {
        return false
      }

      // Tenant filter
      if (filters.tenantId !== 'all' && user.tenantId !== filters.tenantId) {
        return false
      }

      return true
    })
  }, [users, filters])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredUsers, currentPage])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }))
    setCurrentPage(1)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, status: e.target.value as UserStatus | 'all' }))
    setCurrentPage(1)
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, role: e.target.value as UserRole | 'all' }))
    setCurrentPage(1)
  }

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, tenantId: e.target.value }))
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      role: 'all',
      tenantId: 'all',
    })
    setCurrentPage(1)
    if (searchInputRef.current) {
      searchInputRef.current.value = ''
    }
  }

  const handleExport = () => {
    const headers = [
      'Name',
      'Email',
      'Status',
      'Role',
      'Tenant',
      'Department',
      'Last Login',
      'Created',
    ]
    const csvData = filteredUsers.map((user) => [
      user.displayName,
      user.email,
      user.status,
      user.role,
      user.tenantName,
      user.department || '',
      user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never',
      formatDate(user.createdAt),
    ])

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.role !== 'all' ||
    filters.tenantId !== 'all'

  if (loading) {
    return (
      <div className="user-list-page loading-state">
        <div className="loading-spinner" />
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="user-list-page">
      <div className="page-header-actions">
        <div className="page-header">
          <h2>Users</h2>
          <p className="page-description">Manage user accounts across all tenants</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExport}
            disabled={filteredUsers.length === 0}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <Link to="/users/new" className="btn-primary">
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
            Add User
          </Link>
        </div>
      </div>

      <div className="filter-panel">
        <div className="search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name, email, or department..."
            value={filters.search}
            onChange={handleSearchChange}
            aria-label="Search users"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select id="status-filter" value={filters.status} onChange={handleStatusChange}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="role-filter">Role</label>
            <select id="role-filter" value={filters.role} onChange={handleRoleChange}>
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="tenant-filter">Tenant</label>
            <select id="tenant-filter" value={filters.tenantId} onChange={handleTenantChange}>
              <option value="all">All Tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button type="button" className="btn-text" onClick={handleClearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="results-summary">
        Showing {paginatedUsers.length} of {filteredUsers.length} users
        {hasActiveFilters && ` (filtered from ${users.length} total)`}
      </div>

      <div className="user-table-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            {hasActiveFilters ? (
              <>
                <p>No users match your filters.</p>
                <button type="button" className="btn-secondary" onClick={handleClearFilters}>
                  Clear filters
                </button>
              </>
            ) : (
              <p>No users found. Create your first user to get started.</p>
            )}
          </div>
        ) : (
          <>
            <table className="user-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Tenant</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="user-avatar" />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="user-details">
                          <span className="user-name">{user.displayName}</span>
                          <span className="user-email">{user.email}</span>
                          {user.department && (
                            <span className="user-department">{user.department}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status}`}>{user.status}</span>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <Link to={`/tenants/${user.tenantId}/edit`} className="tenant-link">
                        {user.tenantName}
                      </Link>
                    </td>
                    <td className="last-login">{formatDateTime(user.lastLoginAt)}</td>
                    <td>
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit user"
                          aria-label={`Edit ${user.displayName}`}
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
                        {user.status !== 'inactive' && (
                          <button
                            type="button"
                            className="btn-icon danger"
                            title="Deactivate user"
                            aria-label={`Deactivate ${user.displayName}`}
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

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
