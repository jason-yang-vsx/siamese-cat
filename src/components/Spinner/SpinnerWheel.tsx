/**
 * SpinnerWheel Component
 * US-003: Static visual representation of spinner wheel with student segments
 * Canvas-based wheel rendering with colored segments and student names
 */

import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import type { Student } from '@/services/bridge/types/bridge.types'

interface SpinnerWheelProps {
  students: Student[]
  size?: number
  colors?: string[]
}

const DEFAULT_COLORS = ['#B6B6F9', '#9EECED', '#FFE389', '#FF9AAE']

export const SpinnerWheel: React.FC<SpinnerWheelProps> = ({
  students,
  size = 400,
  colors = DEFAULT_COLORS,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /**
   * Draw the static spinner wheel
   */
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use actual canvas dimensions if size is not yet properly set
    const actualSize =
      size > 0
        ? size
        : Math.min(canvas.width, canvas.height) / (window.devicePixelRatio || 1)

    // Clear canvas
    ctx.clearRect(0, 0, actualSize, actualSize)

    if (students.length === 0) {
      // Draw empty state
      ctx.fillStyle = '#e5e7eb'
      ctx.beginPath()
      ctx.arc(
        actualSize / 2,
        actualSize / 2,
        actualSize / 2 - 10,
        0,
        2 * Math.PI
      )
      ctx.fill()

      ctx.fillStyle = '#6b7280'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('No Students', actualSize / 2, actualSize / 2)
      return
    }

    const centerX = actualSize / 2
    const centerY = actualSize / 2
    const radius = actualSize / 2 - 10
    const angleStep = (2 * Math.PI) / students.length

    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw segments - static positioning
    students.forEach((_student, index) => {
      const startAngle = index * angleStep - Math.PI / 2 // Start from top
      const endAngle = (index + 1) * angleStep - Math.PI / 2

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = colors[index % colors.length]
      ctx.fill()
    })

    // Draw segment borders
    students.forEach((_student, index) => {
      const startAngle = index * angleStep - Math.PI / 2

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + Math.cos(startAngle) * radius,
        centerY + Math.sin(startAngle) * radius
      )
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw text on segments
    students.forEach((student, index) => {
      const startAngle = index * angleStep - Math.PI / 2
      const textAngle = startAngle + angleStep / 2

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(textAngle)

      // Calculate font size based on number of students
      const fontSize = Math.max(12, Math.min(18, 18 - students.length / 10))
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#333333'

      // Position text at 70% of radius for better visibility
      const textRadius = radius * 0.7

      // Truncate long names
      const maxLength = Math.floor(30 - students.length / 2)
      const displayName =
        student.name.length > maxLength
          ? student.name.substring(0, maxLength - 3) + '...'
          : student.name

      // Add seat number if available
      const displayText = student.seatNumber
        ? `${student.seatNumber}. ${displayName}`
        : displayName

      ctx.fillText(displayText, textRadius, 0)
      ctx.restore()
    })
  }, [students, size, colors])

  // Initialize canvas dimensions synchronously
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size <= 0) return

    // Set canvas resolution for high DPI displays
    const dpr = window.devicePixelRatio || 1

    // Only update if dimensions changed
    if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
      canvas.width = size * dpr
      canvas.height = size * dpr
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }
  }, [size])

  // Draw the wheel after canvas is set up
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size <= 0) return

    // Draw immediately
    drawWheel()

    // Also schedule a redraw on the next frame as a fallback
    const animationFrameId = requestAnimationFrame(() => {
      drawWheel()
    })

    // Additional fallback with setTimeout to handle edge cases
    const timeoutId = setTimeout(() => {
      drawWheel()
    }, 100)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearTimeout(timeoutId)
    }
  }, [size, students, drawWheel])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: size,
        height: size,
      }}
      aria-label="Spinner wheel with student names"
    />
  )
}
