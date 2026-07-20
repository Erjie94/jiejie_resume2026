import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(Observer, ScrollTrigger);

/**
 * 以每個 data-section 為一頁的 GSAP 滾動翻頁
 * @see docs/animation-guide.md
 */
export function initGsap({ reducedMotion = false } = {}) {
  const track = document.querySelector('[data-panels-track]');
  const panels = gsap.utils.toArray('[data-section]');

  if (!track || panels.length === 0) {
    return { goToSection: () => {} };
  }

  document.documentElement.classList.add('is-panels');
  document.body.classList.add('is-panels');

  if (reducedMotion) {
    document.documentElement.classList.add('is-panels--native');
    document.body.classList.add('is-panels-ready');
    gsap.set('[data-animate="fade-up"], .hero__content > *', {
      clearProps: 'all',
      opacity: 1,
    });
    return {
      goToSection(id) {
        const el = typeof id === 'number' ? panels[id] : document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    };
  }

  let current = 0;
  let busy = false;
  let viewportH = window.innerHeight;

  function getEnterTargets(panel) {
    if (panel.id === 'hero') {
      return panel.querySelectorAll(
        '.hero__brand, .hero__name, .hero__tagline, .hero__role, .hero__actions .btn',
      );
    }

    const nodes = [];
    const title = panel.querySelector('.section__title');
    if (title) nodes.push(title);
    panel.querySelectorAll('[data-animate="fade-up"]').forEach((el) => nodes.push(el));
    panel.querySelectorAll('.skill-chip').forEach((el) => nodes.push(el));
    const contact = panel.querySelector('.contact-body');
    if (contact) nodes.push(contact);
    // skills 若無 chip（極少見）仍藏住列表容器，避免空白閃爍
    if (panel.id === 'skills' && !panel.querySelector('.skill-chip')) {
      const list = panel.querySelector('.skill-list');
      if (list) nodes.push(list);
    }
    return nodes;
  }

  /** 先藏起所有進場元素，避免「先看到靜態 → 再播一次」 */
  function prepareHiddenState() {
    panels.forEach((panel) => {
      const targets = getEnterTargets(panel);
      if (!targets.length) return;
      gsap.set(targets, { opacity: 0, y: 28 });
    });
  }

  function measure() {
    const mobile = window.matchMedia('(max-width: 900px)').matches;
    const bar = document.querySelector('.mobile-header__bar');
    const offset = mobile && bar ? bar.getBoundingClientRect().height : 0;
    viewportH = Math.max(window.innerHeight - offset, 200);

    panels.forEach((panel) => {
      panel.style.height = `${viewportH}px`;
    });
    gsap.set(track, { y: -current * viewportH });
    // 等高度套用後再判斷是否需要內層捲動
    requestAnimationFrame(syncPanelScrollable);
  }

  function setActiveNav(index) {
    const id = panels[index]?.id;
    document.querySelectorAll('[data-nav-link]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('is-active', href === `#${id}`);
    });
  }

  function playEnter(index) {
    const panel = panels[index];
    if (!panel || panel.dataset.entered === '1') return;
    panel.dataset.entered = '1';
    panel.classList.add('is-entered');

    const title = panel.querySelector('.section__title');
    const fadeItems = panel.querySelectorAll('[data-animate="fade-up"]');
    const chips = panel.querySelectorAll('.skill-chip');
    const contact = panel.querySelector('.contact-body');

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (panel.id === 'hero') {
      // 已是 opacity:0，只用 to，避免 fromTo 再閃一次
      tl.to('.hero__brand', { y: 0, opacity: 1, duration: 0.75 })
        .to('.hero__name', { y: 0, opacity: 1, duration: 0.5 }, '-=0.35')
        .to('.hero__tagline', { y: 0, opacity: 1, duration: 0.45 }, '-=0.25')
        .to('.hero__role', { opacity: 1, duration: 0.35 }, '-=0.2')
        .to('.hero__actions .btn', { y: 0, opacity: 1, stagger: 0.1, duration: 0.4 }, '-=0.15');
      tl.eventCallback('onComplete', () => syncPanelScrollable());
      return;
    }

    if (title) {
      tl.to(title, { y: 0, opacity: 1, duration: 0.55 });
    }

    if (fadeItems.length) {
      tl.to(fadeItems, { y: 0, opacity: 1, stagger: 0.1, duration: 0.55 }, '-=0.2');
    } else if (chips.length) {
      tl.to(chips, { y: 0, opacity: 1, stagger: 0.06, duration: 0.45 }, '-=0.15');
    } else if (contact) {
      tl.to(contact, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2');
    }

    tl.eventCallback('onComplete', () => syncPanelScrollable());
  }

  function goTo(index, { instant = false } = {}) {
    const next = gsap.utils.clamp(0, panels.length - 1, index);
    if (busy && !instant) return current;
    if (next === current && !instant) return current;

    busy = true;
    current = next;
    setActiveNav(current);

    const id = panels[current].id;
    if (id) history.replaceState(null, '', `#${id}`);

    if (instant) {
      gsap.set(track, { y: -current * viewportH });
      busy = false;
      // 下一幀再播，確保隱藏狀態已上屏
      requestAnimationFrame(() => playEnter(current));
      return current;
    }

    gsap.to(track, {
      y: -current * viewportH,
      duration: 0.85,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: () => {
        busy = false;
        playEnter(current);
        syncPanelScrollable();
        ScrollTrigger.refresh();
      },
    });

    return current;
  }

  function goToSection(idOrIndex) {
    if (typeof idOrIndex === 'number') return goTo(idOrIndex);
    const index = panels.findIndex((p) => p.id === idOrIndex);
    if (index >= 0) return goTo(index);
    return current;
  }

  function canPageUp() {
    const panel = panels[current];
    return panel.scrollTop <= 2;
  }

  function canPageDown() {
    const panel = panels[current];
    const canScrollInner = panel.scrollHeight > panel.clientHeight + 4;
    if (!canScrollInner) return true;
    return panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 4;
  }

  function syncPanelScrollable() {
    panels.forEach((panel) => {
      const needsScroll = panel.scrollHeight > panel.clientHeight + 4;
      panel.classList.toggle('is-scrollable', needsScroll);
      panel.style.overflowY = needsScroll ? 'auto' : 'hidden';
    });
  }

  // 立刻隱藏，避免首屏閃爍
  prepareHiddenState();
  document.body.classList.add('is-panels-ready');
  measure();

  const hash = window.location.hash.replace('#', '');
  const startIndex = panels.findIndex((p) => p.id === hash);
  goTo(startIndex >= 0 ? startIndex : 0, { instant: true });

  Observer.create({
    target: window,
    type: 'wheel,touch,pointer',
    wheelSpeed: -1,
    tolerance: 40,
    preventDefault: false,
    onDown: () => {
      if (busy || !canPageUp()) return;
      goTo(current - 1);
    },
    onUp: () => {
      if (busy || !canPageDown()) return;
      goTo(current + 1);
    },
  });

  // 觸控裝置專用滑動翻頁（手機／平板較可靠）
  const pageEl = document.querySelector('.page') || track;
  let touchStartY = 0;
  let touchStartX = 0;
  let touchActive = false;

  pageEl.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) return;
      touchActive = true;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );

  pageEl.addEventListener(
    'touchmove',
    (e) => {
      if (!touchActive || busy || e.touches.length !== 1) return;
      const dy = touchStartY - e.touches[0].clientY;
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      // 明顯垂直滑、且即將翻頁時阻止瀏覽器預設捲動
      if (dx > 40) return;
      if ((dy > 24 && canPageDown()) || (dy < -24 && canPageUp())) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  pageEl.addEventListener(
    'touchend',
    (e) => {
      if (!touchActive || busy) {
        touchActive = false;
        return;
      }
      touchActive = false;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dy = touchStartY - touch.clientY;
      const dx = Math.abs(touch.clientX - touchStartX);
      if (dx > Math.abs(dy) || Math.abs(dy) < 48) return;
      if (dy > 0 && canPageDown()) goTo(current + 1);
      else if (dy < 0 && canPageUp()) goTo(current - 1);
    },
    { passive: true },
  );

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
    }, 120);
  });

  window.addEventListener('keydown', (e) => {
    if (busy) return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;

    if (['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) {
      if (!canPageDown() && e.key === ' ') return;
      e.preventDefault();
      if (canPageDown()) goTo(current + 1);
    } else if (['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault();
      if (canPageUp()) goTo(current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(panels.length - 1);
    }
  });

  return { goToSection };
}
