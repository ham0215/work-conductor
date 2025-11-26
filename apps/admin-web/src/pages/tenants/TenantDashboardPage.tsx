import { useState, useEffect } from 'react'
import { StatCard } from '../../components/StatCard'
import { ActivityLog, type ActivityItem } from '../../components/ActivityLog'
import '../../components/PageHeader.css'
import './TenantDashboardPage.css'

interface TenantStats {
  totalTenants: number
  activeTenants: number
  totalUsers: number
  newTenantsThisMonth: number
}

// Mock data - will be replaced with API calls
const mockStats: TenantStats = {
  totalTenants: 24,
  activeTenants: 22,
  totalUsers: 156,
  newTenantsThisMonth: 3,
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'tenant_created',
    message: 'New tenant "Acme Corporation" was created',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    actor: 'admin@example.com',
  },
  {
    id: '2',
    type: 'user_added',
    message: 'User "john.doe@acme.com" was added to "Acme Corporation"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actor: 'admin@example.com',
  },
  {
    id: '3',
    type: 'tenant_updated',
    message: 'Tenant "Tech Startup Inc" settings were updated',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actor: 'admin@example.com',
  },
  {
    id: '4',
    type: 'tenant_suspended',
    message: 'Tenant "Old Company LLC" was suspended',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actor: 'system',
  },
  {
    id: '5',
    type: 'user_removed',
    message: 'User "jane.smith@tech.com" was removed from "Tech Startup Inc"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    actor: 'admin@example.com',
  },
]

export function TenantDashboardPage() {
  const [stats, setStats] = useState<TenantStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true)
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setStats(mockStats)
      setActivities(mockActivities)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="tenant-dashboard loading">
        <div className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="tenant-dashboard">
      <div className="page-header">
        <h2>Tenant Dashboard</h2>
        <p className="page-description">Overview of all tenants and recent activity</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Tenants"
          value={stats?.totalTenants ?? 0}
          icon="building"
          trend={{ value: stats?.newTenantsThisMonth ?? 0, label: 'this month' }}
        />
        <StatCard
          title="Active Tenants"
          value={stats?.activeTenants ?? 0}
          icon="check-circle"
          variant="success"
        />
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon="users" variant="info" />
        <StatCard
          title="New This Month"
          value={stats?.newTenantsThisMonth ?? 0}
          icon="plus-circle"
          variant="primary"
        />
      </div>

      <div className="dashboard-sections">
        <section className="activity-section">
          <h3>Recent Activity</h3>
          <ActivityLog activities={activities} />
        </section>
      </div>
    </div>
  )
}
