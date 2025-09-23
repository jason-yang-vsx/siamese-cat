# Siamese Cat - 轉盤抽選系統

一個為 ClassSwift 設計的轉盤抽選系統前端，支援 WebView 整合多平台（Windows、Android、Web）。

## 技術棧

- **React 18** - 前端框架
- **TypeScript** - 類型安全
- **Vite** - 建置工具和開發伺服器
- **CSS Modules** - 樣式方案
- **PNPM** - 套件管理器
- **ESLint + Prettier** - 程式碼品質工具

## 開發指令

```bash
# 安裝相依套件
pnpm install

# 啟動開發伺服器
pnpm dev

# 建置專案
pnpm build

# 預覽建置結果
pnpm preview

# 程式碼檢查
pnpm lint

# 自動修復 ESLint 錯誤
pnpm lint:fix

# 格式化程式碼
pnpm format

# 檢查程式碼格式
pnpm format:check
```

## 專案架構

```
src/
├─ main.ts                    # 程式進入點
├─ App.tsx                    # 全域樣式與 Providers
├─ assets/                    # 圖片、音效、lottie 檔案
├─ config/                    # 設定檔案
├─ locals/                    # i18n 語系檔案
├─ api/
│  ├─ enums/                  # 列舉、常數、對應表
│  └─ services/               # Bridge 服務與介面
├─ utils/                     # 共用函式
├─ hooks/                     # 自訂 hooks
├─ styles/                    # 樣式檔案（CSS Modules）
├─ layouts/                   # 版型頁面
├─ pages/                     # 功能模組
├─ components/                # 共用元件
└─ services/                  # 非 HTTP 服務（bridge、storage）
```

## 核心特色

- ⚡ **Vite HMR** - 快速開發體驗
- 🎯 **TypeScript Strict** - 完整類型安全
- 📱 **響應式設計** - 支援各種螢幕尺寸
- 🌉 **WebView Bridge** - 原生客戶端整合
- 🎨 **CSS Modules** - 模組化樣式管理
- 🔧 **ESLint + Prettier** - 統一程式碼風格


## 瀏覽器支援

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## 授權

此專案為內部開發專案。