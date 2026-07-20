# 專案健康檢查報告

檢查日期：2026-07-19

## 結論

結構與建置流程可用；先前「字型沒換／手風琴壞掉」主因是 **尚未安裝依賴、也未用 Vite 開發伺服器開啟**（直接開 `index.html` 時 ES module 與絕對路徑會失效）。  
`npm install` + `vite build` 已驗證通過。不需要 Bootstrap。

## 已確認正常

| 項目 | 狀態 |
|------|------|
| `vite build` | 通過 |
| Cubic 11 字型檔（woff2/woff/ttf） | `public/fonts/` 存在並進入 `dist/fonts/` |
| 品牌四色變數 | `variables.css` |
| 側欄 15%／照片區 40%＋姓名 | `main.css` + `index.html` |
| 手機手風琴＋滾動顯隱 | `nav.js` + CSS grid 0fr/1fr |
| 履歷資料注入 | `resume.json` → `render.js` |
| GSAP / Anime / Typed / Mo / Lottie / Three 模組 | 建置可打包 |

## 已在本次修正

1. 安裝 `node_modules`（本機先前缺失）
2. Three / Lottie 改動態 `import()`，降低首屏壓力
3. Mo.js Burst 改重用實例
4. 動畫初始化加 `try/catch`，單一函式庫失敗不拖垮導覽
5. Cubic 11 同時登記 `Cubic11` 與 `Cubic 11` 兩個 family 名稱
6. `.gitignore` 加入 `.tools/`

## 仍須注意

| 問題 | 說明 | 建議 |
|------|------|------|
| 系統未安裝官方 Node/npm | PATH 沒有 `npm` | 安裝 [Node.js LTS](https://nodejs.org/) 後用 `npm run dev` |
| JS 體積偏大 | Three + Lottie 仍重（已動態載入） | 之後可再視需求拆 chunk |
| Lottie `eval` 警告 | 函式庫本身行為 | 可忽略，或改輕量 SVG |
| 履歷仍是占位內容 | `Your Name` 等 | 編輯 `src/data/resume.json` |
| `Cubic-11-main/` | 僅含原始 `.sfd`，執行時不需要 | 可刪或移出專案；實際字型在 `public/fonts/` |
| `@mojs/core` engine 警告 | 套件標 `node ^20`，目前用 v22 | 警告可忽略 |

## 正確啟動方式

完整步驟見 **[how-to-run.md](./how-to-run.md)**。

```powershell
cd D:\Desktop\jiejie_web
npm install
npm run dev
```

- 桌面側欄：視窗寬度 ≥ 901px  
- 手機手風琴：≤ 900px，點右上三線按鈕  
- 勿直接雙擊 `index.html` 用 `file://` 開啟  
- 若 `npm` 無法辨識：先安裝 [Node.js LTS](https://nodejs.org/) 並重開終端機
