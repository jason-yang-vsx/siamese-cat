import { StudentProvider } from '@/contexts/StudentContext'
import { MainLayout } from '@/layouts'
import { Home } from '@/pages'

function App() {
  return (
    <StudentProvider autoLoad={true}>
      <MainLayout>
        <Home />
      </MainLayout>
    </StudentProvider>
  )
}

export default App
