import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

// Validate Firebase configuration before initialization
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error(
    'Firebase configuration is incomplete. ' +
      'Please set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID environment variables, ' +
      'or enable mock authentication mode by setting VITE_AUTH_MOCK_ENABLED=true.'
  )
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
