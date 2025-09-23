import { ReactNode } from 'react'
import styles from './MainLayout.module.css'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>
    </div>
  )
}

export default MainLayout
