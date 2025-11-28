import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { MockAuthProvider } from './contexts/MockAuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { DashboardPage } from './pages/DashboardPage'
import {
  TenantDashboardPage,
  TenantListPage,
  TenantCreatePage,
  TenantEditPage,
  TenantDeactivatePage,
  TenantSettingsPage,
} from './pages/tenants'
import { UserListPage } from './pages/users'
import './App.css'

// Check if mock auth is enabled (only in development)
const isMockAuthEnabled =
  import.meta.env.VITE_AUTH_MOCK_ENABLED === 'true' &&
  import.meta.env.VITE_ENVIRONMENT !== 'production'

// Select the appropriate auth provider
const AuthProviderComponent = isMockAuthEnabled ? MockAuthProvider : AuthProvider

function App() {
  return (
    <BrowserRouter>
      <AuthProviderComponent>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            element={
              <ProtectedRoute requireAdmin>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tenants" element={<TenantDashboardPage />} />
            <Route path="/tenants/list" element={<TenantListPage />} />
            <Route path="/tenants/new" element={<TenantCreatePage />} />
            <Route path="/tenants/:id/edit" element={<TenantEditPage />} />
            <Route path="/tenants/:id/deactivate" element={<TenantDeactivatePage />} />
            <Route path="/tenants/:id/settings" element={<TenantSettingsPage />} />
            <Route path="/users" element={<UserListPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProviderComponent>
    </BrowserRouter>
  )
}

export default App
