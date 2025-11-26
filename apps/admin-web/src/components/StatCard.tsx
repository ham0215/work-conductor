import './StatCard.css'

type IconType = 'building' | 'check-circle' | 'users' | 'plus-circle'
type VariantType = 'default' | 'success' | 'info' | 'primary' | 'warning'

interface StatCardProps {
  title: string
  value: number
  icon: IconType
  variant?: VariantType
  trend?: {
    value: number
    label: string
  }
}

const icons: Record<IconType, JSX.Element> = {
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 21h18M3 7v14M21 7v14M9 21V11h6v10M9 7V3h6v4" />
    </svg>
  ),
  'check-circle': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  'plus-circle': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
}

export function StatCard({ title, value, icon, variant = 'default', trend }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      <div className="stat-card-icon">{icons[icon]}</div>
      <div className="stat-card-content">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-value">{value.toLocaleString()}</span>
        {trend && (
          <span className="stat-card-trend">
            +{trend.value} {trend.label}
          </span>
        )}
      </div>
    </div>
  )
}
