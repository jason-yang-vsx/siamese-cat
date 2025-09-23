/**
 * BridgeStrategy
 * Bridge 策略的抽象基礎類別
 */

import { EventEmitter } from '../utils/EventEmitter';
import type { 
  Student, 
  StudentPickedEvent, 
  StudentRemovedEvent,
  BridgeMessage,
  ConnectionInfo,
  ConnectionStatus
} from '../types/bridge.types';
import type { PlatformType, WindowWithBridge } from '../types/platform.types';

export abstract class BridgeStrategy {
  protected win: WindowWithBridge;
  protected eventEmitter: EventEmitter;
  protected connectionStatus: ConnectionStatus = 'disconnected';
  protected lastActivity: Date | null = null;
  protected messageIdCounter = 0;
  protected pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timeout: number;
  }> = new Map();

  constructor(eventEmitter: EventEmitter) {
    this.win = window as WindowWithBridge;
    this.eventEmitter = eventEmitter;
  }

  /**
   * 獲取平台類型
   */
  abstract getPlatform(): PlatformType;

  /**
   * 初始化連接
   */
  abstract connect(): Promise<void>;

  /**
   * 斷開連接
   */
  abstract disconnect(): void;

  /**
   * 設置事件監聽器
   */
  abstract setupListeners(): void;

  /**
   * 獲取學生列表
   */
  abstract getStudentList(): Promise<Student[]>;

  /**
   * 學生被選中
   */
  abstract studentPicked(event: StudentPickedEvent): Promise<boolean>;

  /**
   * 學生被移除
   */
  abstract studentRemoved(event: StudentRemovedEvent): Promise<boolean>;

  /**
   * 獲取連接資訊
   */
  getConnectionInfo(): ConnectionInfo {
    return {
      status: this.connectionStatus,
      platform: this.getPlatform(),
      lastActivity: this.lastActivity?.toISOString()
    };
  }

  /**
   * 生成唯一的訊息 ID
   */
  protected generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}`;
  }

  /**
   * 創建 Bridge 訊息
   */
  protected createMessage(event: string, data: any): BridgeMessage {
    return {
      event,
      data,
      timestamp: new Date().toISOString(),
      messageId: this.generateMessageId()
    };
  }

  /**
   * 處理超時
   */
  protected createTimeout(timeout: number = 5000): Promise<never> {
    return new Promise((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * 創建帶超時的 Promise
   */
  protected createPendingRequest<T>(
    messageId: string,
    timeout: number = 5000
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(messageId);
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      this.pendingRequests.set(messageId, {
        resolve,
        reject,
        timeout: timeoutId
      });
    });
  }

  /**
   * 解析待處理的請求
   */
  protected resolvePendingRequest(messageId: string, data: any): void {
    const pending = this.pendingRequests.get(messageId);
    if (pending) {
      window.clearTimeout(pending.timeout);
      pending.resolve(data);
      this.pendingRequests.delete(messageId);
    }
  }

  /**
   * 拒絕待處理的請求
   */
  protected rejectPendingRequest(messageId: string, error: any): void {
    const pending = this.pendingRequests.get(messageId);
    if (pending) {
      window.clearTimeout(pending.timeout);
      pending.reject(error);
      this.pendingRequests.delete(messageId);
    }
  }

  /**
   * 更新連接狀態
   */
  protected updateConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.eventEmitter.emit('connectionStatusChanged', status);
  }

  /**
   * 更新最後活動時間
   */
  protected updateLastActivity(): void {
    this.lastActivity = new Date();
  }

  /**
   * 清理資源
   */
  protected cleanup(): void {
    // 清理所有待處理的請求
    this.pendingRequests.forEach((pending) => {
      window.clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    });
    this.pendingRequests.clear();
  }
}