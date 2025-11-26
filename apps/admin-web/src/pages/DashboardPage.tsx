import { Link } from 'react-router-dom'
import './DashboardPage.css'

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="page-description">Welcome to the Admin Console</p>
      </div>
      <div className="dashboard-cards">
        <Link to="/tenants" className="dashboard-card">
          <h3>Tenants</h3>
          <p>Manage tenant organizations</p>
        </Link>
        <div className="dashboard-card disabled">
          <h3>Users</h3>
          <p>Manage user accounts</p>
          <span className="coming-soon">Coming soon</span>
        </div>
        <div className="dashboard-card disabled">
          <h3>Settings</h3>
          <p>System configuration</p>
          <span className="coming-soon">Coming soon</span>
        </div>
      </div>
    </div>
  )
}
