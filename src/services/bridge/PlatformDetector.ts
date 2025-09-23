/**
 * PlatformDetector
 * 負責偵測當前執行環境的平台類型
 */

import type { PlatformType, PlatformDetectionResult, WindowWithBridge } from './types/platform.types';

export class PlatformDetector {
  private win: WindowWithBridge;

  constructor() {
    this.win = window as WindowWithBridge;
  }

  /**
   * 偵測平台
   * 按照優先順序進行偵測：
   * 1. Windows.receiveMessage (highest specificity)
   * 2. Android.receiveMessage || Android.getStudentList
   * 3. asyncBridge + Android UserAgent
   * 4. asyncBridge + !chrome.webview (Android)
   * 5. asyncBridge + chrome.webview (Windows)
   * 6. chrome.webview only (Windows)
   * 7. Electron patterns
   * 8. Web fallback
   */
  detect(): PlatformDetectionResult {
    // 1. Windows.receiveMessage (最高優先級)
    if (this.hasWindowsReceiveMessage()) {
      return {
        platform: 'windows',
        confidence: 'high',
        detectionMethod: 'Windows.receiveMessage'
      };
    }

    // 2. Android 物件方法
    if (this.hasAndroidObject()) {
      return {
        platform: 'android',
        confidence: 'high',
        detectionMethod: 'Android object methods'
      };
    }

    // 3. asyncBridge + Android UserAgent
    if (this.hasAsyncBridge() && this.isAndroidUserAgent()) {
      return {
        platform: 'android',
        confidence: 'high',
        detectionMethod: 'asyncBridge + Android UserAgent'
      };
    }

    // 4. asyncBridge + !chrome.webview (Android)
    if (this.hasAsyncBridge() && !this.hasChromeWebView()) {
      return {
        platform: 'android',
        confidence: 'medium',
        detectionMethod: 'asyncBridge without chrome.webview'
      };
    }

    // 5. asyncBridge + chrome.webview (Windows)
    if (this.hasAsyncBridge() && this.hasChromeWebView()) {
      return {
        platform: 'windows',
        confidence: 'high',
        detectionMethod: 'asyncBridge + chrome.webview'
      };
    }

    // 6. chrome.webview only (Windows)
    if (this.hasChromeWebView()) {
      return {
        platform: 'windows',
        confidence: 'medium',
        detectionMethod: 'chrome.webview only'
      };
    }

    // 7. Electron
    if (this.hasElectronAPI()) {
      return {
        platform: 'electron',
        confidence: 'high',
        detectionMethod: 'electronAPI'
      };
    }

    // 8. Web fallback
    return {
      platform: 'web',
      confidence: 'low',
      detectionMethod: 'fallback'
    };
  }

  /**
   * 獲取簡單的平台類型
   */
  getPlatform(): PlatformType {
    return this.detect().platform;
  }

  /**
   * 檢查是否有 Windows.receiveMessage
   */
  private hasWindowsReceiveMessage(): boolean {
    return !!(this.win.Windows?.receiveMessage && 
             typeof this.win.Windows.receiveMessage === 'function');
  }

  /**
   * 檢查是否有 Android 物件
   */
  private hasAndroidObject(): boolean {
    return !!(this.win.Android && (
      typeof this.win.Android.receiveMessage === 'function' ||
      typeof this.win.Android.getStudentList === 'function' ||
      typeof this.win.Android.studentPicked === 'function' ||
      typeof this.win.Android.studentRemoved === 'function'
    ));
  }

  /**
   * 檢查是否有 asyncBridge
   */
  private hasAsyncBridge(): boolean {
    return !!(this.win.asyncBridge && (
      typeof this.win.asyncBridge.getStudentList === 'function' ||
      typeof this.win.asyncBridge.studentPicked === 'function' ||
      typeof this.win.asyncBridge.studentRemoved === 'function'
    ));
  }

  /**
   * 檢查是否有 chrome.webview
   */
  private hasChromeWebView(): boolean {
    return !!(this.win.chrome?.webview?.postMessage && 
             typeof this.win.chrome.webview.postMessage === 'function');
  }

  /**
   * 檢查是否有 Electron API
   */
  private hasElectronAPI(): boolean {
    return !!(this.win.electronAPI && 
             typeof this.win.electronAPI.send === 'function' &&
             typeof this.win.electronAPI.on === 'function');
  }

  /**
   * 檢查 UserAgent 是否為 Android
   */
  private isAndroidUserAgent(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  /**
   * 獲取詳細的平台資訊
   */
  getDetailedInfo(): {
    detection: PlatformDetectionResult;
    capabilities: {
      hasAsyncBridge: boolean;
      hasChromeWebView: boolean;
      hasWindowsAPI: boolean;
      hasAndroidAPI: boolean;
      hasElectronAPI: boolean;
    };
    userAgent: string;
  } {
    return {
      detection: this.detect(),
      capabilities: {
        hasAsyncBridge: this.hasAsyncBridge(),
        hasChromeWebView: this.hasChromeWebView(),
        hasWindowsAPI: this.hasWindowsReceiveMessage(),
        hasAndroidAPI: this.hasAndroidObject(),
        hasElectronAPI: this.hasElectronAPI()
      },
      userAgent: navigator.userAgent
    };
  }
}