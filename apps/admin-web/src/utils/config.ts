/**
 * Application configuration loaded from environment variables
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0',
  isProduction: import.meta.env.VITE_ENVIRONMENT === 'production',
  isDevelopment: import.meta.env.VITE_ENVIRONMENT === 'development',
} as const

export type Config = typeof config
