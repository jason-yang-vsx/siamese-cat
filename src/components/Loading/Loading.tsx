import styles from './Loading.module.css'

interface LoadingProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

const Loading = ({ size = 'medium', text }: LoadingProps) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  )
}

export default Loading
