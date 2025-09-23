// Bridge communication enums
export enum BRIDGE_METHOD {
  GET_STUDENT_LIST = 'getStudentList',
  STUDENT_PICKED = 'studentPicked',
  STUDENT_REMOVED = 'studentRemoved',
}

// Platform detection enums
export enum PLATFORM {
  WINDOWS = 'windows',
  ANDROID = 'android',
  WEB = 'web',
}

// Bridge communication modes
export enum BRIDGE_MODE {
  ASYNC_BRIDGE = 'asyncBridge',
  POST_MESSAGE = 'postMessage',
  OBJECT_METHOD = 'objectMethod',
}

// UI states
export enum WHEEL_STATE {
  IDLE = 'idle',
  SPINNING = 'spinning',
  RESULT = 'result',
}

// Student related constants
export const MIN_PARTICIPANTS = 2 as const
export const PROTECTED_PARTICIPANTS = 2 as const
