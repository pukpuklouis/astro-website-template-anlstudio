# Astro Better Auth 設定指南

本指南說明如何在此 Astro 網站模板中使用與 Cloudflare D1 整合的 Better Auth 認證系統。

## 概述

此模板包含完整的認證系統，具有：

- 使用者註冊和登入
- 受保護的路由
- 會話管理
- TypeScript 類型安全
- Cloudflare D1 資料庫整合

## 設定步驟

### 1. 設定 Cloudflare D1 資料庫

首先，使用 Wrangler CLI 創建 D1 資料庫：

```bash
wrangler d1 create auth_db
```

使用您的資料庫 ID 更新 `wrangler.jsonc` 檔案：

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "auth_db",
    "database_id": "您的資料庫ID"
  }
]
```

### 2. 設定環境變數

認證系統需要一個密鑰來進行安全操作。基於安全考量，我們不直接將此密鑰存儲在 `wrangler.jsonc` 檔案中。

#### 本地開發環境：

在專案根目錄創建一個 `.dev.vars` 檔案（此檔案應該在 .gitignore 中）：

```
AUTH_SECRET=您的長安全隨機字串
```

#### 生產環境：

使用 Wrangler CLI 設定密鑰：

```bash
wrangler secret put AUTH_SECRET
```

對於生產環境，請使用至少 32 個字符長的強隨機生成字串。

### 3. 初始化資料庫結構

認證系統的結構定義在 `schema.sql` 中。將其應用到您的 D1 資料庫：

```bash
bun run db:setup
```

此命令將創建使用者、帳戶、會話和驗證令牌所需的表格。

### 4. 啟動開發伺服器

```bash
bun run dev
```

## 使用認證功能

### 受保護的路由

要創建需要認證的受保護路由：

```astro
---
// src/pages/dashboard.astro
import Layout from '../layouts/Layout.astro';
import { UserProfile } from '../components/auth/UserProfile.astro';

// 將未認證的使用者重定向到登入頁面
if (!Astro.locals.user) {
  return Astro.redirect('/login');
}

const user = Astro.locals.user;
---

<Layout title="儀表板">
  <h1>儀表板</h1>
  <p>歡迎，{user.name}！</p>
  <UserProfile />
</Layout>
```

### 訪問使用者資料

當前使用者可在 `Astro.locals.user` 中獲取：

```astro
---
const { user } = Astro.locals;
---

{user ? (
  <p>歡迎回來，{user.name}！</p>
) : (
  <p>請<a href="/login">登入</a>以繼續。</p>
)}
```

### 認證元件

模板包含即用型認證元件：

- `LoginForm.astro` - 用於使用者登入
- `RegisterForm.astro` - 用於使用者註冊
- `UserProfile.astro` - 顯示使用者資訊和登出按鈕

使用範例：

```astro
---
import Layout from '../layouts/Layout.astro';
import LoginForm from '../components/auth/LoginForm.astro';
---

<Layout title="登入">
  <h1>登入</h1>
  <LoginForm />
  <p>沒有帳戶？<a href="/register">註冊</a></p>
</Layout>
```

### 登出

要登出使用者，向認證 API 提交 POST 請求：

```html
<form action="/api/auth/signout" method="post">
  <button type="submit">登出</button>
</form>
```

## 類型安全

認證系統完全使用 TypeScript 進行類型化。主要類型定義在 `src/types.ts` 中：

- `User` - 使用者資料結構
- `Session` - 會話資料結構
- `Account` - 帳戶資料結構

使用這些類型處理認證資料：

```typescript
import type { User } from '../types';

const user = Astro.locals.user as User;
```

## 自定義

### 認證配置

認證系統在 `src/lib/auth.ts` 中配置。您可以修改此檔案以：

- 更改會話持續時間
- 添加額外的認證提供者
- 自定義使用者資料處理

### 資料庫結構

如果您需要修改資料庫結構，請編輯 `schema.sql` 檔案並重新運行設定命令。

## 部署

當部署到 Cloudflare Pages 時，請確保：

1. 設定 `AUTH_SECRET` 環境變數
2. 將您的 D1 資料庫綁定到您的應用程式
3. 使用 `wrangler deploy` 部署您的應用程式

## 故障排除

- **資料庫連接問題**：確保您的 D1 資料庫 ID 在 `wrangler.jsonc` 中正確設定
- **認證錯誤**：檢查 `AUTH_SECRET` 是否正確配置
- **類型錯誤**：確保您正確使用 `src/types.ts` 中的類型導入

## 驗證設定

您可以使用以下命令驗證 Better Auth 設定是否正確：

```bash
bun run auth:verify
```

此命令將檢查所有必要的檔案和配置，並提供下一步操作的指導。
