# 專案細節（內部參考）

本文件整理自根目錄 README 的詳細說明，供本地開發與維護使用。  
公開倉庫的 [README.md](../README.md) 僅保留對外簡介，避免一次曝光過多實作細節。

---

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

詳細分工見 [animation-guide.md](./animation-guide.md)。

---

## 本地指令（摘要）

> 完整步驟與 Windows 錯誤排除 → [how-to-run.md](./how-to-run.md)  
> **請勿直接雙擊 `index.html`**。在 PowerShell 請用 **`npm.cmd`**。

```powershell
npm.cmd install
npm.cmd run dev
```

瀏覽器開啟終端機顯示的網址（預設 `http://localhost:5173/`）。

| 指令 | 說明 |
|------|------|
| `npm.cmd install` | 安裝依賴 |
| `npm.cmd run dev` | 開發（熱更新） |
| `npm.cmd run build` | 正式建置 → `dist/` |
| `npm.cmd run preview` | 預覽建置結果 |

---

## 目錄結構

```
jiejie_web/
├── docs/                 # 閱讀與操作文件
│   ├── README.md         # 文件目錄
│   ├── how-to-run.md     # 操作步驟
│   └── project-details.md  # 本檔（細節彙整）
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

---

## 文件索引

| 文件 | 說明 |
|------|------|
| [how-to-run.md](./how-to-run.md) | 操作步驟（安裝、啟動、建置、FAQ） |
| [github-pages.md](./github-pages.md) | GitHub Pages 上線 |
| [getting-started.md](./getting-started.md) | 上手導覽與下一步 |
| [content-guide.md](./content-guide.md) | 履歷內容填寫 |
| [architecture.md](./architecture.md) | 架構、模組、載入策略 |
| [animation-guide.md](./animation-guide.md) | 動畫庫使用規範 |
| [checklist.md](./checklist.md) | 開發與上線檢查清單 |
| [audit-report.md](./audit-report.md) | 健康檢查報告 |
| [project-details.md](./project-details.md) | 本檔：細節彙整 |

---

## 品牌色

| 色碼 | Token | 用途 |
|------|-------|------|
| `#B8E1FF` | `--brand-sky` | 氛圍底、冷色面 |
| `#F2DD6E` | `--brand-sun` | 高光、時間標記 |
| `#CFF27E` | `--brand-lime` | 次要 CTA、區塊點綴 |
| `#FF785A` | `--brand-coral` | 主 CTA、強調 |

定義於 `src/styles/variables.css`。

字體漸層尾色（避免在天空藍背景過亮）：

- `--text-grad-end-sky`
- `--text-grad-end-warm`

---

## 字型

全站使用 [俐方體11號／Cubic 11](https://github.com/ACh-K/Cubic-11)（SIL OFL）。  
字型檔位於 `public/fonts/`，授權見同目錄 `OFL-Cubic-11.txt`。

---

## 版面斷點

| 寬度 | 導覽 |
|------|------|
| ≥ 901px | 左側固定 15%（照片區 40% + 姓名 + 文字選項） |
| ≤ 900px | 頂欄 + 漢堡手風琴；下滾隱藏、上滾顯示 |

---

## 設計原則

- **一屏一事**：首屏以品牌／姓名為主視覺，避免儀表板式堆疊。
- **動態服務內容**：動畫強化層級與節奏，不遮擋可讀性。
- **效能優先**：3D 與 Lottie 依可視區域載入；行動裝置可降級。
- **內容與表現分離**：文案放 `src/data/resume.json`，動畫邏輯放 `src/scripts/`。

---

## 瀏覽器支援

現代瀏覽器（Chrome / Firefox / Safari / Edge 近兩個主要版本）。  
需支援 ES modules、CSS 自訂屬性、`IntersectionObserver`。

---

## 部署備註

- GitHub Pages 子路徑需走 `import.meta.env.BASE_URL`（見 `assetUrl()`）。
- 推送 `main` 後由 Actions 自動建置部署；細節見 [github-pages.md](./github-pages.md)。
