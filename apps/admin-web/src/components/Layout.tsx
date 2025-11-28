import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Layout.css'

// Check if mock auth is enabled
const isMockAuthEnabled =
  import.meta.env.VITE_AUTH_MOCK_ENABLED === 'true' &&
  import.meta.env.VITE_ENVIRONMENT !== 'production'

export function Layout() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="layout">
      {isMockAuthEnabled && (
        <div className="mock-mode-banner">
          Mock Authentication Mode - For development only
        </div>
      )}
      <header className="layout-header">
        <div className="header-brand">
          <h1>Work Conductor Admin</h1>
        </div>
        <div className="header-user">
          {user?.photoURL && (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="user-avatar" />
          )}
          <span className="user-name">{user?.displayName || user?.email}</span>
          <button type="button" onClick={handleSignOut} className="sign-out-btn">
            Sign out
          </button>
        </div>
      </header>
      <div className="layout-body">
        <nav className="layout-sidebar" aria-label="Main navigation">
          <ul className="nav-menu">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/tenants" className={({ isActive }) => (isActive ? 'active' : '')}>
                Tenants
              </NavLink>
            </li>
            <li>
              <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
                Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
