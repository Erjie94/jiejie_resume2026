# Jiejie Resume — 動態前端履歷

純前端（HTML / CSS / JS）個人履歷網站，以動畫與 3D 營造動態感。  
不依賴後端；開發時以 Vite 提供本地伺服器與模組打包。

## 技術棧

| 用途 | 技術 |
|------|------|
| 捲動敘事、時間軸 | [GSAP](https://gsap.com/) + ScrollTrigger |
| 微互動、序列動畫 | [Anime.js](https://animejs.com/) |
| 背景 / Hero 3D | [Three.js](https://threejs.org/) |
| 插畫 / Icon 動效 | [Lottie](https://airbnb.io/lottie/)（lottie-web） |
| 職稱打字效果 | [Typed.js](https://mattboldt.com/demos/typed-js/) |
| 粒子、爆發特效 | [Mo.js](https://mojs.github.io/) |
| 開發與建置 | Vite |

詳細分工見 [docs/animation-guide.md](./docs/animation-guide.md)。

## 快速開始

> 完整說明（含 Windows PowerShell 錯誤排除）→ **[docs/how-to-run.md](./docs/how-to-run.md)**  
> **請勿直接雙擊 `index.html`**。在 PowerShell 請用 **`npm.cmd`**（見下方）。

```powershell
cd D:\Desktop\jiejie_web
npm.cmd install
npm.cmd run dev
```

瀏覽器開啟終端機顯示的網址（預設 `http://localhost:5173/`）。

若出現「已停用指令碼執行／npm.ps1」：繼續用 `npm.cmd`，或改用 cmd 終端機（細節見 [how-to-run.md](./docs/how-to-run.md)）。

| 指令 | 說明 |
|------|------|
| `npm.cmd install` | 安裝依賴 |
| `npm.cmd run dev` | 開發（熱更新） |
| `npm.cmd run build` | 正式建置 → `dist/` |
| `npm.cmd run preview` | 預覽建置結果 |

## 目錄結構

```
jiejie_web/
├── docs/                 # 閱讀與操作文件
│   ├── README.md         # 文件目錄
│   └── how-to-run.md     # 操作步驟（必讀）
├── public/               # 靜態資源（原樣複製到 dist）
│   ├── fonts/            # Cubic 11 字型
│   └── assets/
│       ├── images/
│       ├── lottie/
│       └── textures/
├── src/
│   ├── data/             # 履歷文字（resume.json）
│   ├── styles/           # CSS
│   └── scripts/          # JS 模組
│       ├── animations/
│       └── three/
├── index.html
├── package.json
└── vite.config.js
```

## 文件索引

| 文件 | 說明 |
|------|------|
| [docs/how-to-run.md](./docs/how-to-run.md) | **操作步驟**（安裝、啟動、建置、FAQ） |
| [docs/github-pages.md](./docs/github-pages.md) | **GitHub Pages 上線**（讓網站在 Git 上運作） |
| [docs/README.md](./docs/README.md) | 文件目錄總表 |
| [docs/getting-started.md](./docs/getting-started.md) | 上手導覽與下一步 |
| [docs/content-guide.md](./docs/content-guide.md) | 履歷內容填寫 |
| [docs/architecture.md](./docs/architecture.md) | 架構、模組、載入策略 |
| [docs/animation-guide.md](./docs/animation-guide.md) | 動畫庫使用規範 |
| [docs/checklist.md](./docs/checklist.md) | 開發與上線檢查清單 |
| [docs/audit-report.md](./docs/audit-report.md) | 健康檢查報告 |

## 品牌色

| 色碼 | Token | 用途 |
|------|-------|------|
| `#B8E1FF` | `--brand-sky` | 氛圍底、冷色面 |
| `#F2DD6E` | `--brand-sun` | 高光、時間標記 |
| `#CFF27E` | `--brand-lime` | 次要 CTA、區塊點綴 |
| `#FF785A` | `--brand-coral` | 主 CTA、強調 |

定義於 `src/styles/variables.css`。

## 字型

全站使用 [俐方體11號／Cubic 11](https://github.com/ACh-K/Cubic-11)（SIL OFL）。  
字型檔位於 `public/fonts/`，授權見同目錄 `OFL-Cubic-11.txt`。

## 版面斷點（摘要）

| 寬度 | 導覽 |
|------|------|
| ≥ 901px | 左側固定 15%（照片區 40% + 姓名 + 文字選項） |
| ≤ 900px | 頂欄 + 漢堡手風琴；下滾隱藏、上滾顯示 |

## 設計原則（摘要）

- **一屏一事**：首屏以品牌／姓名為主視覺，避免儀表板式堆疊。
- **動態服務內容**：動畫強化層級與節奏，不遮擋可讀性。
- **效能優先**：3D 與 Lottie 依可視區域載入；行動裝置可降級。
- **內容與表現分離**：文案放 `src/data/resume.json`，動畫邏輯放 `src/scripts/`。

## 瀏覽器支援

現代瀏覽器（Chrome / Firefox / Safari / Edge 近兩個主要版本）。  
需支援 ES modules、CSS 自訂屬性、`IntersectionObserver`。

## 授權

個人履歷專案，內容版權歸作者所有。第三方函式庫依各套件授權。
