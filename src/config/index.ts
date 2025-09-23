// Application configuration
export const APP_CONFIG = {
  name: 'Siamese Cat',
  version: '0.0.0',
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const

// API configuration
export const API_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
} as const

// UI configuration
export const UI_CONFIG = {
  minParticipants: 2,
  wheelAnimationDuration: 3000,
  celebrationAnimationDuration: 2000,
} as const
