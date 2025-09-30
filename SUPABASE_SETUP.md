# Supabase 設定指南

本指南將協助你設定 Supabase 資料庫和認證功能。

## 步驟 1：建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com)
2. 點擊 "Start your project"
3. 登入或註冊帳號
4. 建立新專案：
   - 輸入專案名稱（例如：pomodoro-app）
   - 設定資料庫密碼（請記住這個密碼）
   - 選擇地區（建議選擇距離你最近的地區）
5. 等待專案建立完成（約 2 分鐘）

## 步驟 2：取得 API 金鑰

1. 在專案 Dashboard 中，點擊左側選單的 **Settings**
2. 點擊 **API**
3. 複製以下資訊：
   - **Project URL**（專案 URL）
   - **anon public** key（匿名公開金鑰）

## 步驟 3：設定環境變數

1. 在專案根目錄建立 `.env` 檔案（複製 `.env.example`）
2. 填入你的 Supabase 資訊：

```env
VITE_SUPABASE_URL=你的_supabase_專案_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

**重要：** `.env` 檔案已加入 `.gitignore`，不會被提交到 Git。

## 步驟 4：建立資料庫結構

1. 在 Supabase Dashboard 中，點擊左側選單的 **SQL Editor**
2. 點擊 **New query**
3. 複製 `supabase-schema.sql` 檔案的全部內容
4. 貼到 SQL Editor 中
5. 點擊 **Run** 執行腳本

這將建立：
- `pomodoro_sessions` 資料表：儲存番茄鐘記錄
- `user_settings` 資料表：儲存使用者設定
- Row Level Security (RLS) 政策：確保資料安全

## 步驟 5：設定第三方登入（選用但建議）

### 設定 Google OAuth（免費）

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 前往 **APIs & Services** > **Credentials**
4. 點擊 **Create Credentials** > **OAuth 2.0 Client ID**
5. 如果是第一次建立，需要先設定 **OAuth consent screen**：
   - 選擇 **External**（外部）
   - 填寫應用程式名稱（例如：Pomodoro Timer）
   - 填寫使用者支援電子郵件
   - 儲存並繼續
6. 回到 **Credentials**，點擊 **Create Credentials** > **OAuth 2.0 Client ID**
7. 應用程式類型選擇 **Web application**（網頁應用程式）
8. 在 **Name**（名稱）輸入：`Pomodoro Web Client`
9. 點擊 **Create**（建立）後，先記下 **Client ID** 和 **Client Secret**
10. **重要：編輯 OAuth Client 加入 Redirect URIs**
    - 在 Credentials 頁面，找到剛建立的 OAuth 2.0 Client
    - 點擊右側的**編輯圖示**（鉛筆圖示）
    - 向下捲動找到 **Authorized redirect URIs**（已授權的重新導向 URI）區塊
    - 點擊 **+ ADD URI** 按鈕
    - 輸入：`https://thgtezpxlnznrdyoxflf.supabase.co/auth/v1/callback`
    - 如果要本地測試，再點 **+ ADD URI** 加入：`http://localhost:5173`
    - 點擊 **SAVE**（儲存）
12. 在 Supabase Dashboard 中：
    - 前往 **Authentication** > **Providers**
    - 找到 **Google** 並啟用
    - 貼上 **Client ID** 和 **Client Secret**
    - 儲存

**注意：** Google OAuth 完全免費，不需要啟用任何付費 API。

### 設定 Facebook OAuth

1. 前往 [Facebook Developers](https://developers.facebook.com/)
2. 點擊 **My Apps** > **Create App**
3. 選擇 **Consumer**（消費者）類型
4. 填寫應用程式名稱和聯絡電子郵件
5. 建立完成後，在左側選單找到 **Add Products**
6. 找到 **Facebook Login**，點擊 **Set Up**
7. 選擇 **Web** 平台
8. 設定 Facebook Login：
   - 前往 **Facebook Login** > **Settings**
   - 在 **Valid OAuth Redirect URIs** 加入：
     ```
     https://thgtezpxlnznrdyoxflf.supabase.co/auth/v1/callback
     ```
   - 在 **Client OAuth Settings** 區塊：
     - 啟用 **Client OAuth Login**
     - 啟用 **Web OAuth Login**
   - 儲存變更
9. **重要：切換到開發模式（Development Mode）**
   - 在頁面頂部，你會看到應用程式狀態
   - 確保應用程式處於 **Development** 模式（測試用）
   - 在開發模式下，不需要審核就能使用 email 權限
10. 新增測試使用者（重要）：
    - 前往左側選單 **Roles** > **Test Users**
    - 點擊 **Add** 建立測試使用者
    - 或在 **Roles** > **Roles** 中將你的 Facebook 帳號加為開發者/測試者
11. 取得憑證：
    - 前往 **Settings** > **Basic**
    - 複製 **App ID** 和 **App Secret**（點擊 Show 顯示）
12. 在 Supabase Dashboard 中：
    - 前往 **Authentication** > **Providers**
    - 找到 **Facebook** 並啟用
    - 貼上 **App ID**（作為 Client ID）和 **App Secret**（作為 Client Secret）
    - 儲存

**重要提醒：**
- 開發模式下，只有測試使用者、開發者、管理員可以登入
- 要讓一般使用者登入，需要將 App 切換到 **Live Mode**，這需要通過 Facebook 審核
- 審核前，建議先用測試帳號測試功能

### 本地開發設定

如果要在本地測試 OAuth（`http://localhost:5173`），需要在各 OAuth 提供商的設定中額外加入：
```
http://localhost:5173
```

## 步驟 6：設定 Site URL 和 Redirect URLs（重要）

這步驟很重要，否則 OAuth 登入後會跳轉到錯誤的網址：

1. 前往 **Authentication** > **URL Configuration**
2. 設定 **Site URL**：
   - 本地開發：`http://localhost:5173`
   - 生產環境：`https://joechiboo.github.io/Pomodoro`
3. 設定 **Redirect URLs**（加入以下兩個）：
   - `http://localhost:5173/**`（本地開發）
   - `https://joechiboo.github.io/Pomodoro/**`（生產環境）
4. 儲存

**注意：** Site URL 要根據你目前的環境切換（開發時用 localhost，部署後用 GitHub Pages 網址）

## 步驟 7：設定電子郵件認證（選用）

預設情況下，Supabase 要求使用者驗證電子郵件。如果你想要在開發時關閉：

1. 前往 **Authentication** > **Settings**
2. 找到 **Email Auth**
3. 關閉 **Enable email confirmations**

**注意：** 生產環境建議啟用電子郵件驗證。

## 步驟 8：設定 GitHub Secrets（用於部署）

如果你要部署到 GitHub Pages，需要設定環境變數：

1. 前往你的 GitHub 專案頁面
2. 點擊 **Settings** > **Secrets and variables** > **Actions**
3. 點擊 **New repository secret**
4. 分別新增兩個 secrets：
   - **Name:** `VITE_SUPABASE_URL`
     - **Value:** `https://thgtezpxlnznrdyoxflf.supabase.co`
   - **Name:** `VITE_SUPABASE_ANON_KEY`
     - **Value:** `你的_supabase_anon_key`

**重要：** 這樣部署時才能正確載入 Supabase 設定。

## 步驟 9：測試連線

1. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 開啟瀏覽器訪問應用程式
3. 嘗試註冊新帳號
4. 登入並使用番茄鐘功能
5. 檢查 Supabase Dashboard 的 **Table Editor**，確認資料有正確儲存

## 功能說明

### 會員系統
- ✅ 電子郵件註冊/登入
- ✅ Google OAuth 登入
- ✅ Facebook OAuth 登入
- ✅ 略過登入，離線使用
- ✅ 登出功能
- ✅ 自動同步資料到雲端

### 資料同步
- ✅ 登入後自動載入雲端資料
- ✅ 即時同步番茄鐘記錄
- ✅ 同步使用者設定
- ✅ 未登入時使用 localStorage

### 安全性
- ✅ Row Level Security (RLS)：使用者只能存取自己的資料
- ✅ API 金鑰保護：anon key 僅能執行允許的操作
- ✅ 密碼加密：Supabase 自動處理

## 疑難排解

### 無法連線到 Supabase
- 檢查 `.env` 檔案是否存在且格式正確
- 確認專案 URL 和 API 金鑰是否正確
- 重新啟動開發伺服器

### 註冊後無法登入
- 檢查是否需要驗證電子郵件
- 查看 Supabase Dashboard 的 **Authentication** > **Users** 確認帳號狀態

### 資料沒有同步
- 開啟瀏覽器開發者工具查看 Console 錯誤訊息
- 確認資料庫結構是否正確建立
- 檢查 RLS 政策是否正確設定

## 更多資源

- [Supabase 官方文件](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)