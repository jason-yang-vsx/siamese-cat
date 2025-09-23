/**
 * WindowsBridge
 * Windows WebView2 平台的 Bridge 實作
 */

import { BridgeStrategy } from './BridgeStrategy';
import type { 
  Student, 
  StudentPickedEvent, 
  StudentRemovedEvent,
  BridgeMessage
} from '../types/bridge.types';
import type { PlatformType } from '../types/platform.types';

export class WindowsBridge extends BridgeStrategy {
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  getPlatform(): PlatformType {
    return 'windows';
  }

  async connect(): Promise<void> {
    try {
      this.updateConnectionStatus('connecting');
      this.setupListeners();
      
      // 測試連接
      const testMessage = this.createMessage('ping', {});
      
      if (this.win.Windows?.receiveMessage) {
        // 使用 Windows.receiveMessage
        this.win.Windows.receiveMessage(JSON.stringify(testMessage));
      } else if (this.win.chrome?.webview?.postMessage) {
        // 使用 chrome.webview.postMessage
        this.win.chrome.webview.postMessage(testMessage);
      } else if (this.win.asyncBridge) {
        // AsyncBridge 可用，不需要測試
        console.log('Windows AsyncBridge available');
      } else {
        throw new Error('No Windows bridge API available');
      }

      this.updateConnectionStatus('connected');
      this.updateLastActivity();
      console.log('Windows bridge connected successfully');
    } catch (error) {
      this.updateConnectionStatus('error');
      console.error('Failed to connect Windows bridge:', error);
      throw error;
    }
  }

  disconnect(): void {
    this.updateConnectionStatus('disconnected');
    
    // 移除事件監聽器
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }

    // 清理資源
    this.cleanup();
    console.log('Windows bridge disconnected');
  }

  setupListeners(): void {
    // 設置 PostMessage 監聽器
    if (!this.messageHandler) {
      this.messageHandler = (event: MessageEvent) => {
        try {
          // 驗證來源
          if (event.origin !== window.location.origin && event.origin !== 'null') {
            return;
          }

          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          this.handleMessage(data);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      };
      window.addEventListener('message', this.messageHandler);
    }

    // 設置 chrome.webview 監聽器
    if (this.win.chrome?.webview?.addEventListener) {
      this.win.chrome.webview.addEventListener('message', (event: any) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          this.handleMessage(data);
        } catch (error) {
          console.error('Error handling webview message:', error);
        }
      });
    }
  }

  async getStudentList(): Promise<Student[]> {
    const messageId = this.generateMessageId();
    
    // 優先使用 AsyncBridge
    if (this.win.asyncBridge?.getStudentList) {
      try {
        const result = await this.callAsyncBridge('getStudentList');
        this.updateLastActivity();
        return this.parseStudentListResponse(result);
      } catch (error) {
        console.error('AsyncBridge getStudentList failed:', error);
      }
    }

    // 使用 PostMessage
    const message = this.createMessage('getStudentList', {});
    const promise = this.createPendingRequest<Student[]>(messageId, 5000);
    
    this.sendMessage(message);
    
    const result = await promise;
    this.updateLastActivity();
    return result;
  }

  async studentPicked(event: StudentPickedEvent): Promise<boolean> {
    const messageId = this.generateMessageId();
    
    // 優先使用 AsyncBridge
    if (this.win.asyncBridge?.studentPicked) {
      try {
        const result = await this.callAsyncBridge('studentPicked', event);
        this.updateLastActivity();
        return this.parseBooleanResponse(result);
      } catch (error) {
        console.error('AsyncBridge studentPicked failed:', error);
      }
    }

    // 使用 PostMessage
    const message = this.createMessage('studentPicked', event);
    const promise = this.createPendingRequest<boolean>(messageId, 5000);
    
    this.sendMessage(message);
    
    const result = await promise;
    this.updateLastActivity();
    return result;
  }

  async studentRemoved(event: StudentRemovedEvent): Promise<boolean> {
    const messageId = this.generateMessageId();
    
    // 優先使用 AsyncBridge
    if (this.win.asyncBridge?.studentRemoved) {
      try {
        const result = await this.callAsyncBridge('studentRemoved', event);
        this.updateLastActivity();
        return this.parseBooleanResponse(result);
      } catch (error) {
        console.error('AsyncBridge studentRemoved failed:', error);
      }
    }

    // 使用 PostMessage
    const message = this.createMessage('studentRemoved', event);
    const promise = this.createPendingRequest<boolean>(messageId, 5000);
    
    this.sendMessage(message);
    
    const result = await promise;
    this.updateLastActivity();
    return result;
  }

  /**
   * 呼叫 AsyncBridge API
   */
  private async callAsyncBridge(method: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const asyncBridge = this.win.asyncBridge!;
      const fn = asyncBridge[method];
      
      if (!fn || typeof fn !== 'function') {
        reject(new Error(`AsyncBridge method ${method} not found`));
        return;
      }

      try {
        // 呼叫 AsyncBridge 方法
        const result = data ? fn(JSON.stringify(data)) : fn();
        
        // 處理 Proxy 物件（Windows 特有）
        if (result && typeof result === 'object') {
          if (typeof result._then === 'function') {
            // Proxy 物件有 _then 方法
            result._then(resolve, reject);
          } else if (typeof result.then === 'function') {
            // 標準 Promise
            result.then(resolve).catch(reject);
          } else {
            // 同步結果
            resolve(result);
          }
        } else {
          // 直接返回結果
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 發送訊息
   */
  private sendMessage(message: BridgeMessage): void {
    const messageStr = JSON.stringify(message);
    
    // 優先順序：Windows.receiveMessage > chrome.webview.postMessage
    if (this.win.Windows?.receiveMessage) {
      this.win.Windows.receiveMessage(messageStr);
    } else if (this.win.chrome?.webview?.postMessage) {
      this.win.chrome.webview.postMessage(message);
    } else {
      console.error('No message sending method available');
      throw new Error('Cannot send message to Windows host');
    }
  }

  /**
   * 處理接收到的訊息
   */
  private handleMessage(data: any): void {
    try {
      if (!data.event) return;

      // 處理回應訊息
      if (data.event.endsWith('Response')) {
        const messageId = data.messageId;
        if (messageId && this.pendingRequests.has(messageId)) {
          this.resolvePendingRequest(messageId, data.data);
        }
      }

      // 發送事件
      this.eventEmitter.emit(data.event, data.data);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  /**
   * 解析學生列表回應
   */
  private parseStudentListResponse(result: any): Student[] {
    if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result);
        return parsed.data || parsed || [];
      } catch {
        return [];
      }
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    if (result && typeof result === 'object') {
      return result.data || [];
    }
    
    return [];
  }

  /**
   * 解析布林值回應
   */
  private parseBooleanResponse(result: any): boolean {
    if (typeof result === 'boolean') {
      return result;
    }
    
    if (typeof result === 'string') {
      return result.toLowerCase() === 'true' || result === '1';
    }
    
    if (result && typeof result === 'object') {
      return result.success || false;
    }
    
    return false;
  }
}