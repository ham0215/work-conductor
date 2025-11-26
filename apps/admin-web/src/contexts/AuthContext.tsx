import { useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { AuthContext, type AuthContextType } from './auth-types'

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isAdmin: boolean
}

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

// Session timeout duration (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())

  // Convert Firebase user to AuthUser with admin verification
  const processUser = useCallback(async (firebaseUser: User | null): Promise<AuthUser | null> => {
    if (!firebaseUser) return null

    // Get ID token to check custom claims
    const tokenResult = await firebaseUser.getIdTokenResult()
    const isAdmin = tokenResult.claims.admin === true

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      isAdmin,
    }
  }, [])

  // Handle session timeout
  useEffect(() => {
    const checkSession = () => {
      const now = Date.now()
      if (user && now - lastActivity > SESSION_TIMEOUT) {
        firebaseSignOut(auth)
        setError('Session expired. Please sign in again.')
      }
    }

    const interval = setInterval(checkSession, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [user, lastActivity])

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now())

    window.addEventListener('click', updateActivity)
    window.addEventListener('keydown', updateActivity)
    window.addEventListener('scroll', updateActivity)

    return () => {
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('keydown', updateActivity)
      window.removeEventListener('scroll', updateActivity)
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        const authUser = await processUser(firebaseUser)
        setUser(authUser)
        setError(null)
      } catch {
        setError('Failed to process user authentication')
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [processUser])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const authUser = await processUser(result.user)
      setUser(authUser)
      setLastActivity(Date.now())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await firebaseSignOut(auth)
      setUser(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out'
      setError(errorMessage)
      throw err
    }
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
