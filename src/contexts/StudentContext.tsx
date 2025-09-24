/**
 * Student Context
 * Manages student list state and operations for the spinner application
 */

import { useBridge } from '@/hooks/useBridge'
import type { Student } from '@/services/bridge/types/bridge.types'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

interface StudentContextType {
  // State
  students: Student[]
  availableStudents: Student[]
  removedStudentIds: Set<string>
  isLoading: boolean
  error: string | null

  // Actions
  loadStudents: () => Promise<void>
  markStudentAsRemoved: (studentId: string) => void
  resetRemovedStudents: () => void
  getStudentById: (studentId: string) => Student | undefined

  // Computed
  hasStudents: boolean
  hasAvailableStudents: boolean
  totalStudents: number
  availableCount: number
  removedCount: number
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

interface StudentProviderProps {
  children: React.ReactNode
  autoLoad?: boolean
}

export const StudentProvider: React.FC<StudentProviderProps> = ({
  children,
  autoLoad = true,
}) => {
  const {
    students: bridgeStudents,
    getStudentList,
    isLoading: bridgeLoading,
    error: bridgeError,
  } = useBridge()
  const [students, setStudents] = useState<Student[]>([])
  const [removedStudentIds, setRemovedStudentIds] = useState<Set<string>>(
    new Set()
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Computed values
  const availableStudents = students.filter(
    student => !removedStudentIds.has(student.studentId)
  )
  const hasStudents = students.length > 0
  const hasAvailableStudents = availableStudents.length > 0
  const totalStudents = students.length
  const availableCount = availableStudents.length
  const removedCount = removedStudentIds.size

  /**
   * Load students from Bridge service
   */
  const loadStudents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await getStudentList()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load students'
      setError(errorMessage)
      console.error('Failed to load students:', err)

      // Use mock data in development if Bridge fails
      if (import.meta.env.DEV) {
        console.log('Using mock student data for development')
        const mockStudents: Student[] = [
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
        setStudents(mockStudents)
        setError(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [getStudentList])

  /**
   * Mark a student as removed (local state only)
   */
  const markStudentAsRemoved = useCallback((studentId: string) => {
    setRemovedStudentIds(prev => {
      const newSet = new Set(prev)
      newSet.add(studentId)
      return newSet
    })
  }, [])

  /**
   * Reset removed students list
   */
  const resetRemovedStudents = useCallback(() => {
    setRemovedStudentIds(new Set())
  }, [])

  /**
   * Get student by ID
   */
  const getStudentById = useCallback(
    (studentId: string): Student | undefined => {
      return students.find(s => s.studentId === studentId)
    },
    [students]
  )

  // Sync Bridge students with local state
  useEffect(() => {
    if (bridgeStudents && bridgeStudents.length > 0) {
      setStudents(bridgeStudents)
      setError(bridgeError)
    }
  }, [bridgeStudents, bridgeError])

  // Sync loading state
  useEffect(() => {
    setIsLoading(bridgeLoading)
  }, [bridgeLoading])

  // Auto-load students on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadStudents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]) // Only run once on mount, loadStudents is stable

  const contextValue: StudentContextType = {
    // State
    students,
    availableStudents,
    removedStudentIds,
    isLoading,
    error,

    // Actions
    loadStudents,
    markStudentAsRemoved,
    resetRemovedStudents,
    getStudentById,

    // Computed
    hasStudents,
    hasAvailableStudents,
    totalStudents,
    availableCount,
    removedCount,
  }

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  )
}

/**
 * Hook to use Student Context
 */
export const useStudents = (): StudentContextType => {
  const context = useContext(StudentContext)
  if (!context) {
    throw new Error('useStudents must be used within a StudentProvider')
  }
  return context
}

export default StudentContext
