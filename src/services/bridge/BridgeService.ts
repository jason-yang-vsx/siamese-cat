/**
 * BridgeService
 * 主要的 Bridge 服務，使用策略模式處理不同平台
 */

import { EventEmitter } from './utils/EventEmitter';
import { PlatformDetector } from './PlatformDetector';
import { BridgeStrategy } from './strategies/BridgeStrategy';
import { WindowsBridge } from './strategies/WindowsBridge';
import { AndroidBridge } from './strategies/AndroidBridge';
import { WebBridge } from './strategies/WebBridge';
import type {
  BridgeAPI,
  Student,
  StudentPickedEvent,
  StudentRemovedEvent,
  ConnectionInfo
} from './types/bridge.types';
import type { PlatformType } from './types/platform.types';

export class BridgeService implements BridgeAPI {
  private static instance: BridgeService | null = null;
  private eventEmitter: EventEmitter;
  private platformDetector: PlatformDetector;
  private strategy: BridgeStrategy | null = null;
  private platform: PlatformType;
  private connectionRetryCount = 0;
  private maxRetries = 3;
  private retryTimeout: number | null = null;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.platformDetector = new PlatformDetector();
    this.platform = 'web';
  }

  /**
   * 獲取 BridgeService 單例
   */
  static getInstance(): BridgeService {
    if (!BridgeService.instance) {
      BridgeService.instance = new BridgeService();
    }
    return BridgeService.instance;
  }

  /**
   * 初始化並連接 Bridge
   */
  async connect(): Promise<void> {
    try {
      // 偵測平台
      const detectionResult = this.platformDetector.detect();
      this.platform = detectionResult.platform;
      
      console.log(`Platform detected: ${detectionResult.platform} (${detectionResult.confidence} confidence)`);
      console.log(`Detection method: ${detectionResult.detectionMethod}`);

      // 根據平台選擇策略
      this.strategy = this.createStrategy(detectionResult.platform);

      // 連接
      await this.strategy.connect();
      
      // 重置重試計數
      this.connectionRetryCount = 0;
      
      // 發送連接成功事件
      this.eventEmitter.emit('connected', {
        platform: this.platform,
        timestamp: new Date().toISOString()
      });

      console.log('Bridge service connected successfully');
    } catch (error) {
      console.error('Failed to connect bridge:', error);
      
      // 嘗試重試
      if (this.connectionRetryCount < this.maxRetries) {
        this.connectionRetryCount++;
        console.log(`Retrying connection (${this.connectionRetryCount}/${this.maxRetries})...`);
        
        // 延遲後重試
        this.retryTimeout = window.setTimeout(() => {
          this.connect();
        }, 2000 * this.connectionRetryCount); // 遞增延遲
      } else {
        // 重試失敗，使用 Web fallback
        console.warn('Max retries reached, falling back to Web mode');
        this.platform = 'web';
        this.strategy = new WebBridge(this.eventEmitter);
        
        try {
          await this.strategy.connect();
        } catch (fallbackError) {
          console.error('Fallback to Web mode also failed:', fallbackError);
          throw fallbackError;
        }
      }
    }
  }

  /**
   * 斷開 Bridge 連接
   */
  disconnect(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    if (this.strategy) {
      this.strategy.disconnect();
      this.strategy = null;
    }

    this.eventEmitter.emit('disconnected', {
      platform: this.platform,
      timestamp: new Date().toISOString()
    });

    console.log('Bridge service disconnected');
  }

  /**
   * 獲取學生列表
   */
  async getStudentList(): Promise<Student[]> {
    this.ensureConnected();
    
    try {
      const students = await this.strategy!.getStudentList();
      
      // 發送事件
      this.eventEmitter.emit('studentsLoaded', students);
      
      return students;
    } catch (error) {
      console.error('Failed to get student list:', error);
      this.handleError('getStudentList', error);
      throw error;
    }
  }

  /**
   * 通知學生被選中
   */
  async studentPicked(event: StudentPickedEvent): Promise<boolean> {
    this.ensureConnected();
    
    try {
      const result = await this.strategy!.studentPicked(event);
      
      // 發送事件
      this.eventEmitter.emit('studentPickedComplete', {
        ...event,
        success: result
      });
      
      return result;
    } catch (error) {
      console.error('Failed to notify student picked:', error);
      this.handleError('studentPicked', error);
      throw error;
    }
  }

  /**
   * 通知學生被移除
   */
  async studentRemoved(event: StudentRemovedEvent): Promise<boolean> {
    this.ensureConnected();
    
    try {
      const result = await this.strategy!.studentRemoved(event);
      
      // 發送事件
      this.eventEmitter.emit('studentRemovedComplete', {
        ...event,
        success: result
      });
      
      return result;
    } catch (error) {
      console.error('Failed to notify student removed:', error);
      this.handleError('studentRemoved', error);
      throw error;
    }
  }

  /**
   * 獲取連接資訊
   */
  getConnectionInfo(): ConnectionInfo {
    if (!this.strategy) {
      return {
        status: 'disconnected',
        platform: this.platform
      };
    }
    
    return this.strategy.getConnectionInfo();
  }

  /**
   * 訂閱事件
   */
  on(event: string, callback: (data: any) => void): () => void {
    return this.eventEmitter.on(event, callback);
  }

  /**
   * 取消訂閱事件
   */
  off(event: string, callback?: (data: any) => void): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * 獲取當前平台
   */
  getPlatform(): PlatformType {
    return this.platform;
  }

  /**
   * 獲取平台詳細資訊
   */
  getPlatformInfo() {
    return this.platformDetector.getDetailedInfo();
  }

  /**
   * 檢查是否已連接
   */
  isConnected(): boolean {
    return this.strategy !== null && 
           this.strategy.getConnectionInfo().status === 'connected';
  }

  /**
   * 建立平台策略
   */
  private createStrategy(platform: PlatformType): BridgeStrategy {
    switch (platform) {
      case 'windows':
        return new WindowsBridge(this.eventEmitter);
      case 'android':
        return new AndroidBridge(this.eventEmitter);
      case 'web':
      default:
        return new WebBridge(this.eventEmitter);
    }
  }

  /**
   * 確保已連接
   */
  private ensureConnected(): void {
    if (!this.strategy) {
      throw new Error('Bridge not connected. Call connect() first.');
    }
    
    const status = this.strategy.getConnectionInfo().status;
    if (status !== 'connected') {
      throw new Error(`Bridge not ready. Current status: ${status}`);
    }
  }

  /**
   * 處理錯誤
   */
  private handleError(operation: string, error: any): void {
    const errorInfo = {
      operation,
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      platform: this.platform
    };
    
    this.eventEmitter.emit('error', errorInfo);
    
    // 如果是連接錯誤，嘗試重新連接
    if (error.message && error.message.includes('not connected')) {
      console.log('Connection lost, attempting to reconnect...');
      this.connect();
    }
  }

  /**
   * 獲取 Mock 服務（僅在 Web 模式下可用）
   */
  getMockService(): WebBridge | null {
    if (this.platform === 'web' && this.strategy instanceof WebBridge) {
      return this.strategy;
    }
    return null;
  }
}