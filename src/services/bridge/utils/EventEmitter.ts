/**
 * EventEmitter
 * 事件發射器，用於管理事件的訂閱和發布
 */

export type EventCallback = (data: any) => void;
export type Unsubscriber = () => void;

export class EventEmitter {
  private listeners: Map<string, Set<EventCallback>>;

  constructor() {
    this.listeners = new Map();
  }

  /**
   * 訂閱事件
   * @param event 事件名稱
   * @param callback 回調函式
   * @returns 取消訂閱的函式
   */
  on(event: string, callback: EventCallback): Unsubscriber {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const callbacks = this.listeners.get(event)!;
    callbacks.add(callback);

    // 返回取消訂閱的函式
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * 發送事件
   * @param event 事件名稱
   * @param data 事件資料
   */
  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }

  /**
   * 取消訂閱事件
   * @param event 事件名稱
   * @param callback 要取消的回調函式（可選）
   */
  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      // 如果沒有指定 callback，移除該事件的所有監聽器
      this.listeners.delete(event);
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    }
  }

  /**
   * 一次性事件訂閱
   * @param event 事件名稱
   * @param callback 回調函式
   * @returns 取消訂閱的函式
   */
  once(event: string, callback: EventCallback): Unsubscriber {
    const wrappedCallback: EventCallback = (data) => {
      callback(data);
      this.off(event, wrappedCallback);
    };
    return this.on(event, wrappedCallback);
  }

  /**
   * 清除所有事件監聽器
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * 獲取事件監聽器數量
   * @param event 事件名稱（可選）
   * @returns 監聽器數量
   */
  listenerCount(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.size || 0;
    }
    let total = 0;
    this.listeners.forEach(callbacks => {
      total += callbacks.size;
    });
    return total;
  }
}