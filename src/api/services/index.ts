// Bridge service interfaces placeholder
// TODO: 實作完整的 Bridge API 服務

export interface Student {
  studentId: string
  name: string
  seatNumber?: string
}

export interface BridgeResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface BridgeService {
  getStudentList(): Promise<BridgeResponse<Student[]>>
  studentPicked(studentId: string): Promise<BridgeResponse<boolean>>
  studentRemoved(studentId: string): Promise<BridgeResponse<boolean>>
}

// Placeholder bridge service implementation
export const bridgeService: BridgeService = {
  async getStudentList() {
    // Mock implementation for development
    return {
      success: true,
      data: [
        { studentId: '1', name: '張小明', seatNumber: '1' },
        { studentId: '2', name: '李小華', seatNumber: '2' },
        { studentId: '3', name: '王小美', seatNumber: '3' },
        { studentId: '4', name: '陳小強', seatNumber: '4' },
      ],
    }
  },

  async studentPicked(_studentId: string) {
    // TODO: 實作實際的 Bridge API 呼叫
    // console.log('Student picked:', studentId)
    return { success: true, data: true }
  },

  async studentRemoved(_studentId: string) {
    // TODO: 實作實際的 Bridge API 呼叫
    // console.log('Student removed:', studentId)
    return { success: true, data: true }
  },
}
