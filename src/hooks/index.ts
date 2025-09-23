// Custom hooks placeholder
// TODO: 實作專案相關的自訂 hooks

import { useState, useEffect } from 'react'

/**
 * Hook for managing local storage with type safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

/**
 * Hook for detecting window size changes
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}
