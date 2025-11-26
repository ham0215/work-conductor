import { render, screen, waitFor } from '@testing-library/react'
import { vi, beforeEach, describe, it, expect } from 'vitest'

// Mock Firebase - use vi.hoisted for class that needs to be available during mock hoisting
const { MockGoogleAuthProvider } = vi.hoisted(() => {
  return {
    MockGoogleAuthProvider: class {
      setCustomParameters = vi.fn()
    },
  }
})

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    // Simulate unauthenticated state
    callback(null)
    return vi.fn() // unsubscribe
  }),
  GoogleAuthProvider: MockGoogleAuthProvider,
}))

import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login when not authenticated', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Work Conductor')).toBeInTheDocument()
      expect(screen.getByText('Admin Console')).toBeInTheDocument()
    })
  })

  it('shows sign in button on login page', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    })
  })
})
