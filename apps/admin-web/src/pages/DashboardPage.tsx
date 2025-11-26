import { useAuth } from '../hooks/useAuth'
import './DashboardPage.css'

export function DashboardPage() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Work Conductor Admin</h1>
        <div className="user-info">
          {user?.photoURL && (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="user-avatar" />
          )}
          <span className="user-name">{user?.displayName || user?.email}</span>
          <button type="button" onClick={handleSignOut} className="sign-out-btn">
            Sign out
          </button>
        </div>
      </header>
      <main className="dashboard-content">
        <div className="welcome-message">
          <h2>Welcome to the Admin Console</h2>
          <p>Manage tenants, users, and system settings from here.</p>
        </div>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Tenants</h3>
            <p>Manage tenant organizations</p>
          </div>
          <div className="dashboard-card">
            <h3>Users</h3>
            <p>Manage user accounts</p>
          </div>
          <div className="dashboard-card">
            <h3>Settings</h3>
            <p>System configuration</p>
          </div>
        </div>
      </main>
    </div>
  )
}
