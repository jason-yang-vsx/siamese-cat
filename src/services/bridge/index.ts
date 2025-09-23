/**
 * Bridge Service Public API
 * 導出 Bridge 相關的類別和型別
 */

// 主要服務
export { BridgeService } from './BridgeService';
export { PlatformDetector } from './PlatformDetector';

// 策略
export { BridgeStrategy } from './strategies/BridgeStrategy';
export { WindowsBridge } from './strategies/WindowsBridge';
export { AndroidBridge } from './strategies/AndroidBridge';
export { WebBridge } from './strategies/WebBridge';

// 工具
export { EventEmitter } from './utils/EventEmitter';

// 型別 - Bridge
export type {
  BridgeAPI,
  BridgeMessage,
  BridgeResponse,
  ConnectionInfo,
  ConnectionStatus,
  Student,
  StudentListResponse,
  StudentOperationResponse,
  StudentPickedEvent,
  StudentRemovedEvent
} from './types/bridge.types';

// 型別 - Platform
export type {
  PlatformType,
  PlatformInfo,
  PlatformDetectionResult,
  WindowWithBridge
} from './types/platform.types';