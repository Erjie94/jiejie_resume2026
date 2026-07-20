/**
 * 手機選單手風琴 + 滾動方向顯示／隱藏頂欄
 * 可選：接上 GSAP 翻頁 goToSection
 */

const MOBILE_MQ = '(max-width: 900px)';

export function initNav({ goToSection } = {}) {
  const header = document.querySelector('[data-mobile-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const panel = document.querySelector('#mobile-menu');
  const mq = window.matchMedia(MOBILE_MQ);

  function setExpanded(open) {
    if (!header || !toggle) return;
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    if (panel) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) header.classList.remove('is-hidden');
  }

  function closeMenu() {
    setExpanded(false);
  }

  function openMenu() {
    setExpanded(true);
  }

  if (toggle && header && menu) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (header.classList.contains('is-menu-open')) closeMenu();
      else openMenu();
    });

    document.addEventListener('click', (e) => {
      if (!mq.matches || !header.classList.contains('is-menu-open')) return;
      if (!header.contains(e.target)) closeMenu();
    });

    mq.addEventListener('change', (e) => {
      if (!e.matches) {
        closeMenu();
        header.classList.remove('is-hidden');
      }
    });

    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (!mq.matches || document.body.classList.contains('is-panels')) {
        // 翻頁模式下改由面板切換控制，頂欄保持可見（或僅在原生滾動時隱藏）
        if (document.documentElement.classList.contains('is-panels--native')) {
          // fall through for native scroll
        } else if (document.body.classList.contains('is-panels')) {
          header.classList.remove('is-hidden');
          ticking = false;
          return;
        } else {
          header.classList.remove('is-hidden');
          ticking = false;
          return;
        }
      }

      if (header.classList.contains('is-menu-open')) {
        lastY = window.scrollY;
        ticking = false;
        return;
      }

      const y = window.scrollY;
      const delta = y - lastY;

      if (y < 24) {
        header.classList.remove('is-hidden');
      } else if (delta > 6) {
        header.classList.add('is-hidden');
      } else if (delta < -6) {
        header.classList.remove('is-hidden');
      }

      lastY = y;
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  document.querySelectorAll('[data-nav-link], a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#') || href === '#') return;
      const id = href.slice(1);

      if (typeof goToSection === 'function') {
        e.preventDefault();
        goToSection(id);
      }

      if (mq.matches) closeMenu();
    });
  });
}
