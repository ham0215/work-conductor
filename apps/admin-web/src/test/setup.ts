import '@testing-library/jest-dom'

// Disable mock auth in tests by default (tests will mock Firebase directly)
import.meta.env.VITE_AUTH_MOCK_ENABLED = 'false'
