import lottie from 'lottie-web';

/**
 * 載入 Lottie；占位 JSON 可換成正式動畫
 * @see docs/animation-guide.md
 */
export function initLottie({ selector, path, reducedMotion = false } = {}) {
  const container = document.querySelector(selector);
  if (!container || !path) return null;

  const anim = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path,
  });

  if (reducedMotion) {
    anim.addEventListener('DOMLoaded', () => {
      anim.goToAndStop(0, true);
    });
    return anim;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) anim.play();
        else anim.pause();
      });
    },
    { threshold: 0.35 },
  );

  io.observe(container);
  return anim;
}
