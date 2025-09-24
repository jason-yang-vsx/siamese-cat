/**
 * useBridge Hook
 * React Hook 提供 Bridge 服務的介面
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { BridgeService } from '@/services/bridge/BridgeService'
import type {
  Student,
  StudentPickedEvent,
  StudentRemovedEvent,
  ConnectionStatus,
  ConnectionInfo,
} from '@/services/bridge/types/bridge.types'
import type { PlatformType } from '@/services/bridge/types/platform.types'

interface UseBridgeReturn {
  // 狀態
  students: Student[]
  connectionStatus: ConnectionStatus
  connectionInfo: ConnectionInfo
  platform: PlatformType
  isLoading: boolean
  error: string | null

  // 方法
  connect: () => Promise<void>
  disconnect: () => void
  getStudentList: () => Promise<void>
  pickStudent: (studentId: string) => Promise<boolean>
  removeStudent: (studentId: string) => Promise<boolean>

  // 工具方法
  isConnected: boolean
  retryConnection: () => Promise<void>
  clearError: () => void
}

export function useBridge(): UseBridgeReturn {
  const bridgeRef = useRef<BridgeService | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected')
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: 'disconnected',
    platform: 'web',
  })
  const [platform, setPlatform] = useState<PlatformType>('web')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unsubscribersRef = useRef<(() => void)[]>([])

  /**
   * 初始化 Bridge
   */
  const initBridge = useCallback(() => {
    if (!bridgeRef.current) {
      bridgeRef.current = BridgeService.getInstance()
    }
    return bridgeRef.current
  }, [])

  /**
   * 連接 Bridge
   */
  const connect = useCallback(async () => {
    const bridge = initBridge()
    setIsLoading(true)
    setError(null)

    try {
      await bridge.connect()

      const info = bridge.getConnectionInfo()
      setConnectionInfo(info)
      setConnectionStatus(info.status)
      setPlatform(bridge.getPlatform())

      console.log('Bridge connected successfully')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect bridge'
      setError(errorMessage)
      setConnectionStatus('error')
      console.error('Bridge connection failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [initBridge])

  /**
   * 斷開 Bridge
   */
  const disconnect = useCallback(() => {
    const bridge = initBridge()
    bridge.disconnect()

    setConnectionStatus('disconnected')
    setConnectionInfo({
      status: 'disconnected',
      platform: bridge.getPlatform(),
    })
    setStudents([])
    setError(null)

    console.log('Bridge disconnected')
  }, [initBridge])

  /**
   * 獲取學生列表
   */
  const getStudentList = useCallback(async () => {
    const bridge = initBridge()

    if (!bridge.isConnected()) {
      setError('Bridge not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const studentList = await bridge.getStudentList()
      setStudents(studentList)
      console.log(`Loaded ${studentList.length} students`)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get student list'
      setError(errorMessage)
      console.error('Failed to get student list:', err)
    } finally {
      setIsLoading(false)
    }
  }, [initBridge])

  /**
   * 選擇學生
   */
  const pickStudent = useCallback(
    async (studentId: string): Promise<boolean> => {
      const bridge = initBridge()

      if (!bridge.isConnected()) {
        setError('Bridge not connected')
        return false
      }

      setError(null)

      try {
        const event: StudentPickedEvent = { studentId }
        const result = await bridge.studentPicked(event)

        if (result) {
          console.log(`Student ${studentId} picked successfully`)
        }

        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to pick student'
        setError(errorMessage)
        console.error('Failed to pick student:', err)
        return false
      }
    },
    [initBridge]
  )

  /**
   * 移除學生
   */
  const removeStudent = useCallback(
    async (studentId: string): Promise<boolean> => {
      const bridge = initBridge()

      if (!bridge.isConnected()) {
        setError('Bridge not connected')
        return false
      }

      setError(null)

      try {
        const event: StudentRemovedEvent = { studentId }
        const result = await bridge.studentRemoved(event)

        if (result) {
          // 更新本地學生列表
          setStudents(prev => prev.filter(s => s.studentId !== studentId))
          console.log(`Student ${studentId} removed successfully`)
        }

        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to remove student'
        setError(errorMessage)
        console.error('Failed to remove student:', err)
        return false
      }
    },
    [initBridge]
  )

  /**
   * 重試連接
   */
  const retryConnection = useCallback(async () => {
    await disconnect()
    await connect()
  }, [connect, disconnect])

  /**
   * 清除錯誤
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * 設置事件監聽器
   */
  useEffect(() => {
    const bridge = initBridge()

    // 清理舊的監聽器
    unsubscribersRef.current.forEach(unsub => unsub())
    unsubscribersRef.current = []

    // 設置新的監聽器
    const unsubscribers = [
      // 連接狀態變化
      bridge.on('connectionStatusChanged', (status: ConnectionStatus) => {
        setConnectionStatus(status)
        const info = bridge.getConnectionInfo()
        setConnectionInfo(info)
      }),

      // 連接成功
      bridge.on('connected', data => {
        console.log('Bridge connected event:', data)
        setConnectionStatus('connected')
        // 自動獲取學生列表
        getStudentList()
      }),

      // 斷開連接
      bridge.on('disconnected', data => {
        console.log('Bridge disconnected event:', data)
        setConnectionStatus('disconnected')
      }),

      // 學生列表更新
      bridge.on('studentsLoaded', (studentList: Student[]) => {
        setStudents(studentList)
      }),

      // 錯誤事件
      bridge.on('error', errorInfo => {
        console.error('Bridge error:', errorInfo)
        setError(errorInfo.message || 'Unknown error')
      }),
    ]

    unsubscribersRef.current = unsubscribers

    // 清理函式
    return () => {
      unsubscribersRef.current.forEach(unsub => unsub())
      unsubscribersRef.current = []
    }
  }, [initBridge, getStudentList])

  /**
   * 元件掛載時自動連接
   */
  useEffect(() => {
    connect()

    // 元件卸載時斷開連接
    return () => {
      if (bridgeRef.current && bridgeRef.current.isConnected()) {
        bridgeRef.current.disconnect()
      }
    }
  }, [])

  return {
    // 狀態
    students,
    connectionStatus,
    connectionInfo,
    platform,
    isLoading,
    error,

    // 方法
    connect,
    disconnect,
    getStudentList,
    pickStudent,
    removeStudent,

    // 工具方法
    isConnected: connectionStatus === 'connected',
    retryConnection,
    clearError,
  }
}
