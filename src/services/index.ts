// Non-HTTP services (bridge, storage) placeholder
// TODO: 實作 Bridge 和儲存相關服務

import { PLATFORM, BRIDGE_MODE } from '@/api/enums'

/**
 * Platform detection service
 */
export class PlatformDetectionService {
  static detectPlatform(): PLATFORM {
    const userAgent = navigator.userAgent.toLowerCase()

    if (userAgent.includes('android')) {
      return PLATFORM.ANDROID
    }

    if (
      userAgent.includes('windows') ||
      navigator.platform.toLowerCase().includes('win')
    ) {
      return PLATFORM.WINDOWS
    }

    return PLATFORM.WEB
  }

  static getBridgeMode(): BRIDGE_MODE {
    const platform = this.detectPlatform()

    switch (platform) {
      case PLATFORM.WINDOWS:
        return BRIDGE_MODE.ASYNC_BRIDGE
      case PLATFORM.ANDROID:
        return BRIDGE_MODE.OBJECT_METHOD
      default:
        return BRIDGE_MODE.POST_MESSAGE
    }
  }
}

/**
 * Storage service for managing application state
 */
export class StorageService {
  private static readonly PREFIX = 'siamese-cat-'

  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(this.PREFIX + key, serializedValue)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save to localStorage:', error)
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.PREFIX + key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to read from localStorage:', error)
      return defaultValue
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key)
  }
}
