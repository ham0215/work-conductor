import { useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextType, type AuthUser } from './auth-types'

// Mock user for development
const MOCK_USER: AuthUser = {
  uid: 'mock-admin-user-001',
  email: 'admin@mock.local',
  displayName: 'Mock Admin User',
  photoURL: null,
  isAdmin: true,
}

interface MockAuthProviderProps {
  children: ReactNode
}

/**
 * Mock authentication provider for local development.
 * Provides a pre-authenticated admin user without requiring Firebase.
 */
export function MockAuthProvider({ children }: MockAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USER)
  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signInWithGoogle = async () => {
    setError(null)
    setUser(MOCK_USER)
  }

  const signOut = async () => {
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
