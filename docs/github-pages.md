# GitHub Pages 部署指南

讓履歷網站在 GitHub 上公開運作（免費靜態託管）。

**你的 repo：** [Erjie94/jiejie_resume2026](https://github.com/Erjie94/jiejie_resume2026)  
**上線網址（部署完成後）：** https://erjie94.github.io/jiejie_resume2026/

---

## 原理

| 用途 | 說明 |
|------|------|
| **GitHub 存程式碼** | `main` 分支放原始碼 |
| **GitHub Actions** | 每次 push 自動 `npm ci` + `npm run build` |
| **GitHub Pages** | 把 `dist/` 發布成可瀏覽的網站 |

本地開發仍用 `npm.cmd run dev`；**不要**手動上傳 `dist/`。

---

## 第一次設定（只需做一次）

### 1. 確認程式碼已 push

```powershell
cd D:\Desktop\jiejie_web
git push origin main
```

### 2. 在 GitHub 開啟 Pages

1. 開啟 https://github.com/Erjie94/jiejie_resume2026/settings/pages
2. **Build and deployment → Source** 選 **GitHub Actions**（不要選 Deploy from a branch）
3. 儲存

### 3. 推送含 workflow 的更新

專案已含 `.github/workflows/deploy.yml`。推送後 Actions 會自動跑：

```powershell
git add .
git commit -m "Add GitHub Pages deploy workflow"
git push origin main
```

### 4. 查看部署狀態

1. 開啟 https://github.com/Erjie94/jiejie_resume2026/actions
2. 等 **Deploy to GitHub Pages** 出現綠勾 ✓
3. 開啟 https://erjie94.github.io/jiejie_resume2026/

首次部署可能需 1～3 分鐘。

---

## 之後怎麼更新網站

改完程式或 `resume.json` 後：

```powershell
git add .
git commit -m "更新履歷內容"
git push origin main
```

Push 後 Actions 會自動重新建置、發布，無需手動上傳。

---

## 本地 vs 線上

| 環境 | 指令 | 網址 |
|------|------|------|
| 本地開發 | `npm.cmd run dev` | http://localhost:5173/ |
| 本地預覽 Pages 路徑 | `$env:GITHUB_PAGES='true'; npm.cmd run build; npm.cmd run preview` | 終端機顯示的網址 |
| 正式上線 | push 到 `main`（自動） | https://erjie94.github.io/jiejie_resume2026/ |

`vite.config.js` 會在 `GITHUB_PAGES=true` 時把 `base` 設為 `/jiejie_resume2026/`，避免子路徑下資源 404。

---

## 常見問題

### 網站空白或字型／圖片 404

- 確認 Pages Source 是 **GitHub Actions**
- 確認 `vite.config.js` 的 `repoBase` 與 repo 名稱一致（`jiejie_resume2026`）
- 靜態資源路徑請用 `assets/...`（不要寫死 `/assets/...`），程式會透過 `assetUrl()` 加上 GitHub Pages 子路徑
- 若改 repo 名稱，需同步改 `repoBase` 與 workflow

### Actions 失敗

到 **Actions** 分頁點進失敗的 job 看 log，常見原因：

- `npm ci` 失敗 → 確認 `package-lock.json` 有 commit
- 權限 → Settings → Actions → General → Workflow permissions 設 **Read and write**

### 403 push 失敗

用 **Erjie94** 帳號登入，勿用其他 GitHub 帳號的憑證（見 [how-to-run.md](./how-to-run.md) FAQ）。

---

## 相關文件

- [how-to-run.md](./how-to-run.md) — 本地啟動
- [checklist.md](./checklist.md) — 上線前檢查
