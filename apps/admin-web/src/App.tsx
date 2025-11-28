import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

// Lazy load auth providers to avoid loading Firebase when using mock auth
const LazyAuthProvider = lazy(() =>
  import('./contexts/AuthContext').then((m) => ({ default: m.AuthProvider }))
)
const LazyMockAuthProvider = lazy(() =>
  import('./contexts/MockAuthProvider').then((m) => ({ default: m.MockAuthProvider }))
)

// Auth provider wrapper with suspense
function AuthProviderWrapper({ children }: { children: ReactNode }) {
  const Provider: ComponentType<{ children: ReactNode }> = isMockAuthEnabled
    ? LazyMockAuthProvider
    : LazyAuthProvider

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Provider>{children}</Provider>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProviderWrapper>
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
      </AuthProviderWrapper>
    </BrowserRouter>
  )
}

export default App
