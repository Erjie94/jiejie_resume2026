export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 行動裝置或省電情境可關閉 Three 等重特效 */
export function canUseHeavyFx() {
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  const saveData = navigator.connection?.saveData;
  const weakDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  return !narrow && !saveData && !weakDevice;
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

/**
 * 正規化 resume 的 picture / image 欄位為可用 URL 陣列
 * 支援：字串、陣列、無副檔名檔名（預設 .jpg）、含副檔名、已含 assets/ 路徑
 */
export function resolveMediaList(value, { defaultExt = '.jpg', folder = 'assets/images' } = {}) {
  if (isEmptyMedia(value)) return [];

  const items = Array.isArray(value) ? value : [value];
  return items
    .filter((item) => !isEmptyMedia(item))
    .map((item) => {
      let name = String(item).trim().replace(/^\//, '');
      if (!name.includes('/')) {
        if (!/\.[a-z0-9]+$/i.test(name)) name = `${name}${defaultExt}`;
        name = `${folder}/${name}`;
      }
      return assetUrl(name);
    });
}

export function isVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url || '');
}
