# Jiejie Resume

純前端個人履歷網站。不依賴後端；開發時以 Vite 提供本地伺服器與模組打包。

## 快速開始

```powershell
npm.cmd install
npm.cmd run dev
```

瀏覽器開啟終端機顯示的本機網址。

> 完整操作說明 → [docs/how-to-run.md](./docs/how-to-run.md)  
> **請勿直接雙擊 `index.html`**。PowerShell 建議使用 `npm.cmd`。

| 指令 | 說明 |
|------|------|
| `npm.cmd install` | 安裝依賴 |
| `npm.cmd run dev` | 開發 |
| `npm.cmd run build` | 建置 |
| `npm.cmd run preview` | 預覽建置結果 |

## 文件

| 文件 | 說明 |
|------|------|
| [docs/how-to-run.md](./docs/how-to-run.md) | 如何在本機開啟 |
| [docs/github-pages.md](./docs/github-pages.md) | GitHub Pages 部署 |
| [docs/project-details.md](./docs/project-details.md) | 技術細節、版面與維護備註（內部參考） |
| [docs/README.md](./docs/README.md) | 其餘文件目錄 |

## 四色

定義於 [`src/styles/variables.css`](./src/styles/variables.css)（`:root` CSS 變數）。

| 色碼 | Token | 用途 |
|------|-------|------|
| `#B8E1FF` | `--brand-sky` | 天空藍／氛圍底 |
| `#F2DD6E` | `--brand-sun` | 暖黃／高光 |
| `#CFF27E` | `--brand-lime` | 萊姆／次要強調 |
| `#FF785A` | `--brand-coral` | 珊瑚／主強調與 CTA |

## 授權

個人履歷專案，內容版權歸作者所有。第三方函式庫依各套件授權。
