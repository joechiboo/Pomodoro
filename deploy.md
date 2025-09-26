# 部署到 GitHub Pages 指南

本文檔說明如何將 Pomodoro Web App 部署到 GitHub Pages。

## 前置準備

1. 確保你的專案已經推送到 GitHub 倉庫
2. 確保專案可以正常建置（`npm run build` 成功）
3. 安裝 Node.js 和 npm

## 方法一：使用 GitHub Actions 自動部署（推薦）

### 1. 設定 Vite 配置

首先，需要修改 `vite.config.ts` 以確保正確的基礎路徑：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/Pomodoro/', // 替換成你的 GitHub 倉庫名稱
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
```

### 2. 創建 GitHub Actions 工作流程

在專案根目錄創建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ] # 或你的默認分支名稱
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 3. 設定 GitHub Pages

1. 進入 GitHub 倉庫設定頁面
2. 滾動到 "Pages" 部分
3. 在 "Source" 下選擇 "Deploy from a branch"
4. 選擇 `gh-pages` 分支和 `/ (root)` 資料夾
5. 點擊 "Save"

### 4. 推送變更

```bash
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

GitHub Actions 會自動執行並部署你的應用到 `https://yourusername.github.io/Pomodoro/`

## 方法二：使用 gh-pages 套件手動部署

### 1. 安裝 gh-pages

```bash
npm install --save-dev gh-pages
```

### 2. 修改 package.json

在 `package.json` 的 `scripts` 部分新增：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### 3. 設定 Vite 配置

同樣需要設定 `vite.config.ts` 中的 `base` 路徑（參考方法一）。

### 4. 部署

```bash
npm run deploy
```

這會建置專案並將 `dist` 資料夾的內容推送到 `gh-pages` 分支。

## 方法三：手動建置與上傳

### 1. 建置專案

```bash
npm run build
```

### 2. 手動創建 gh-pages 分支

```bash
# 建立並切換到 gh-pages 分支
git checkout --orphan gh-pages

# 刪除所有檔案
git rm -rf .

# 複製 dist 內容到根目錄
cp -r dist/* .
cp -r dist/. .

# 新增所有檔案
git add .
git commit -m "Deploy to GitHub Pages"

# 推送到 GitHub
git push origin gh-pages

# 回到主分支
git checkout main
```

## 常見問題與解決方案

### 1. 路徑問題

如果頁面載入但資源無法載入，檢查：
- `vite.config.ts` 中的 `base` 設定是否正確
- 確保路徑使用 `/倉庫名稱/` 格式

### 2. 404 錯誤

確保：
- GitHub Pages 已正確設定
- `gh-pages` 分支存在且包含 `index.html`
- 倉庫是公開的（或你有 GitHub Pro）

### 3. 建置失敗

檢查：
- Node.js 版本相容性
- 依賴套件是否正確安裝
- TypeScript 編譯錯誤

### 4. 自動部署不觸發

確保：
- `.github/workflows/deploy.yml` 路徑正確
- GitHub Actions 已啟用
- 推送到正確的分支

## 驗證部署

部署完成後：
1. 等待 GitHub Actions 完成（約 2-5 分鐘）
2. 前往 `https://yourusername.github.io/Pomodoro/`
3. 測試應用功能是否正常

## 自訂域名（選用）

如果你有自訂域名：
1. 在 `public` 資料夾創建 `CNAME` 檔案
2. 在檔案中寫入你的域名（如：`pomodoro.yourdomain.com`）
3. 在域名供應商設定 CNAME 記錄指向 `yourusername.github.io`

## 更新部署

每次推送到主分支時：
- **方法一**：GitHub Actions 會自動部署
- **方法二**：手動執行 `npm run deploy`
- **方法三**：重複手動建置步驟

## 注意事項

1. **免費限制**：GitHub Pages 免費版有流量和儲存空間限制
2. **HTTPS**：GitHub Pages 預設支援 HTTPS
3. **快取**：GitHub Pages 有 CDN 快取，更新可能需要等待
4. **Private 倉庫**：需要 GitHub Pro 才能從私有倉庫部署

## 效能最佳化

部署前可以考慮：

```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/Pomodoro/',
  build: {
    outDir: 'dist',
    minify: 'terser', // 程式碼壓縮
    sourcemap: false, // 關閉 source map
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-progress'],
          charts: ['recharts']
        }
      }
    }
  }
})
```

這樣可以減小檔案大小並提高載入速度。