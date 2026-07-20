# 操作步驟：如何啟動與建置

本文件記錄本專案從環境安裝到日常開發、建置、預覽的完整操作。  
適用環境：以 **Windows + Cursor 終端機（PowerShell）** 為主，亦適用 macOS／Linux。

---

## 30 秒快速開啟（已裝好 Node 時）

在 Cursor 開啟終端機（`` Ctrl+` ``），於專案目錄執行：

```powershell
cd D:\Desktop\jiejie_web
npm.cmd install
npm.cmd run dev
```

看到類似訊息後，用瀏覽器開啟網址：

```text
VITE v6.x.x  ready
➜  Local:   http://localhost:5173/
```

> **請用 `npm.cmd`，不要只用 `npm`。**  
> 在部分 Windows PowerShell 上，`npm` 會觸發「已停用指令碼執行」錯誤（見下方 FAQ）。

**停止伺服器：** 在該終端機按 `Ctrl + C`。

---

## 0. 重要規則（請先讀）

1. **必須用 Vite 開發伺服器開啟**，不要直接雙擊 `index.html`（`file://`）。  
   否則 ES Module、字型路徑、選單／翻頁腳本都會失效。
2. **不需要 Bootstrap**；選單與手風琴為原生 HTML／CSS／JS。
3. 預設開發網址：`http://localhost:5173/`（若被占用會變成 5174 等，以終端機顯示為準）。

---

## 1. 安裝 Node.js（第一次必做）

### 1-1. 下載安裝

1. 開啟 [https://nodejs.org/](https://nodejs.org/)
2. 下載 **LTS** 版本並安裝
3. 安裝時請勾選／保留 **Add to PATH**
4. **關閉並重新開啟** Cursor（或重開終端機）讓 PATH 生效

### 1-2. 確認安裝成功

```powershell
node -v
npm.cmd -v
```

兩邊都應顯示版本號（例如 `v22.x.x`、`10.x.x`）。

---

## 2. 第一次啟動專案

```powershell
cd D:\Desktop\jiejie_web
npm.cmd install
npm.cmd run dev
```

| 指令 | 用途 |
|------|------|
| `npm.cmd install` | 安裝依賴到 `node_modules/`（第一次或依賴變更後） |
| `npm.cmd run dev` | 開發模式（熱更新） |
| `npm.cmd run build` | 正式打包 → `dist/` |
| `npm.cmd run preview` | 預覽打包結果（需先 build） |

---

## 3. 日常怎麼用（開發流程）

```powershell
cd D:\Desktop\jiejie_web
npm.cmd run dev
```

瀏覽器開啟 `http://localhost:5173/` 後：

1. 改履歷文字 → `src/data/resume.json`（見 [content-guide.md](./content-guide.md)）
2. 改版面／顏色 → `src/styles/`
3. 改選單／翻頁／動效 → `src/scripts/`
4. 存檔後頁面通常會自動更新（HMR）

### 在 Cursor 裡的建議操作順序

1. 用 Cursor 開啟資料夾 `D:\Desktop\jiejie_web`
2. 開啟終端機：選單 **Terminal → New Terminal**，或快捷鍵 `` Ctrl+` ``
3. 確認路徑已在專案根目錄（有 `package.json`）
4. 執行 `npm.cmd run dev`
5. 點終端機裡的 `http://localhost:5173/` 或手動貼到瀏覽器

---

## 4. 正式建置與預覽

```powershell
cd D:\Desktop\jiejie_web
npm.cmd run build
npm.cmd run preview
```

- 產物在 `dist/`，可上傳到 GitHub Pages、Netlify、Vercel 等靜態託管
- 若網站在子路徑（例如 `https://user.github.io/repo/`），請改 `vite.config.js` 的 `base` 為 `'/repo/'`

---

## 5. 如何驗收畫面

| 情境 | 操作 |
|------|------|
| 桌面側欄 | 視窗寬度 **≥ 901px**：左側 15% 固定選單 |
| 手機頂欄／手風琴 | 寬度 **≤ 900px**（或 DevTools 手機模式） |
| GSAP 翻頁 | 滾輪／觸控上下滑，一區一頁 |
| 經歷長文 | 手機上先在頁內捲動看完，再滑動換頁 |
| 字型 | 全站為 Cubic 11 點陣風格 |

---

## 6. 常見問題

### Q1. `因為這個系統上已停用指令碼執行，所以無法載入 npm.ps1`

這是 **PowerShell 執行原則** 擋住 `npm.ps1`，不是專案壞掉。

**解法 A（建議，免改系統設定）：** 一律改用：

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
```

**解法 B：** 改用 **Command Prompt（cmd）** 終端機，再執行一般的 `npm run dev`。

**解法 C（可選）：** 僅對目前使用者放寬本機腳本（自行決定是否執行）：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

之後即可使用 `npm`（仍建議習慣 `npm.cmd` 較穩）。

### Q2. `npm : 無法辨識...` / `node` 找不到

尚未安裝 Node，或 PATH 未生效。依本文件 **§1** 處理，並重開 Cursor。

### Q3. 頁面沒有字型／選單／翻頁沒反應

幾乎都是直接雙擊開了 `index.html`。請改用 `npm.cmd run dev`。

### Q4. `npm install` 很久或失敗

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm.cmd install
```

### Q5. 埠號 5173 被占用

以終端機顯示的 Local URL 為準（可能是 `5174`）。

### Q6. 需要 Bootstrap 嗎？

不需要。

---

## 7. 相關文件

| 文件 | 說明 |
|------|------|
| [getting-started.md](./getting-started.md) | 上手導覽與閱讀順序 |
| [content-guide.md](./content-guide.md) | 履歷內容怎麼填 |
| [architecture.md](./architecture.md) | 架構說明 |
| [animation-guide.md](./animation-guide.md) | 動效技術分工 |
| [checklist.md](./checklist.md) | 開發／上線檢查清單 |
| [../README.md](../README.md) | 專案總覽 |
