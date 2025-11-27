import { useState } from 'react'
import type { UserRole } from '../../types/user'
import './UserInviteModal.css'

interface Tenant {
  id: string
  name: string
}

interface UserInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (data: InviteData) => Promise<void>
  tenants: Tenant[]
}

export interface InviteData {
  email: string
  role: UserRole
  tenantId: string
  department?: string
}

export function UserInviteModal({ isOpen, onClose, onInvite, tenants }: UserInviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('member')
  const [tenantId, setTenantId] = useState('')
  const [department, setDepartment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!tenantId) {
      setError('Please select a tenant')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setSubmitting(true)
    try {
      await onInvite({
        email: email.trim(),
        role,
        tenantId,
        department: department.trim() || undefined,
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setRole('member')
    setTenantId('')
    setDepartment('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
        <div className="modal-header">
          <h3 id="invite-modal-title">Invite User</h3>
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="invite-email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={submitting}
                autoFocus
              />
              <p className="form-hint">An invitation email will be sent to this address</p>
            </div>

            <div className="form-group">
              <label htmlFor="invite-tenant">
                Tenant <span className="required">*</span>
              </label>
              <select
                id="invite-tenant"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select a tenant...</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="invite-role">Role</label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={submitting}
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <p className="form-hint">
                {role === 'admin' && 'Full access to tenant settings and user management'}
                {role === 'manager' && 'Can manage team members and view reports'}
                {role === 'member' && 'Standard user access'}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="invite-department">Department</label>
              <input
                id="invite-department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Engineering, Marketing"
                disabled={submitting}
              />
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
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="btn-spinner" />
                  Sending...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
