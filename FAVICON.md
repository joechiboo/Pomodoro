# 🍅 Favicon 生成指南

本專案包含完整的蕃茄主題 favicon 套件，支援所有現代瀏覽器和設備。

## 📱 生成的檔案

```
public/
├── favicon.svg              # 矢量圖標 (現代瀏覽器)
├── favicon.png              # 標準 favicon (16x16)
├── favicon-16x16.png        # 小尺寸 favicon
├── favicon-32x32.png        # 高清 favicon
├── apple-touch-icon.png     # iOS 設備圖標 (180x180)
├── android-chrome-192x192.png  # Android 圖標
├── android-chrome-512x512.png  # 大尺寸 Android 圖標
└── manifest.json            # PWA 配置文件
```

## 🎨 設計特色

- **蕃茄形狀**: 經典的番茄鐘造型
- **顏色**: 番茄紅 (#FF6347) 配綠色蒂頭 (#228B22)
- **細節**: 包含高光、陰影和葉子裝飾
- **優化**: 針對不同尺寸進行視覺優化

## 🔧 重新生成 Favicon

如果需要修改圖標設計：

### 1. 編輯 SVG 源檔
```bash
# 編輯 public/favicon.svg
```

### 2. 重新生成所有尺寸
```bash
npm run generate-favicons
```

### 3. 手動生成 (如果需要)
```bash
node generate-favicons.js
```

## 📋 瀏覽器支援

| 瀏覽器/設備 | 圖標檔案 | 尺寸 |
|-------------|----------|------|
| Chrome, Firefox, Safari | favicon-32x32.png | 32×32 |
| IE, Edge | favicon.png | 16×16 |
| iOS Safari | apple-touch-icon.png | 180×180 |
| Android Chrome | android-chrome-192x192.png | 192×192 |
| PWA 大圖標 | android-chrome-512x512.png | 512×512 |
| 現代瀏覽器 | favicon.svg | 向量圖 |

## 🛠 技術細節

### HTML 頭部標籤
```html
<!-- 標準 Favicon -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

<!-- SVG Favicon (現代瀏覽器) -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- 備用 Favicon -->
<link rel="shortcut icon" href="/favicon.png">

<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#FF6347">
```

### 自動化腳本
生成腳本使用 Sharp 圖像處理庫：
- 從 SVG 源檔自動生成所有尺寸
- 優化 PNG 壓縮
- 自動創建 PWA manifest
- 支援自訂尺寸和格式

## 🎯 最佳實踐

1. **SVG 優先**: 現代瀏覽器使用 SVG 版本獲得最佳清晰度
2. **多尺寸支援**: 提供多種尺寸確保在所有設備上顯示良好
3. **PWA 就緒**: 包含完整的 PWA manifest 配置
4. **主題色**: 統一使用番茄紅主題色
5. **快取優化**: 所有圖標都有適當的快取標頭

## 📱 PWA 功能

manifest.json 包含：
- 應用名稱和描述
- 圖標配置
- 主題色設定
- 顯示模式配置
- 啟動 URL 設定

## 🔍 測試 Favicon

### 本地測試
```bash
npm run dev
# 訪問 http://localhost:3007/Pomodoro/
```

### 線上測試
```bash
# 檢查圖標載入
curl -I https://yourusername.github.io/Pomodoro/favicon-32x32.png
```

### 瀏覽器測試
1. 檢查瀏覽器標籤頁圖標
2. 檢查書籤圖標
3. iOS: 添加到主畫面測試
4. Android: 安裝 PWA 測試

---

🎉 現在你的蕃茄鐘應用有完美的 favicon 了！