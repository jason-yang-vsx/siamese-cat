import { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
}

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    isLoading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '載入中...' : children}
    </button>
  )
}

export default Button
