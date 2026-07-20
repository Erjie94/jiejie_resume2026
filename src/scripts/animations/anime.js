import anime from 'animejs';

/**
 * 技能標籤等微互動
 * @see docs/animation-guide.md
 */
export function initAnime({ reducedMotion = false } = {}) {
  if (reducedMotion) return;

  const chips = document.querySelectorAll('.skill-chip');
  chips.forEach((chip) => {
    chip.addEventListener('mouseenter', () => {
      anime.remove(chip);
      anime({
        targets: chip,
        scale: 1.05,
        duration: 280,
        easing: 'easeOutQuad',
      });
    });
    chip.addEventListener('mouseleave', () => {
      anime.remove(chip);
      anime({
        targets: chip,
        scale: 1,
        duration: 220,
        easing: 'easeOutQuad',
      });
    });
  });
}
