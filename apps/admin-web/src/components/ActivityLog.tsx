import './ActivityLog.css'

export interface ActivityItem {
  id: string
  type: 'tenant_created' | 'tenant_updated' | 'tenant_suspended' | 'user_added' | 'user_removed'
  message: string
  timestamp: string
  actor: string
}

interface ActivityLogProps {
  activities: ActivityItem[]
}

const typeColors: Record<ActivityItem['type'], string> = {
  tenant_created: '#28a745',
  tenant_updated: '#17a2b8',
  tenant_suspended: '#dc3545',
  user_added: '#0d6efd',
  user_removed: '#6c757d',
}

const typeLabels: Record<ActivityItem['type'], string> = {
  tenant_created: 'Created',
  tenant_updated: 'Updated',
  tenant_suspended: 'Suspended',
  user_added: 'User Added',
  user_removed: 'User Removed',
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }
  return date.toLocaleDateString()
}

export function ActivityLog({ activities }: ActivityLogProps) {
  if (activities.length === 0) {
    return (
      <div className="activity-log-empty">
        <p>No recent activity</p>
      </div>
    )
  }

  return (
    <ul className="activity-log">
      {activities.map((activity) => (
        <li key={activity.id} className="activity-item">
          <span
            className="activity-badge"
            style={{ backgroundColor: typeColors[activity.type] }}
            title={typeLabels[activity.type]}
          />
          <div className="activity-content">
            <p className="activity-message">{activity.message}</p>
            <div className="activity-meta">
              <span className="activity-actor">{activity.actor}</span>
              <span className="activity-separator">•</span>
              <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
