# 動畫技術指南

本專案同時使用多套常見前端動效庫。**原則：一場景一主技術**，避免同一元素被兩套庫同時驅動。

## 分工總表

| 技術 | 適合計畫 | 不建議 |
|------|----------|--------|
| **GSAP + ScrollTrigger** | 區塊進場、經歷時間軸、捲動敘事、pin | 單純按鈕 hover（用 CSS） |
| **Anime.js** | 技能條、數字跳動、列表錯開進場、modal | 長距離捲動綁定（交給 GSAP） |
| **Three.js** | Hero／背景輕量 3D、幾何氛圍 | 整頁每個 section 都掛 3D |
| **Lottie** | Logo、空狀態、技能 icon 短循環 | 超大全螢幕複雜動畫（檔案過大） |
| **Typed.js** | Hero 職稱／slogan 輪播 | 內文段落（可讀性差） |
| **Mo.js** | CTA 點擊爆發、成就解鎖感、短暫粒子 | 持續背景粒子（耗電、干擾閱讀） |

## GSAP

**用途：** 捲動驅動的版面敘事、**全頁翻頁**。

### 滾動式翻頁（本專案預設）

- 每個帶 `data-section` 的區塊為一「頁」（Hero／關於／技能／經歷／作品／聯絡）
- 使用 `Observer` 監聽滾輪／觸控，以 `gsap.to` 平移 `.panels-track`
- 側欄與錨點連結透過 `goToSection(id)` 同步翻頁
- 鍵盤：`↑↓`、`PageUp/Down`、`Home/End`、空白鍵
- 單頁內容過長時，先捲完內層再翻頁
- `prefers-reduced-motion`：改為原生捲動 + CSS `scroll-snap`

```js
// 概念：翻到指定頁
goToSection('experience');
```

### 進場動畫

```js
// 概念範例：區塊自下淡入（於進入該頁時播放）
gsap.fromTo(el, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 });
```

**規範：**

- 進入頁面後再 `ScrollTrigger.refresh()`（內容由 JSON 注入時必做）
- Timeline 命名清楚，便於 `reduced-motion` 時 `kill()` 或跳到終態
- 避免對同一 DOM 同時使用 CSS transition 與 GSAP 衝突屬性
- 翻頁期間（`busy`）忽略重複滾輪，避免連跳多頁

## Anime.js

**用途：** 局部、可重複觸發的微互動。

```js
// 概念範例：技能標籤錯開
anime({
  targets: '.skill-chip',
  translateY: [16, 0],
  opacity: [0, 1],
  delay: anime.stagger(60),
  easing: 'easeOutQuad',
  duration: 500,
});
```

**規範：**

- 與 GSAP 區塊錯開：GSAP 負責「進場一次」，Anime 負責「互動再播」
- 動畫結束後如需可重複，明確 `anime.remove` 或使用新實例

## Three.js

**用途：** 氛圍層，不搶主文案。

**規範：**

- Canvas 放在 Hero 或固定背景，`pointer-events: none`（除非互動為設計重點）
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`
- `visibilitychange` / IntersectionObserver：不可見時停止渲染迴圈
- 行動裝置寬度或 `matchMedia` 可改為靜態漸層／圖片降級

## Lottie

**用途：** 設計師輸出的 JSON 向量動畫。

```js
// 概念範例
lottie.loadAnimation({
  container: document.querySelector('#lottie-code'),
  renderer: 'svg',
  loop: true,
  autoplay: false,
  path: '/assets/lottie/code.json',
});
```

**規範：**

- 檔案放 `public/assets/lottie/`
- 預設 `autoplay: false`，進入視窗再 `play()`
- 優先 SVG renderer；複雜場景再評估 canvas
- 單一檔建議控制在合理大小（過多路徑會卡）

## Typed.js

**用途：** Hero 職稱輪播。

```js
new Typed('#typed-role', {
  strings: ['Frontend Engineer', 'Creative Coder', 'UI Animator'],
  typeSpeed: 48,
  backSpeed: 28,
  backDelay: 1600,
  loop: true,
});
```

**規範：**

- `strings` 來自 `resume.json` 的 `roles`
- `reduced-motion` 時改為靜態顯示第一個職稱
- 容器需有最小高度，避免打字時版面跳動

## Mo.js

**用途：** 短促、有「點擊回饋」的爆發感。

**規範：**

- 僅在明確互動（按鈕、技能點）觸發
- 粒子數量克制；結束後銷毀實例，避免記憶體累積
- 勿與 Lottie 同位置疊加過多特效

## 動效節奏建議

| 階段 | 感覺 | 工具 |
|------|------|------|
| 首屏 0–1s | 品牌進場 + 打字 | GSAP 短 timeline + Typed |
| 捲動探索 | 區塊依序揭示 | GSAP ScrollTrigger |
| 停留互動 | 技能／CTA 回饋 | Anime / Mo / Lottie |
| 背景常駐 | 低調 3D 或漸層 | Three（可降級） |

## `prefers-reduced-motion`

當使用者開啟「減少動態效果」：

1. 不初始化 Three.js、Mo.js 粒子
2. Typed 改靜態文字
3. Lottie 顯示第一幀或靜態替代圖
4. GSAP / Anime 可直接設為最終狀態（`opacity: 1` 等）

實作入口在 `src/scripts/main.js` 的 `prefersReducedMotion()`。

## 除錯建議

- GSAP：開啟標記 `ScrollTrigger.defaults({ markers: true })`（僅開發）
- Three：確認 canvas 尺寸與 DPR，避免模糊或過繪
- 效能：Chrome Performance / Layers；目標桌面 60fps、行動可接受掉幀但不可卡死捲動
