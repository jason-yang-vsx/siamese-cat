/**
 * Spinner Component
 * US-002: Display fetched student data
 * US-003: Visual spinner interface (static, no interactions)
 */

import { useStudents } from '@/contexts/StudentContext'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './Spinner.module.css'
import { SpinnerPointer } from './SpinnerPointer'
import { SpinnerWheel } from './SpinnerWheel'

interface SpinnerProps {
  colors?: string[]
  showTitle?: boolean
}

export const Spinner: React.FC<SpinnerProps> = ({
  colors,
  showTitle = true,
}) => {
  const {
    availableStudents,
    isLoading,
    error,
    loadStudents,
    hasAvailableStudents,
  } = useStudents()

  const containerRef = useRef<HTMLDivElement>(null)
  const [wheelSize, setWheelSize] = useState(400) // Start with default size

  /**
   * Calculate responsive size based on 60vh
   */
  const calculateSize = () => {
    // 60% of viewport height
    const viewportHeight = window.innerHeight
    const targetHeight = viewportHeight * 0.6

    // Get container dimensions if available
    const containerWidth =
      containerRef.current?.offsetWidth || window.innerWidth * 0.9

    // Use the smaller dimension to ensure it fits
    const size = Math.min(targetHeight, containerWidth * 0.9, 600)

    // Ensure minimum size
    return Math.max(size, 300)
  }

  // Use useLayoutEffect for initial synchronous size calculation
  useLayoutEffect(() => {
    const initialSize = calculateSize()
    setWheelSize(initialSize)
  }, [])

  // Setup resize observers and event listeners
  useEffect(() => {
    let animationFrameId: number
    let resizeObserver: ResizeObserver | null = null

    const updateSize = () => {
      const newSize = calculateSize()
      setWheelSize(newSize)
    }

    // Create ResizeObserver for container changes
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        // Cancel any pending update
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
        // Schedule update on next frame
        animationFrameId = requestAnimationFrame(updateSize)
      })

      // Start observing once container is available
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
        // Trigger immediate update
        updateSize()
      }
    }

    // Listen to window resize for viewport changes
    const handleResize = () => {
      // Cancel any pending update
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      // Schedule update on next frame
      animationFrameId = requestAnimationFrame(updateSize)
    }

    window.addEventListener('resize', handleResize)

    // Fallback: Force update after mount
    const timeoutId = setTimeout(() => {
      updateSize()
    }, 0)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      clearTimeout(timeoutId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        {showTitle && (
          <div className={styles.header}>
            <h1 className={styles.title}>Spinner</h1>
          </div>
        )}
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading students...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        {showTitle && (
          <div className={styles.header}>
            <h1 className={styles.title}>Spinner</h1>
          </div>
        )}
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={() => loadStudents()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!hasAvailableStudents) {
    return (
      <div className={styles.container}>
        {showTitle && (
          <div className={styles.header}>
            <h1 className={styles.title}>Spinner</h1>
          </div>
        )}
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📚</div>
          <p className={styles.emptyStateText}>No students available</p>
          <p className={styles.emptyStateHint}>
            No students loaded from Bridge
          </p>
          <button className={styles.retryButton} onClick={() => loadStudents()}>
            Reload Students
          </button>
        </div>
      </div>
    )
  }

  // Main spinner display (static, no interactions)
  return (
    <div className={styles.container} ref={containerRef}>
      {showTitle && (
        <div className={styles.header}>
          <h1 className={styles.title}>Spinner</h1>
        </div>
      )}

      <div className={styles.spinnerWrapper}>
        <div
          className={styles.spinnerContainer}
          style={{
            width: wheelSize,
            height: wheelSize,
          }}
        >
          <SpinnerWheel
            students={availableStudents}
            size={wheelSize}
            colors={colors}
          />
          <SpinnerPointer position="right" />
        </div>
      </div>
    </div>
  )
}
