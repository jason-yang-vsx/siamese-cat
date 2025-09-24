import { Spinner } from '@/components/Spinner'
import styles from './Home.module.css'

const Home = () => {
  return (
    <div className={styles.container}>
      <Spinner showTitle={false} />
    </div>
  )
}

export default Home
