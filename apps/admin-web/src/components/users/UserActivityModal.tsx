import { useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../../types/user'
import './UserActivityModal.css'

interface UserActivityModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
}

interface ActivityLogEntry {
  id: string
  action: string
  description: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

// Mock activity data - will be replaced with API calls
const getMockActivityLogs = (userId: string): ActivityLogEntry[] => [
  {
    id: '1',
    action: 'login',
    description: 'User logged in successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 120 on Windows',
  },
  {
    id: '2',
    action: 'profile_update',
    description: 'Updated profile information',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    ipAddress: '192.168.1.100',
  },
  {
    id: '3',
    action: 'password_change',
    description: 'Changed account password',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    ipAddress: '192.168.1.100',
  },
  {
    id: '4',
    action: 'login',
    description: 'User logged in successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    ipAddress: '10.0.0.50',
    userAgent: 'Safari 17 on macOS',
  },
  {
    id: '5',
    action: 'logout',
    description: 'User logged out',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    ipAddress: '192.168.1.100',
  },
  {
    id: '6',
    action: 'login_failed',
    description: 'Failed login attempt - incorrect password',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    ipAddress: '203.0.113.50',
    userAgent: 'Firefox 121 on Linux',
  },
  {
    id: `7-${userId}`,
    action: 'account_created',
    description: 'User account was created',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
  },
]

const actionIcons: Record<string, ReactNode> = {
  login: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  ),
  logout: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  login_failed: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  profile_update: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  password_change: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  account_created: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
}

const actionColors: Record<string, string> = {
  login: 'success',
  logout: 'neutral',
  login_failed: 'danger',
  profile_update: 'info',
  password_change: 'warning',
  account_created: 'primary',
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function formatFullDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function UserActivityModal({ isOpen, user, onClose }: UserActivityModalProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen || !user) return

    let cancelled = false
    // Simulate API call
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setActivities(getMockActivityLogs(user.id))
        setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      setLoading(true)
      setActivities([])
    }
  }, [isOpen, user])

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen || !user) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content activity-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-modal-title"
      >
        <div className="modal-header">
          <h3 id="activity-modal-title">Activity Log</h3>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Close modal">
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
          <div className="user-info-card activity">
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
            </div>
          </div>

          {loading ? (
            <div className="activity-loading">
              <div className="loading-spinner" />
              <p>Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="activity-empty">
              <p>No activity recorded for this user.</p>
            </div>
          ) : (
            <div className="activity-list">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`activity-item ${actionColors[activity.action] || 'neutral'}`}
                >
                  <div className="activity-icon">
                    {actionIcons[activity.action] || actionIcons.login}
                  </div>
                  <div className="activity-content">
                    <p className="activity-description">{activity.description}</p>
                    <div className="activity-meta">
                      <span
                        className="activity-time"
                        title={formatFullDateTime(activity.timestamp)}
                      >
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                      {activity.ipAddress && (
                        <span className="activity-ip">{activity.ipAddress}</span>
                      )}
                      {activity.userAgent && (
                        <span className="activity-device">{activity.userAgent}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
