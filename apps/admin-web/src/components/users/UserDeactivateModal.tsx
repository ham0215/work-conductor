import { useState } from 'react'
import type { User } from '../../types/user'
import './UserDeactivateModal.css'

interface UserDeactivateModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onDeactivate: (userId: string) => Promise<void>
}

export function UserDeactivateModal({
  isOpen,
  user,
  onClose,
  onDeactivate,
}: UserDeactivateModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const expectedConfirmText = 'DEACTIVATE'
  const isConfirmed = confirmText === expectedConfirmText

  const handleSubmit = async () => {
    if (!user || !isConfirmed) return

    setSubmitting(true)
    setError(null)
    try {
      await onDeactivate(user.id)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setError(null)
    onClose()
  }

  if (!isOpen || !user) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content deactivate-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-modal-title"
      >
        <div className="modal-header danger">
          <div className="header-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="header-content">
            <h3 id="deactivate-modal-title">Deactivate User</h3>
            <p>This action will prevent the user from accessing the system</p>
          </div>
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

          <div className="user-info-card deactivate">
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

          <div className="warning-box">
            <h4>What happens when you deactivate this user:</h4>
            <ul>
              <li>User will be immediately logged out of all sessions</li>
              <li>User will not be able to sign in to the system</li>
              <li>User's data and history will be preserved</li>
              <li>User can be reactivated later by an admin</li>
            </ul>
          </div>

          <div className="confirm-section">
            <label htmlFor="confirm-input">
              Type <strong>{expectedConfirmText}</strong> to confirm
            </label>
            <input
              id="confirm-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder={expectedConfirmText}
              disabled={submitting}
              autoComplete="off"
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
          <button
            type="button"
            className="btn-danger"
            onClick={handleSubmit}
            disabled={submitting || !isConfirmed}
          >
            {submitting ? (
              <>
                <span className="btn-spinner" />
                Deactivating...
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                Deactivate User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
