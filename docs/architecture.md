# 架構說明

## 目標

以**靜態前端**呈現一份可互動、有動態感的履歷。  
建置產物為純靜態檔（HTML / CSS / JS / 資產），可部署至 GitHub Pages、Netlify、Vercel 等。

## 分層

```
┌─────────────────────────────────────┐
│  index.html（結構與區塊標記）         │
├─────────────────────────────────────┤
│  styles/（版面、主題變數、響應式）     │
├─────────────────────────────────────┤
│  data/resume.json（履歷內容）         │
├─────────────────────────────────────┤
│  scripts/main.js（啟動與協調）        │
│    ├─ animations/*（2D 動效）         │
│    └─ three/*（3D 場景）              │
├─────────────────────────────────────┤
│  public/assets（圖片、Lottie、貼圖）  │
└─────────────────────────────────────┘
```

### 1. 結構層（HTML）

- 語意標籤：`header` / `main` / `section` / `footer`
- 各區塊以穩定 `id` 或 `data-section` 供動畫掛載
- 避免在 HTML 內寫死長文案；優先由 `resume.json` 注入（或開發初期先寫靜態，再抽離）

建議區塊順序：

1. `hero` — 姓名、一句話定位、Typed 職稱、CTA
2. `about` — 簡介
3. `skills` — 技能（可搭配 Lottie / Mo.js）
4. `experience` — 經歷時間軸（GSAP ScrollTrigger）
5. `projects` — 作品
6. `contact` — 聯絡方式

### 2. 樣式層（CSS）

- `variables.css`：色彩、字級、間距、動效時長 token
- `reset.css`：最小重置
- `main.css`：版面與區塊樣式
- 動畫「補間」盡量交給 JS 庫；CSS 負責 hover 微狀態與 `prefers-reduced-motion` 降級

### 3. 資料層（JSON）

`src/data/resume.json` 為單一真相來源：姓名、職稱列表、經歷、技能、連結。  
`main.js` 載入後渲染文字節點，再初始化動畫，避免動畫綁到空節點。

### 4. 行為層（JS）

| 模組 | 職責 |
|------|------|
| `main.js` | 啟動順序、全域事件、reduced-motion 偵測 |
| `animations/gsap.js` | 捲動進場、時間軸、pin / scrub |
| `animations/anime.js` | 按鈕、卡片、數字等微互動 |
| `animations/typed.js` | Hero 打字循環 |
| `animations/lottie.js` | 載入並播放 Lottie JSON |
| `animations/mo.js` | 點擊爆發、技能點擊反饋 |
| `three/scene.js` | 背景或 Hero 輕量 3D |

**啟動順序建議：**

1. 讀取 `prefers-reduced-motion`
2. 載入並渲染 `resume.json`
3. 初始化 Typed / 輕量動效
4. 註冊 GSAP ScrollTrigger（依 section）
5. 延遲或 IntersectionObserver 後再啟動 Three.js / 重 Lottie

## 建置與部署

- **開發**：`vite` 提供 ESM、HMR
- **建置**：`vite build` 輸出 `dist/`
- **部署**：將 `dist/` 上傳至靜態託管；`base` 若為子路徑需改 `vite.config.js` 的 `base`

純 CDN、無建置亦可運行，但本專案預設走 Vite，以便：

- 以 npm 鎖定函式庫版本
- 模組化拆分 JS
- 正式環境壓縮與雜湊檔名

## 效能策略

- Three.js：限制像素比、簡化幾何、離開視窗時暫停 `requestAnimationFrame`
- Lottie：僅可見時播放；小圖示優先靜態 SVG
- GSAP：同一頁避免過多同時 scrub；批次使用 timeline
- 圖片：適當尺寸、現代格式（WebP）、懶載入
- 行動裝置：可關閉或簡化 3D（見 `main.js` 的 `canUseHeavyFx()`）

## 無障礙

- 尊重 `prefers-reduced-motion: reduce`：關閉自動播放、粒子、3D，保留淡入或直接顯示
- 互動元素可鍵盤操作；對比度符合可讀性
- 動畫不得造成無法閱讀或無法點擊

## 擴充邊界

- **不做**：後端 API、帳號系統、CMS（除非另開專案）
- **可做**：多語系 JSON、列印樣式、PDF 下載連結、暗色主題（若設計允許）
