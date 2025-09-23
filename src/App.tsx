import { MainLayout } from '@/layouts'
import { Home } from '@/pages'
import { BridgeStatus } from '@/components/BridgeStatus/BridgeStatus'

function App() {
  return (
    <MainLayout>
      <div style={{ padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          轉盤抽選系統 - Bridge 測試
        </h1>
        <BridgeStatus />
        <Home />
      </div>
    </MainLayout>
  )
}

export default App
