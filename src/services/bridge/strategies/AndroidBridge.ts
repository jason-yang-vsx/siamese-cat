/**
 * AndroidBridge
 * Android WebView 平台的 Bridge 實作
 */

import { BridgeStrategy } from './BridgeStrategy'
import type {
  Student,
  StudentPickedEvent,
  StudentRemovedEvent,
} from '../types/bridge.types'
import type { PlatformType } from '../types/platform.types'

export class AndroidBridge extends BridgeStrategy {
  getPlatform(): PlatformType {
    return 'android'
  }

  async connect(): Promise<void> {
    try {
      this.updateConnectionStatus('connecting')
      this.setupListeners()

      // 測試連接
      if (this.win.Android) {
        console.log('Android bridge object detected')

        // 檢查可用的方法
        const methods = [
          'getStudentList',
          'studentPicked',
          'studentRemoved',
          'receiveMessage',
        ]
        const available = methods.filter(
          m => typeof (this.win.Android as any)[m] === 'function'
        )
        console.log('Available Android methods:', available)
      } else if (this.win.asyncBridge) {
        console.log('Android AsyncBridge detected')
      } else {
        throw new Error('No Android bridge API available')
      }

      this.updateConnectionStatus('connected')
      this.updateLastActivity()
      console.log('Android bridge connected successfully')
    } catch (error) {
      this.updateConnectionStatus('error')
      console.error('Failed to connect Android bridge:', error)
      throw error
    }
  }

  disconnect(): void {
    this.updateConnectionStatus('disconnected')
    this.cleanup()
    console.log('Android bridge disconnected')
  }

  setupListeners(): void {
    // Android 通常使用直接方法呼叫，不需要設置監聽器
    // 但可能需要處理來自原生端的回調

    // 註冊全域回調函式供 Android 呼叫
    ;(window as any).onAndroidMessage = (messageStr: string) => {
      try {
        const data = JSON.parse(messageStr)
        this.handleMessage(data)
      } catch (error) {
        console.error('Error handling Android message:', error)
      }
    }
  }

  async getStudentList(): Promise<Student[]> {
    // 優先使用 Android 物件方法
    if (this.win.Android?.getStudentList) {
      try {
        const result = this.win.Android.getStudentList()
        this.updateLastActivity()
        return this.parseStudentListResponse(result)
      } catch (error) {
        console.error('Android.getStudentList failed:', error)
      }
    }

    // 使用 AsyncBridge
    if (this.win.asyncBridge?.getStudentList) {
      try {
        const result = await this.callAsyncBridge('getStudentList')
        this.updateLastActivity()
        return this.parseStudentListResponse(result)
      } catch (error) {
        console.error('AsyncBridge getStudentList failed:', error)
      }
    }

    // 使用 receiveMessage
    if (this.win.Android?.receiveMessage) {
      const message = this.createMessage('getStudentList', {})
      const promise = this.createPendingRequest<Student[]>(
        message.messageId!,
        5000
      )

      this.win.Android.receiveMessage(JSON.stringify(message))

      const result = await promise
      this.updateLastActivity()
      return result
    }

    throw new Error('No method available to get student list')
  }

  async studentPicked(event: StudentPickedEvent): Promise<boolean> {
    // 優先使用 Android 物件方法
    if (this.win.Android?.studentPicked) {
      try {
        const result = this.win.Android.studentPicked(JSON.stringify(event))
        this.updateLastActivity()
        return this.parseBooleanResponse(result)
      } catch (error) {
        console.error('Android.studentPicked failed:', error)
      }
    }

    // 使用 AsyncBridge
    if (this.win.asyncBridge?.studentPicked) {
      try {
        const result = await this.callAsyncBridge('studentPicked', event)
        this.updateLastActivity()
        return this.parseBooleanResponse(result)
      } catch (error) {
        console.error('AsyncBridge studentPicked failed:', error)
      }
    }

    // 使用 receiveMessage
    if (this.win.Android?.receiveMessage) {
      const message = this.createMessage('studentPicked', event)
      const promise = this.createPendingRequest<boolean>(
        message.messageId!,
        5000
      )

      this.win.Android.receiveMessage(JSON.stringify(message))

      const result = await promise
      this.updateLastActivity()
      return result
    }

    throw new Error('No method available to notify student picked')
  }

  async studentRemoved(event: StudentRemovedEvent): Promise<boolean> {
    // 優先使用 Android 物件方法
    if (this.win.Android?.studentRemoved) {
      try {
        const result = this.win.Android.studentRemoved(JSON.stringify(event))
        this.updateLastActivity()
        return this.parseBooleanResponse(result)
      } catch (error) {
        console.error('Android.studentRemoved failed:', error)
      }
    }

    // 使用 AsyncBridge
    if (this.win.asyncBridge?.studentRemoved) {
      try {
        const result = await this.callAsyncBridge('studentRemoved', event)
        this.updateLastActivity()
        return this.parseBooleanResponse(result)
      } catch (error) {
        console.error('AsyncBridge studentRemoved failed:', error)
      }
    }

    // 使用 receiveMessage
    if (this.win.Android?.receiveMessage) {
      const message = this.createMessage('studentRemoved', event)
      const promise = this.createPendingRequest<boolean>(
        message.messageId!,
        5000
      )

      this.win.Android.receiveMessage(JSON.stringify(message))

      const result = await promise
      this.updateLastActivity()
      return result
    }

    throw new Error('No method available to notify student removed')
  }

  /**
   * 呼叫 AsyncBridge API（Android 版本）
   */
  private async callAsyncBridge(method: string, data?: any): Promise<any> {
    const asyncBridge = this.win.asyncBridge!
    const fn = asyncBridge[method]

    if (!fn || typeof fn !== 'function') {
      throw new Error(`AsyncBridge method ${method} not found`)
    }

    try {
      // Android AsyncBridge 的呼叫方式
      let result

      if (method === 'getStudentList') {
        // getStudentList 不需要參數
        result = fn()
      } else {
        // 其他方法需要 JSON 字串參數
        result = fn(JSON.stringify(data))
      }

      // Android 可能返回同步結果
      if (
        result &&
        typeof result === 'object' &&
        typeof result.then === 'function'
      ) {
        // Promise
        return await result
      } else {
        // 同步結果
        return result
      }
    } catch (error) {
      console.error(`AsyncBridge ${method} error:`, error)
      throw error
    }
  }

  /**
   * 處理接收到的訊息
   */
  private handleMessage(data: any): void {
    try {
      if (!data.event) return

      // 處理回應訊息
      if (data.event.endsWith('Response')) {
        const messageId = data.messageId
        if (messageId && this.pendingRequests.has(messageId)) {
          this.resolvePendingRequest(messageId, data.data)
        }
      }

      // 發送事件
      this.eventEmitter.emit(data.event, data.data)
    } catch (error) {
      console.error('Error processing message:', error)
    }
  }

  /**
   * 解析學生列表回應
   */
  private parseStudentListResponse(result: any): Student[] {
    // Android 可能返回 JSON 字串
    if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result)
        // 可能是直接的陣列或包含 data 屬性的物件
        if (Array.isArray(parsed)) {
          return parsed
        }
        if (parsed && parsed.data && Array.isArray(parsed.data)) {
          return parsed.data
        }
        return []
      } catch (error) {
        console.error('Failed to parse student list:', error)
        return []
      }
    }

    // 直接返回陣列
    if (Array.isArray(result)) {
      return result
    }

    // 物件包含 data 屬性
    if (result && typeof result === 'object' && result.data) {
      return result.data
    }

    console.warn('Unexpected student list response format:', result)
    return []
  }

  /**
   * 解析布林值回應
   * Android 特別處理：可能返回布林值、字串或物件
   */
  private parseBooleanResponse(result: any): boolean {
    // 直接布林值
    if (typeof result === 'boolean') {
      return result
    }

    // 字串形式的布林值
    if (typeof result === 'string') {
      const lower = result.toLowerCase()
      return lower === 'true' || lower === '1' || lower === 'success'
    }

    // 數字形式
    if (typeof result === 'number') {
      return result !== 0
    }

    // 物件形式
    if (result && typeof result === 'object') {
      return result.success === true || result.result === true
    }

    console.warn('Unexpected boolean response format:', result)
    return false
  }
}
