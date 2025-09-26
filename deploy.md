# 🚀 GitHub Pages 部署指南 (優化版)

本指南整合了高效的部署方法和常見問題的解決方案，讓 GitHub Pages 部署變得快速簡單。

## 🎯 快速部署 (推薦)

### 方法一：一鍵腳本部署 ⚡
```bash
# 使用內建的部署腳本 (最快)
bash deploy.sh

# 或者使用 npm 腳本
npm run deploy-fast
```

### 方法二：npm 部署命令
```bash
# 單步驟部署 (建置 + 部署)
npm run deploy-fast

# 或分步驟
npm run build
npm run deploy
```

### 方法三：直接使用 gh-pages
```bash
npx gh-pages -d dist
```

## 📋 完整設定流程

### 1. 初始設定 (一次性)

```bash
# 安裝部署工具
npm install --save-dev gh-pages

# 確保 vite.config.ts 有正確的 base 路徑
# base: '/你的倉庫名稱/',
```

### 2. 確認 package.json 腳本
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist",
    "deploy-fast": "npm run build && gh-pages -d dist"
  }
}
```

### 3. 部署
```bash
npm run deploy-fast
```

完成！🎉

## 🔧 自動化方法比較

| 方法 | 速度 | 複雜度 | 推薦指數 | 說明 |
|------|------|--------|----------|------|
| deploy.sh | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | 一鍵完成，自動處理 git 狀態 |
| npm run deploy-fast | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | 最簡單，兩步合一 |
| GitHub Actions | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 自動但慢，適合 CI/CD |
| 手動 gh-pages | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 靈活但需手動建置 |

## 🚀 GitHub Actions 自動部署

如果你偏好自動部署，創建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
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

    - name: Install and Build
      run: |
        npm ci
        npm run build

    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## ⚠️ 常見問題與解決方案

### 問題 1: 404 錯誤
**原因**: base 路徑設定錯誤
```javascript
// vite.config.ts
export default defineConfig({
  base: '/你的倉庫名稱/', // 必須正確
  // ...
})
```

### 問題 2: CSS/JS 檔案無法載入
**原因**: 資源路徑錯誤
**解決**: 確認 `base` 設定和 GitHub Pages 設定一致

### 問題 3: 部署後頁面空白
**原因**:
1. JavaScript 錯誤
2. 路由設定問題 (React Router)
3. 環境變數問題

**解決**:
```bash
# 本地測試建置版本
npm run build
npx serve dist
```

### 問題 4: gh-pages 權限問題
```bash
# 清除 gh-pages 快取
npx gh-pages --dist dist --dest . --add

# 或重新安裝
npm uninstall gh-pages
npm install --save-dev gh-pages@latest
```

### 問題 5: Git 狀態混亂
```bash
# 重置到乾淨狀態
git stash
git checkout main
git pull origin main
npm run deploy-fast
```

## 📊 效能最佳化建議

### 1. 建置最佳化
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
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

### 2. 減少部署檔案大小
```bash
# 使用 .gitignore 和 .gp-pages-ignore 排除不必要檔案
echo "node_modules/
.env
*.log" > .gp-pages-ignore
```

## 🎯 最佳實踐

### 開發流程
1. **開發**: `npm run dev`
2. **測試建置**: `npm run build && npx serve dist`
3. **部署**: `npm run deploy-fast`
4. **驗證**: 檢查線上版本

### 自動化建議
```bash
# 創建 deployment 別名
echo 'alias deploy="npm run deploy-fast"' >> ~/.bashrc

# 或創建更強大的函數
function quickdeploy() {
    echo "🚀 快速部署中..."
    git add . && git commit -m "${1:-Update project}" && git push
    npm run deploy-fast
}
```

## 📝 部署檢查清單

部署前檢查：
- [ ] `vite.config.ts` 中的 `base` 路徑正確
- [ ] 本地建置測試通過 (`npm run build`)
- [ ] 沒有編譯錯誤
- [ ] Git 狀態乾淨或已提交
- [ ] GitHub Pages 已設定為從 `gh-pages` 分支部署

部署後檢查：
- [ ] 網站可正常載入
- [ ] 所有功能運作正常
- [ ] 響應式設計正確
- [ ] 控制台無錯誤

## 🔧 高級用法

### 多環境部署
```bash
# 部署到不同分支
npx gh-pages -d dist -b gh-pages-staging  # 測試環境
npx gh-pages -d dist -b gh-pages          # 生產環境
```

### 自訂域名
```bash
# 添加 CNAME 檔案
echo "yourdomain.com" > public/CNAME
npm run build
npm run deploy
```

### 條件部署
```bash
# 僅在測試通過後部署
npm test && npm run deploy-fast
```

## 📈 效能監控

```bash
# 部署後測試載入速度
curl -w "@curl-format.txt" -o /dev/null -s "https://yourusername.github.io/Pomodoro/"

# 檢查檔案大小
du -sh dist/
```

## 🆘 緊急修復

### 快速回滾
```bash
# 如果部署有問題，快速回到上一版
git checkout main
git reset --hard HEAD~1
npm run deploy-fast
```

### 完全重置
```bash
# 刪除 gh-pages 分支並重新部署
git push origin --delete gh-pages
npm run deploy-fast
```

---

## 💡 經驗總結

基於這次部署經驗，我們學到：

1. **總是使用工具而非手動操作** - gh-pages 套件比手動管理分支快 10 倍
2. **自動化腳本很重要** - 一個好的部署腳本可以避免 90% 的錯誤
3. **先測試再部署** - 本地 `npm run build && npx serve dist` 可以提前發現問題
4. **保持 Git 狀態乾淨** - 避免在有未提交變更時部署
5. **使用正確的工具** - GitHub Actions 適合 CI/CD，gh-pages 適合快速部署

**推薦工作流程**: 開發 → 本地測試 → `npm run deploy-fast` → 驗證

這樣可以將部署時間從 10+ 分鐘縮短到 30 秒內！🚀