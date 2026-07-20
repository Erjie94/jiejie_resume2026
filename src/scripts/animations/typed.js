import Typed from 'typed.js';

/**
 * Hero 職稱打字效果
 * @see docs/animation-guide.md
 */
export function initTyped({ el, strings = [], reducedMotion = false }) {
  const target = typeof el === 'string' ? document.querySelector(el) : el;
  if (!target || !strings.length) return null;

  if (reducedMotion) {
    target.textContent = strings[0];
    return null;
  }

  return new Typed(target, {
    strings,
    typeSpeed: 48,
    backSpeed: 28,
    backDelay: 1600,
    loop: true,
    smartBackspace: true,
  });
}
