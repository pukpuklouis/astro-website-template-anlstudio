# Astro 網站模板

這是一個基於 Astro 框架的網站模板，可以快速開始你的網站開發。

## 🚀 專案結構

在你的 Astro 專案中，你會看到以下資料夾和檔案：

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

若要了解更多關於 Astro 專案結構的資訊，請參考[專案結構指南](https://docs.astro.build/en/basics/project-structure/)。

## 🧞 指令

所有指令都需要在專案根目錄的終端機中執行：

| 指令                      | 功能                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | 安裝相依套件                                    |
| `bun run dev`             | 啟動本地開發伺服器，網址為 `localhost:4321`     |
| `bun run build`           | 建立生產版本網站到 `./dist/` 資料夾             |
| `bun run preview`         | 在部署前本地預覽建置結果                         |
| `bun run astro ...`       | 執行 CLI 指令，如 `astro add`, `astro check`     |
| `bun run astro -- --help` | 獲取 Astro CLI 的使用說明                       |

## 🔍 如何使用此模板

### 方法一：使用 GitHub 模板

1. 點擊 GitHub 頁面上的 "Use this template" 按鈕
2. 選擇 "Create a new repository"
3. 填寫你的新專案名稱和描述
4. 點擊 "Create repository from template"
5. 將新建立的專案複製到本地：`git clone https://github.com/你的用戶名/你的專案名.git`
6. 進入專案目錄：`cd 你的專案名`
7. 安裝相依套件：`bun install`
8. 啟動開發伺服器：`bun run dev`

### 方法二：直接複製專案

1. 複製此專案到本地：`git clone https://github.com/anlstudio/astro-website-template-anlstudio.git 你的專案名`
2. 進入專案目錄：`cd 你的專案名`
3. 移除原始 Git 歷史：`rm -rf .git`
4. 初始化新的 Git 儲存庫：`git init`
5. 安裝相依套件：`bun install`
6. 啟動開發伺服器：`bun run dev`

開始開發你的網站吧！
