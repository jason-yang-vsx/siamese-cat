// Utility functions following Frontend Guideline naming conventions

/**
 * Generate random number between min and max (inclusive)
 */
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Format seat number for display
 */
export function formatSeatNumber(seatNumber?: string): string {
  if (!seatNumber || seatNumber.trim() === '') {
    return ''
  }
  return `座號 ${seatNumber}`
}

/**
 * Check if array has minimum required length
 */
export function hasMinimumLength<T>(array: T[], minLength: number): boolean {
  return Array.isArray(array) && array.length >= minLength
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(...args), wait)
  }
}
