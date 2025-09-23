/**
 * Platform Types
 * 定義支援的平台類型和相關介面
 */

export type PlatformType = 'windows' | 'android' | 'electron' | 'web';

export interface PlatformInfo {
  type: PlatformType;
  version?: string;
  userAgent: string;
}

/**
 * 平台偵測結果
 */
export interface PlatformDetectionResult {
  platform: PlatformType;
  confidence: 'high' | 'medium' | 'low';
  detectionMethod: string;
}

/**
 * 擴展 Window 物件以支援各平台的 Bridge API
 */
export interface WindowWithBridge extends Window {
  // Windows WebView2 APIs
  Windows?: {
    receiveMessage: (message: string) => void;
  };
  chrome?: {
    webview?: {
      postMessage: (message: any) => void;
      addEventListener?: (event: string, handler: (e: any) => void) => void;
    };
  };

  // Android WebView APIs
  Android?: {
    receiveMessage?: (message: string) => void;
    getStudentList?: () => string;
    studentPicked?: (data: string) => boolean | string;
    studentRemoved?: (data: string) => boolean | string;
  };

  // Shared AsyncBridge API
  asyncBridge?: {
    getStudentList?: () => any;
    studentPicked?: (data?: string) => any;
    studentRemoved?: (data?: string) => any;
    [key: string]: ((data?: string) => any) | undefined;
  };

  // Electron API
  electronAPI?: {
    send: (channel: string, data: any) => void;
    on: (channel: string, callback: (event: any, data: any) => void) => void;
  };
}