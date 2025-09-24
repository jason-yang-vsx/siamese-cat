/**
 * SpinnerPointer Component
 * Red triangle pointer indicator for the spinner
 */

import React from 'react'
import styles from './Spinner.module.css'

interface SpinnerPointerProps {
  position?: 'right' | 'top' | 'left' | 'bottom'
}

export const SpinnerPointer: React.FC<SpinnerPointerProps> = ({
  position = 'right',
}) => {
  // Using CSS modules for styling
  const pointerClass =
    position === 'right' ? styles.pointerRight : styles[`pointer--${position}`]

  return <div className={pointerClass} aria-hidden="true" />
}
