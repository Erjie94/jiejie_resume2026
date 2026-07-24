/**
 * 圖片點擊放大預覽（原圖 contain）
 * 觸發：元素帶 data-lightbox-src
 */
let inited = false;

export function initLightbox({ root = document } = {}) {
  let overlay = document.querySelector('[data-lightbox-root]');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.dataset.lightboxRoot = '';
    overlay.hidden = true;
    overlay.innerHTML = `
      <button type="button" class="lightbox__backdrop" aria-label="關閉預覽" data-lightbox-close></button>
      <figure class="lightbox__figure">
        <img class="lightbox__img" alt="" data-lightbox-img />
        <button type="button" class="lightbox__close" aria-label="關閉" data-lightbox-close>×</button>
      </figure>
    `;
    document.body.appendChild(overlay);
  }

  const imgEl = overlay.querySelector('[data-lightbox-img]');

  function open(src, alt = '') {
    if (!src || !imgEl) return;
    imgEl.src = src;
    imgEl.alt = alt || '預覽圖片';
    overlay.hidden = false;
    document.body.classList.add('is-lightbox-open');
    // 手機 focus 關閉鈕可能造成視窗偏移，僅桌面自動聚焦
    if (window.matchMedia('(min-width: 901px)').matches) {
      overlay.querySelector('.lightbox__close')?.focus({ preventScroll: true });
    }
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('is-lightbox-open');
    if (imgEl) imgEl.removeAttribute('src');
  }

  if (inited) return { open, close };
  inited = true;

  // 委派到 document，之後動態插入的經歷圖也能用
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lightbox-src]');
    if (!trigger) return;

    const src = trigger.getAttribute('data-lightbox-src');
    if (!src) return;

    e.preventDefault();
    e.stopPropagation();
    open(src, trigger.getAttribute('data-lightbox-alt') || '');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target.closest('[data-lightbox-close]')) close();
  });

  overlay.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    { passive: false },
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { open, close };
}
