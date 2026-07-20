# 履歷內容指南

履歷文字集中在 `src/data/resume.json`，改內容通常不必改動畫程式。

## 欄位說明

```json
{
  "meta": {
    "siteTitle": "瀏覽器分頁標題",
    "lang": "zh-Hant"
  },
  "profile": {
    "name": "顯示姓名",
    "nameEn": "英文名（可選，側欄品牌／頂欄）",
    "avatar": "/assets/images/your-photo.jpg",
    "tagline": "一句話定位（首屏副標）",
    "roles": ["Typed.js 輪播字串 1", "字串 2"],
    "location": "所在地",
    "email": "email@example.com",
    "links": {
      "github": "https://github.com/...",
      "linkedin": "https://...",
      "portfolio": "https://..."
    }
  },
  "about": {
    "paragraphs": ["段落一", "段落二"]
  },
  "skills": [
    { "name": "JavaScript", "level": 90, "group": "language" }
  ],
  "experience": [
    {
      "company": "公司",
      "role": "職稱",
      "period": "2023 — Present",
      "summary": "一句摘要",
      "highlights": ["成果 1", "成果 2"]
    }
  ],
  "projects": [
    {
      "title": "專案名",
      "description": "簡述",
      "tags": ["Vue", "GSAP"],
      "url": "https://...",
      "image": "/assets/images/project-a.webp"
    }
  ],
  "contact": {
    "heading": "聯絡我",
    "message": "歡迎合作與交流"
  }
}
```

## 撰寫建議

- **tagline**：一句話，約 20–40 字，說明你做什麼、給誰價值
- **roles**：3–5 個短職稱／定位，適合打字輪播；避免長句
- **experience.highlights**：用成果導向（數據、範圍、影響），非僅職責列表
- **projects**：優先 3–6 個代表性作品；圖檔放 `public/assets/images/`

## 圖片與 Lottie

| 類型 | 路徑 | 注意 |
|------|------|------|
| 大頭照／專案圖 | `public/assets/images/` | 建議 WebP；控制解析度 |
| Lottie JSON | `public/assets/lottie/` | 在 JSON 或 HTML 以路徑引用 |
| Three 貼圖 | `public/assets/textures/` | 盡量小、可重複貼圖 |

在程式中引用 public 資源時，路徑以 `/assets/...` 開頭（Vite 會從 `public/` 對應）。

## 改內容後的檢查

1. `npm run dev` 確認文字有更新
2. 若區塊高度變化大，捲動動畫可能需微調 `start`／`end`
3. Typed 字串過長時，檢查 Hero 是否換行過猛

## 暫用占位

專案初始化時 `resume.json` 為占位資料，請替換成真實履歷後再對外分享。
