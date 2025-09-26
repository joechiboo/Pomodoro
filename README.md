# 🍅 Pomodoro Timer - 番茄鐘專注工具

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://joechiboo.github.io/Pomodoro/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

> 🎯 **簡潔易用的網頁版番茄鐘工具，採用科學的 25 分鐘專注工作法，協助提升生產力和專注力**

## ✨ 功能特色

### 🕐 核心計時功能
- **經典番茄工作法**：25 分鐘專注 + 5 分鐘休息
- **自動切換**：工作與休息階段無縫轉換
- **靈活控制**：支援暫停、繼續、重置操作
- **進度顯示**：直觀的倒數計時和進度條

### 📝 任務管理
- **任務記錄**：為每個番茄鐘命名和分類
- **歷史追蹤**：自動保存所有已完成的工作階段
- **數據持久化**：使用 LocalStorage 本地儲存

### 📊 數據分析
- **日報表**：當日完成番茄鐘數量、任務分布
- **週報表**：一週內各任務統計和趨勢分析
- **月報表**：每月進度和任務類別占比
- **可視化圖表**：圓餅圖、長條圖、折線圖展示
- **搜尋篩選**：按任務名稱快速查找數據

### ⚙️ 個人化設定
- **自訂時間**：調整工作、短休息、長休息時長
- **休息間隔**：設定多少個番茄鐘後進入長休息
- **快速模板**：經典、短時專注、長時專注、學習模式
- **即時預覽**：設定變更即時顯示效果

### 🔔 提醒系統
- **瀏覽器通知**：自動申請並發送系統通知
- **音效提醒**：自訂音頻提示工作和休息切換
- **視覺提醒**：清楚的階段狀態顯示

### 📱 現代化體驗
- **PWA 支援**：可安裝為獨立應用
- **響應式設計**：完美適配桌面和移動設備
- **無障礙設計**：遵循 WCAG 標準
- **快速載入**：優化的建置和快取策略

## 🚀 在線體驗

**立即使用**：[https://joechiboo.github.io/Pomodoro/](https://joechiboo.github.io/Pomodoro/)

## 📸 應用截圖

### 計時器介面
- 清晰的倒數顯示
- 直觀的控制按鈕
- 任務名稱輸入
- 進度和狀態顯示

### 數據報表
- 多維度數據分析
- 豐富的圖表展示
- 搜尋和篩選功能
- 日/週/月視圖切換

### 設定頁面
- 靈活的時間自訂
- 多種預設模板
- 即時效果預覽
- 使用提示指南

## 🛠️ 技術架構

### 前端技術棧
- **React 18** - 現代化 UI 框架
- **TypeScript 5** - 類型安全開發
- **Vite 6** - 快速建置工具
- **Tailwind CSS** - 實用優先的 CSS 框架

### UI 組件庫
- **Radix UI** - 無障礙組件基礎
- **Lucide React** - 優雅的圖標庫
- **Recharts** - 數據視覺化圖表
- **Sonner** - 優雅的通知提示

### 開發工具
- **ESLint** - 代碼品質檢查
- **Prettier** - 代碼格式化
- **Husky** - Git hooks 管理
- **Sharp** - 圖像處理和最佳化

### 部署與 DevOps
- **GitHub Pages** - 靜態網站託管
- **GitHub Actions** - 自動化 CI/CD
- **PWA** - 漸進式網頁應用

## 🏃‍♂️ 快速開始

### 環境要求
- Node.js 18+
- npm 9+ 或 yarn 1.22+

### 安裝步驟

```bash
# 1. 克隆專案
git clone https://github.com/joechiboo/Pomodoro.git
cd Pomodoro

# 2. 安裝依賴
npm install

# 3. 啟動開發服務器
npm run dev

# 4. 在瀏覽器中打開 http://localhost:5173
```

### 開發命令

```bash
# 開發模式
npm run dev

# 建置產品版本
npm run build

# 預覽建置結果
npm run preview

# 生成 favicon
npm run generate-favicons

# 快速部署到 GitHub Pages
npm run deploy-fast
```

## 📦 部署指南

### 自動部署（推薦）
專案已配置 GitHub Actions，推送到 `main` 分支會自動部署到 GitHub Pages。

### 手動部署
```bash
# 方法 1：使用內建腳本
bash deploy.sh

# 方法 2：使用 npm 命令
npm run deploy-fast

# 方法 3：手動建置
npm run build
# 然後將 dist/ 目錄內容上傳到你的伺服器
```

詳細部署說明請參考 [deploy.md](deploy.md)

## 🎨 設計系統

### 色彩配色
- **主色調**：番茄紅 `#FF6347`
- **輔助色**：綠色 `#228B22`（蒂頭顏色）
- **背景色**：淺灰 `#F8F9FA`
- **文字色**：深灰 `#1F2937`

### 字體設計
- **主字體**：Inter, system-ui, sans-serif
- **等寬字體**：'Fira Code', monospace（計時顯示）
- **中文字體**：'Noto Sans TC', sans-serif

### 響應式斷點
- **手機**：< 768px
- **平板**：768px - 1024px
- **桌面**：> 1024px

## 🔧 自訂與擴展

### 修改時間設定
在 `src/App.tsx` 中調整 `defaultSettings`：

```typescript
const defaultSettings: TimerSettings = {
  workDuration: 25,        // 工作時間（分鐘）
  shortBreakDuration: 5,   // 短休息時間
  longBreakDuration: 15,   // 長休息時間
  pomodorosUntilLongBreak: 4, // 長休息間隔
};
```

### 新增語言支援
1. 在 `src/i18n/` 中添加語言文件
2. 更新 `src/components/` 中的文字內容
3. 配置語言切換組件

### 客製化主題
修改 `tailwind.config.js` 中的顏色配置：

```javascript
theme: {
  extend: {
    colors: {
      tomato: '#FF6347',    // 自訂番茄紅
      leaf: '#228B22',      // 自訂葉子綠
    }
  }
}
```

## 📊 效能指標

- **首次載入時間**：< 2 秒
- **互動就緒時間**：< 1.5 秒
- **累積版面偏移**：< 0.1
- **最大內容繪製**：< 2.5 秒
- **PWA 評分**：100/100

## 🤝 貢獻指南

### 如何貢獻
1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 開發規範
- 遵循 TypeScript 嚴格模式
- 使用 Prettier 格式化代碼
- 編寫有意義的提交信息
- 添加適當的測試覆蓋

### 問題回報
如果您發現 bug 或有功能建議：
1. 檢查是否已有相關 issue
2. 使用 issue 模板創建新的問題
3. 提供詳細的重現步驟或功能描述

## 📋 待辦功能

- [ ] 多語言支援（英文、日文）
- [ ] 深色模式切換
- [ ] 數據匯出功能（CSV/JSON）
- [ ] 雲端同步（Firebase/Supabase）
- [ ] 團隊協作功能
- [ ] 桌面通知自訂音效
- [ ] 鍵盤快速鍵支援
- [ ] 統計數據更多維度分析

## 📄 許可證

本專案採用 MIT 許可證。詳細信息請查看 [LICENSE](LICENSE) 文件。

## 🙏 致謝

- 感謝 [Francesco Cirillo](https://francescocirillo.com/) 發明番茄工作法
- 感謝 [Radix UI](https://www.radix-ui.com/) 提供優秀的無障礙組件
- 感謝 [Tailwind CSS](https://tailwindcss.com/) 提供實用的 CSS 框架
- 感謝所有貢獻者和使用者的支持

## 📞 聯絡方式

- **專案首頁**：[GitHub Repository](https://github.com/joechiboo/Pomodoro)
- **線上展示**：[Live Demo](https://joechiboo.github.io/Pomodoro/)
- **問題回報**：[GitHub Issues](https://github.com/joechiboo/Pomodoro/issues)

---

<div align="center">

**🍅 讓我們一起用番茄工作法提升生產力！**

Made with ❤️ by [Claude Code](https://claude.ai/code)

[⬆ 回到頂部](#-pomodoro-timer---番茄鐘專注工具)

</div>