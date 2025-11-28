import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock Firebase - use vi.hoisted for values that need to be available during mock hoisting
const { MockGoogleAuthProvider, mockOnAuthStateChanged, mockSignInWithPopup, mockSignOut } =
  vi.hoisted(() => {
    return {
      MockGoogleAuthProvider: class {
        setCustomParameters = vi.fn()
      },
      mockOnAuthStateChanged: vi.fn(),
      mockSignInWithPopup: vi.fn(),
      mockSignOut: vi.fn(),
    }
  })

// Mock the firebase service module to prevent validation errors
vi.mock('../services/firebase', () => ({
  auth: {},
}))

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    mockOnAuthStateChanged(_auth, callback)
    return vi.fn()
  },
  GoogleAuthProvider: MockGoogleAuthProvider,
}))

import { AuthProvider } from './AuthContext'
import { useAuth } from '../hooks/useAuth'

function TestComponent() {
  const { user, loading, error, signInWithGoogle, signOut } = useAuth()

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
      <div data-testid="error">{error || 'null'}</div>
      <button onClick={signInWithGoogle}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides initial loading state', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      // Don't call callback immediately to test loading state
      setTimeout(() => callback(null), 100)
      return vi.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('true')
  })

  it('sets user to null when not authenticated', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null)
      return vi.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
  })

  it('throws error when useAuth is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })

  it('calls signInWithPopup when signInWithGoogle is called', async () => {
    const user = userEvent.setup()

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null)
      return vi.fn()
    })

    mockSignInWithPopup.mockResolvedValue({
      user: {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        getIdTokenResult: vi.fn().mockResolvedValue({ claims: { admin: true } }),
      },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await act(async () => {
      await user.click(screen.getByText('Sign In'))
    })

    expect(mockSignInWithPopup).toHaveBeenCalled()
  })
})
