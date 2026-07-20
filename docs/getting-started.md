# 快速上手

完整開啟／建置步驟（含 PowerShell `npm.ps1` 錯誤）請看：

**→ [how-to-run.md](./how-to-run.md)**

---

## 最短路徑

在 Cursor 終端機執行：

```powershell
cd D:\Desktop\jiejie_web
npm.cmd install
npm.cmd run dev
```

瀏覽器開啟：`http://localhost:5173/`

> **禁止**直接雙擊 `index.html`。  
> PowerShell 請用 **`npm.cmd`**，避免「已停用指令碼執行」錯誤。  
> **不需要** Bootstrap。

---

## 你接下來要做的事

1. 編輯 [`src/data/resume.json`](../src/data/resume.json) — 換成真實履歷  
   說明見 [content-guide.md](./content-guide.md)
2. 替換個人照：`profile.avatar`（預設 `/assets/images/avatar.svg`）
3. 替換 `public/assets/` 內圖片與 Lottie
4. 依設計調整 `src/styles/` 與 `src/scripts/`
5. 對照 [checklist.md](./checklist.md) 做上線前檢查

---

## 版面斷點

| 寬度 | 導覽 |
|------|------|
| ≥ 901px | 左側固定 15%（個人照區高 40% + 姓名 + 五個文字選項） |
| ≤ 900px | 頂部功能列 + 右側漢堡手風琴 |

---

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm.cmd install` | 安裝依賴 |
| `npm.cmd run dev` | 開發伺服器 + 熱更新 |
| `npm.cmd run build` | 輸出靜態檔到 `dist/` |
| `npm.cmd run preview` | 預覽建置結果 |

---

## 建議閱讀順序

1. [how-to-run.md](./how-to-run.md) — 操作步驟（必讀）
2. [../README.md](../README.md) — 專案總覽
3. [architecture.md](./architecture.md) — 架構
4. [animation-guide.md](./animation-guide.md) — 動效分工
5. [content-guide.md](./content-guide.md) — 填內容
6. [checklist.md](./checklist.md) — 驗收

全部文件索引：[README.md](./README.md)
