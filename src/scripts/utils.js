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
