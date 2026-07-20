# 開發與上線檢查清單

操作步驟詳見 [how-to-run.md](./how-to-run.md)。

## 環境

- [ ] 已安裝 Node.js LTS（`node -v`、`npm.cmd -v` 有版本號）
- [ ] 終端機可用 `npm.cmd`（若 `npm` 報「已停用指令碼執行」，改用 `npm.cmd`）
- [ ] `npm.cmd install` 成功
- [ ] `npm.cmd run dev` 可開啟頁面，無主控台致命錯誤
- [ ] 使用 `http://localhost:5173/`（非直接開 `index.html`）
- [ ] 操作步驟已對照 [how-to-run.md](./how-to-run.md)

## 內容

- [ ] `src/data/resume.json` 已換成真實資料
- [ ] 個人照 `profile.avatar` 已替換
- [ ] 連結（Email / GitHub / 作品）可點且正確
- [ ] 圖片與 Lottie 路徑有效，無 404
- [ ] 分頁 `title`、favicon（若有）已設定

## 響應式導覽

- [ ] ≥901px：左側 15% 固定選單；照片區約 40% 且顯示姓名
- [ ] 文字選項 hover：文字色與底色互換
- [ ] ≤900px：頂欄漢堡可展開手風琴選項
- [ ] 手機：下滾頂欄隱藏、上滾再出現
- [ ] Cubic 11 字型有正確套用

## 動態與體驗

- [ ] Hero：Typed 職稱正常；GSAP 進場不遮擋姓名
- [ ] 捲動：各 section 進場流暢，無劇烈跳動
- [ ] 技能／CTA：Anime 或 Mo 回饋不干擾點擊
- [ ] Three：背景不搶字；離開視窗暫停渲染
- [ ] Lottie：進視窗才播；檔案體積可接受
- [ ] `prefers-reduced-motion`：動效有降級

## 響應式內容

- [ ] 手機寬度（約 375px）首屏可讀、CTA 可點
- [ ] 平板與桌面版面無嚴重破版
- [ ] 觸控裝置無依賴 hover 才能取得關鍵資訊

## 效能

- [ ] 正式建置：`npm run build` 成功
- [ ] `npm run preview` 預覽正常
- [ ] 首屏資源精簡；大圖懶載入
- [ ] 行動裝置可接受幀率（必要時關閉 3D）

## 無障礙與品質

- [ ] 標題層級合理（單一 h1）
- [ ] 連結與按鈕有明確可聚焦樣式
- [ ] 對比度足夠閱讀
- [ ] 無主控台 error；必要警告已處理

## 部署

- [ ] 確認託管的 `base` 路徑（子目錄需改 `vite.config.js`）
- [ ] 上傳／連接 `dist/` 或 CI 建置產物
- [ ] 線上再測一次捲動與外連連結
