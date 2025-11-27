import { useState } from 'react'
import type { User, UserRole } from '../../types/user'
import './UserRoleModal.css'

interface UserRoleModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onUpdate: (userId: string, newRole: UserRole) => Promise<void>
}

const roleDescriptions: Record<UserRole, string> = {
  admin: 'Full access to tenant settings, user management, and all features',
  manager: 'Can manage team members, view reports, and approve requests',
  member: 'Standard user access to assigned features and data',
}

const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    'Manage tenant settings',
    'Invite and remove users',
    'Assign roles to users',
    'View all reports and analytics',
    'Configure integrations',
    'Access all features',
  ],
  manager: [
    'View team member profiles',
    'Approve team requests',
    'View team reports',
    'Create and manage projects',
    'Access standard features',
  ],
  member: [
    'Access assigned projects',
    'Submit requests',
    'View personal reports',
    'Use core features',
  ],
}

export function UserRoleModal({ isOpen, user, onClose, onUpdate }: UserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'member')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!user) return
    if (selectedRole === user.role) {
      onClose()
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onUpdate(user.id, selectedRole)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedRole(user?.role || 'member')
    setError(null)
    onClose()
  }

  if (!isOpen || !user) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content role-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
      >
        <div className="modal-header">
          <h3 id="role-modal-title">Change User Role</h3>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="user-info-card">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="user-details">
              <span className="user-name">{user.displayName}</span>
              <span className="user-email">{user.email}</span>
              <span className="user-tenant">{user.tenantName}</span>
            </div>
          </div>

          <div className="role-section">
            <label className="section-label">Select Role</label>
            <div className="role-options">
              {(['admin', 'manager', 'member'] as UserRole[]).map((role) => (
                <label
                  key={role}
                  className={`role-option ${selectedRole === role ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={() => setSelectedRole(role)}
                    disabled={submitting}
                  />
                  <div className="role-content">
                    <div className="role-header">
                      <span className={`role-badge ${role}`}>{role}</span>
                      {user.role === role && <span className="current-badge">Current</span>}
                    </div>
                    <p className="role-description">{roleDescriptions[role]}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="permissions-section">
            <label className="section-label">Role Permissions</label>
            <ul className="permissions-list">
              {rolePermissions[selectedRole].map((permission, index) => (
                <li key={index}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {permission}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={submitting || selectedRole === user.role}
          >
            {submitting ? (
              <>
                <span className="btn-spinner" />
                Updating...
              </>
            ) : (
              'Update Role'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
