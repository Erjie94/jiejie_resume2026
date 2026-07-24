export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 僅行動裝置關閉 Three 等重特效（對齊站內 ≤900px 斷點） */
export function canUseHeavyFx() {
  return !window.matchMedia('(max-width: 900px)').matches;
}

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return [...scope.querySelectorAll(selector)];
}

/** public/ 靜態資源路徑（本地與 GitHub Pages 子路徑皆適用） */
export function assetUrl(path) {
  if (!path) return '';
  const base = import.meta.env.BASE_URL || '/';
  const clean = String(path).replace(/^\//, '');
  return `${base}${clean}`;
}

/** 是否為空媒體欄位（含字串 "null"） */
export function isEmptyMedia(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  const s = String(value).trim();
  return !s || s.toLowerCase() === 'null';
}

const HAS_EXT_RE = /\.[a-z0-9]+$/i;
/** 無副檔名時依序嘗試的影像／影片副檔名 */
const MEDIA_PROBE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.mp4', '.webm', '.ogg'];
const mediaUrlCache = new Map();

function normalizeMediaStem(item, folder = 'assets/images') {
  let name = String(item).trim().replace(/^\//, '');
  if (!name.includes('/')) name = `${folder}/${name}`;
  return name;
}

/**
 * 正規化 resume 的 picture / image 欄位
 * 有副檔名：直接回傳 url；無副檔名：留 stem 供後續自動探測（jpg / png / …）
 */
export function resolveMediaItems(value, { folder = 'assets/images' } = {}) {
  if (isEmptyMedia(value)) return [];

  const items = Array.isArray(value) ? value : [value];
  return items
    .filter((item) => !isEmptyMedia(item))
    .map((item) => {
      const raw = String(item).trim();
      const hasExt = HAS_EXT_RE.test(raw);
      const stem = normalizeMediaStem(item, folder);
      return {
        stem: hasExt ? null : stem,
        url: hasExt ? assetUrl(stem) : null,
      };
    });
}

function probeImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    const done = (ok) => {
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = url;
  });
}

async function probeMediaUrl(url) {
  if (isVideoUrl(url)) {
    try {
      const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
      return res.ok;
    } catch {
      return false;
    }
  }
  return probeImageUrl(url);
}

/** 無副檔名時依序實際載入探測（不用 HEAD，避免伺服器回 405 誤判） */
export async function resolveMediaUrl(stem, { folder = 'assets/images' } = {}) {
  const key = stem.includes('/') ? stem : `${folder}/${stem}`;
  if (mediaUrlCache.has(key)) return mediaUrlCache.get(key);

  let url;
  if (HAS_EXT_RE.test(stem)) {
    url = assetUrl(stem.includes('/') ? stem : `${folder}/${stem}`);
  } else {
    const base = stem.includes('/') ? stem : `${folder}/${stem}`;
    url = null;
    for (const ext of MEDIA_PROBE_EXTS) {
      const candidate = assetUrl(`${base}${ext}`);
      // eslint-disable-next-line no-await-in-loop
      if (await probeMediaUrl(candidate)) {
        url = candidate;
        break;
      }
    }
    if (!url) url = assetUrl(`${base}.jpg`);
  }

  mediaUrlCache.set(key, url);
  return url;
}

/** 解析為含 url 的項目（無副檔名會先探測） */
export async function resolveMediaItemsAsync(value, options = {}) {
  const items = resolveMediaItems(value, options);
  return Promise.all(
    items.map(async (item) => ({
      url: item.url ?? (await resolveMediaUrl(item.stem, options)),
    })),
  );
}

/** 啟動時預先解析 resume 內所有媒體，避免畫面先破圖再替換 */
export async function prewarmMediaFromResume(data) {
  const fields = [];
  (data.experience || []).forEach((entry) => fields.push(entry.picture));
  (data.projects || []).forEach((entry) => fields.push(entry.image));

  const stems = new Set();
  fields.forEach((field) => {
    resolveMediaItems(field).forEach((item) => {
      if (item.stem) stems.add(item.stem);
    });
  });

  await Promise.all([...stems].map((stem) => resolveMediaUrl(stem)));
}

/**
 * 將 resolveMediaItems 結果解析為 URL 陣列（含自動副檔名探測）
 */
export async function resolveMediaListAsync(value, options = {}) {
  const items = await resolveMediaItemsAsync(value, options);
  return items.map((item) => item.url);
}

export function isVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url || '');
}
