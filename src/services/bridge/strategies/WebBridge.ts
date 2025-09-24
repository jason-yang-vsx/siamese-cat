/**
 * WebBridge
 * Web 瀏覽器環境的 Bridge 實作（使用 Mock 資料）
 */

import type {
  Student,
  StudentPickedEvent,
  StudentRemovedEvent,
} from '../types/bridge.types'
import type { PlatformType } from '../types/platform.types'
import { BridgeStrategy } from './BridgeStrategy'

/**
 * Mock 學生資料
 */
const MOCK_STUDENTS: Student[] = [
  { studentId: '1', name: '漩渦鳴人', seatNumber: '1' },
  { studentId: '2', name: '宇智波佐助', seatNumber: '2' },
  { studentId: '3', name: '春野櫻', seatNumber: '3' },
  { studentId: '4', name: '旗木卡卡西', seatNumber: '4' },
  { studentId: '5', name: '路飛', seatNumber: '5' },
  { studentId: '6', name: '索隆', seatNumber: '6' },
  { studentId: '7', name: '娜美', seatNumber: '7' },
  { studentId: '8', name: '香吉士', seatNumber: '8' },
  { studentId: '9', name: '蒙其·D·魯夫', seatNumber: '9' },
  { studentId: '10', name: '喬巴', seatNumber: '10' },
  { studentId: '11', name: '艾斯', seatNumber: '11' },
  { studentId: '12', name: '黑崎一護', seatNumber: '12' },
  { studentId: '13', name: '朽木露琪亞', seatNumber: '13' },
  { studentId: '14', name: '日番谷冬獅郎', seatNumber: '14' },
  { studentId: '15', name: '夜神月', seatNumber: '15' },
  { studentId: '16', name: 'L', seatNumber: '16' },
  { studentId: '17', name: '愛德華·艾力克', seatNumber: '17' },
  { studentId: '18', name: '阿爾馮斯·艾力克', seatNumber: '18' },
  { studentId: '19', name: '桐人', seatNumber: '19' },
  { studentId: '20', name: '亞絲娜', seatNumber: '20' },
]

export class WebBridge extends BridgeStrategy {
  private mockStudents: Student[] = [...MOCK_STUDENTS]
  private removedStudents: Set<string> = new Set()
  private selectedStudents: Set<string> = new Set()

  getPlatform(): PlatformType {
    return 'web'
  }

  async connect(): Promise<void> {
    try {
      this.updateConnectionStatus('connecting')

      // 模擬連接延遲
      await this.simulateDelay(500)

      this.setupListeners()
      this.updateConnectionStatus('connected')
      this.updateLastActivity()

      console.log('Web bridge (Mock) connected successfully')
      console.log('Mock mode: Using simulated data for development')
    } catch (error) {
      this.updateConnectionStatus('error')
      console.error('Failed to connect Web bridge:', error)
      throw error
    }
  }

  disconnect(): void {
    this.updateConnectionStatus('disconnected')
    this.cleanup()

    // 重置 mock 資料
    this.mockStudents = [...MOCK_STUDENTS]
    this.removedStudents.clear()
    this.selectedStudents.clear()

    console.log('Web bridge (Mock) disconnected')
  }

  setupListeners(): void {
    // Web Mock 不需要設置實際的監聽器
    console.log('Web bridge mock listeners initialized')
  }

  async getStudentList(): Promise<Student[]> {
    await this.simulateDelay(300)

    // 返回未被移除的學生
    const activeStudents = this.mockStudents.filter(
      student => !this.removedStudents.has(student.studentId)
    )

    this.updateLastActivity()

    // 發送事件通知
    setTimeout(() => {
      this.eventEmitter.emit('getStudentListResponse', { data: activeStudents })
    }, 0)

    console.log(`Returning ${activeStudents.length} mock students`)
    return activeStudents
  }

  async studentPicked(event: StudentPickedEvent): Promise<boolean> {
    await this.simulateDelay(200)

    const { studentId } = event

    // 檢查學生是否存在
    const student = this.mockStudents.find(s => s.studentId === studentId)

    if (!student) {
      console.warn(`Student ${studentId} not found`)
      return false
    }

    if (this.removedStudents.has(studentId)) {
      console.warn(`Student ${studentId} has been removed`)
      return false
    }

    // 記錄選中狀態
    this.selectedStudents.add(studentId)
    this.updateLastActivity()

    // 發送事件通知
    setTimeout(() => {
      this.eventEmitter.emit('studentPickedResponse', {
        success: true,
        studentId,
        student,
      })
    }, 0)

    console.log(`Student picked: ${student.name} (${studentId})`)
    return true
  }

  async studentRemoved(event: StudentRemovedEvent): Promise<boolean> {
    await this.simulateDelay(200)

    const { studentId } = event

    // 檢查學生是否存在
    const student = this.mockStudents.find(s => s.studentId === studentId)

    if (!student) {
      console.warn(`Student ${studentId} not found`)
      return false
    }

    if (this.removedStudents.has(studentId)) {
      console.warn(`Student ${studentId} already removed`)
      return false
    }

    // 檢查是否剩餘最後兩名學生
    const activeCount = this.mockStudents.filter(
      s => !this.removedStudents.has(s.studentId)
    ).length

    if (activeCount <= 2) {
      console.warn('Cannot remove student: minimum 2 students required')

      // 發送錯誤事件
      setTimeout(() => {
        this.eventEmitter.emit('error', {
          message: '無法移除學生：至少需要保留 2 名學生',
          code: 'MIN_STUDENTS_REQUIRED',
        })
      }, 0)

      return false
    }

    // 記錄移除狀態
    this.removedStudents.add(studentId)
    this.selectedStudents.delete(studentId)
    this.updateLastActivity()

    // 發送事件通知
    setTimeout(() => {
      this.eventEmitter.emit('studentRemovedResponse', {
        success: true,
        studentId,
        student,
      })
    }, 0)

    console.log(`Student removed: ${student.name} (${studentId})`)
    return true
  }

  /**
   * 模擬網路延遲
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 獲取 Mock 資料狀態（用於開發除錯）
   */
  getMockStatus(): {
    totalStudents: number
    activeStudents: number
    removedStudents: number
    selectedStudents: number
  } {
    const activeCount = this.mockStudents.filter(
      s => !this.removedStudents.has(s.studentId)
    ).length

    return {
      totalStudents: this.mockStudents.length,
      activeStudents: activeCount,
      removedStudents: this.removedStudents.size,
      selectedStudents: this.selectedStudents.size,
    }
  }

  /**
   * 重置 Mock 資料（用於開發測試）
   */
  resetMockData(): void {
    this.mockStudents = [...MOCK_STUDENTS]
    this.removedStudents.clear()
    this.selectedStudents.clear()

    console.log('Mock data reset to initial state')

    // 發送資料更新事件
    this.getStudentList()
  }

  /**
   * 添加自訂學生（用於測試）
   */
  addMockStudent(student: Student): void {
    if (this.mockStudents.find(s => s.studentId === student.studentId)) {
      console.warn(`Student ${student.studentId} already exists`)
      return
    }

    this.mockStudents.push(student)
    console.log(`Added mock student: ${student.name}`)

    // 發送資料更新事件
    this.getStudentList()
  }
}
