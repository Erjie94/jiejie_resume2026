import mojs from '@mojs/core';

/**
 * CTA 點擊爆發特效（重用實例，避免每次 new 造成記憶體累積）
 * @see docs/animation-guide.md
 */
export function initMo({ reducedMotion = false } = {}) {
  if (reducedMotion) return;

  const burst = new mojs.Burst({
    left: 0,
    top: 0,
    radius: { 0: 56 },
    count: 8,
    children: {
      shape: 'circle',
      radius: 5,
      fill: ['#B8E1FF', '#F2DD6E', '#CFF27E', '#FF785A'],
      duration: 700,
      easing: 'quad.out',
    },
  });

  document.querySelectorAll('[data-mo-burst]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + window.scrollX;
      const y = rect.top + rect.height / 2 + window.scrollY;
      burst.tune({ x, y }).replay();
    });
  });
}
