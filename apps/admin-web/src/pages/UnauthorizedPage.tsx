import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './UnauthorizedPage.css'

export function UnauthorizedPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <div className="unauthorized-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <h1>Access Denied</h1>
        <p>
          You do not have permission to access the Admin Console.
          Please contact your system administrator if you believe this is an error.
        </p>
        <button type="button" onClick={handleSignOut} className="sign-out-btn">
          Sign out and try a different account
        </button>
      </div>
    </div>
  )
}
