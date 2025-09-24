/**
 * Bridge Types
 * 定義 Bridge 相關的資料結構和介面
 */

/**
 * 學生資料結構
 */
export interface Student {
  studentId: string
  name: string
  seatNumber?: string
}

/**
 * Bridge 事件定義
 */
export interface StudentPickedEvent {
  studentId: string
}

export interface StudentRemovedEvent {
  studentId: string
}

/**
 * Bridge 訊息格式
 */
export interface BridgeMessage {
  event: string
  data: any
  timestamp: string
  messageId?: string
}

/**
 * Bridge 回應格式
 */
export interface BridgeResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

/**
 * 學生列表回應
 */
export interface StudentListResponse {
  data: Student[]
}

/**
 * 學生操作回應
 */
export interface StudentOperationResponse {
  success: boolean
  studentId: string
  message?: string
}

/**
 * Bridge 連接狀態
 */
export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'error'

/**
 * Bridge 連接資訊
 */
export interface ConnectionInfo {
  status: ConnectionStatus
  platform: string
  lastActivity?: string
  error?: string
}

/**
 * Bridge API 介面
 */
export interface BridgeAPI {
  // 核心 API 方法
  getStudentList(): Promise<Student[]>
  studentPicked(event: StudentPickedEvent): Promise<boolean>
  studentRemoved(event: StudentRemovedEvent): Promise<boolean>

  // 連接管理
  connect(): Promise<void>
  disconnect(): void
  getConnectionInfo(): ConnectionInfo

  // 事件管理
  on(event: string, callback: (data: any) => void): () => void
  off(event: string, callback?: (data: any) => void): void
}
