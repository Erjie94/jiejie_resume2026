import anime from 'animejs';

/**
 * 作品篩選標籤等微互動
 * @see docs/animation-guide.md
 */
export function initAnime({ reducedMotion = false } = {}) {
  if (reducedMotion) return;

  // 僅做輕量位移回饋，避免 scale 造成相鄰按鈕重疊難點
  const chips = document.querySelectorAll('.tag-chip');
  chips.forEach((chip) => {
    chip.addEventListener('mouseenter', () => {
      anime.remove(chip);
      anime({
        targets: chip,
        translateY: -2,
        duration: 220,
        easing: 'easeOutQuad',
      });
    });
    chip.addEventListener('mouseleave', () => {
      anime.remove(chip);
      anime({
        targets: chip,
        translateY: 0,
        duration: 200,
        easing: 'easeOutQuad',
      });
    });
  });
}
