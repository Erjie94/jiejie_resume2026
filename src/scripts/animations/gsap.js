import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const EDGE_EPS = 3;
  const PAGE_OVERSCROLL_THRESHOLD = 90;
  const TOUCH_OVERSCROLL_THRESHOLD = 56;
  let overscrollAccum = 0;
  let overscrollTimer = 0;
  let pointerSelecting = false;

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
    panel.querySelectorAll('.tag-chip, .cert-card').forEach((el) => nodes.push(el));
    panel.querySelectorAll('.timeline-h__node').forEach((el) => nodes.push(el));
    const contact = panel.querySelector('.contact-body');
    if (contact) nodes.push(contact);
    return nodes;
  }

  /** 先藏起所有進場元素，避免「先看到靜態 → 再播一次」 */
  function prepareHiddenState() {
    panels.forEach((panel) => {
      const targets = getEnterTargets(panel);
      if (!targets.length) return;
      gsap.set(targets, { opacity: 0, y: 28, pointerEvents: 'none' });
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
    const chips = panel.querySelectorAll('.tag-chip, .cert-card');
    const nodes = panel.querySelectorAll('.timeline-h__node');
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
      tl.to(title, { y: 0, opacity: 1, pointerEvents: 'auto', duration: 0.55 });
    }

    if (fadeItems.length) {
      tl.to(fadeItems, { y: 0, opacity: 1, pointerEvents: 'auto', stagger: 0.1, duration: 0.55 }, '-=0.2');
    }
    if (chips.length) {
      tl.to(
        chips,
        { y: 0, opacity: 1, pointerEvents: 'auto', stagger: 0.06, duration: 0.45 },
        fadeItems.length ? '-=0.25' : '-=0.15',
      );
    }
    if (nodes.length) {
      tl.to(nodes, { y: 0, opacity: 1, pointerEvents: 'auto', stagger: 0.05, duration: 0.4 }, '-=0.2');
    }
    if (!fadeItems.length && !chips.length && !nodes.length && contact) {
      tl.to(contact, { y: 0, opacity: 1, pointerEvents: 'auto', duration: 0.5 }, '-=0.2');
    } else if (contact && panel.id === 'contact') {
      tl.to(contact, { y: 0, opacity: 1, pointerEvents: 'auto', duration: 0.5 }, '-=0.2');
    }

    tl.eventCallback('onComplete', () => syncPanelScrollable());
  }

  function goTo(index, { instant = false } = {}) {
    const next = gsap.utils.clamp(0, panels.length - 1, index);
    if (busy && !instant) return current;
    if (next === current && !instant) return current;

    busy = true;
    current = next;
    resetOverscroll();
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

  function getPanelScrollState(panel) {
    const canInner = panel.scrollHeight > panel.clientHeight + EDGE_EPS;
    const atTop = panel.scrollTop <= EDGE_EPS;
    const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - EDGE_EPS;
    return { canInner, atTop, atBottom };
  }

  function canPageUp() {
    return getPanelScrollState(panels[current]).atTop;
  }

  function canPageDown() {
    const { canInner, atBottom } = getPanelScrollState(panels[current]);
    if (!canInner) return true;
    return atBottom;
  }

  function canScrollPanelUp(panel) {
    const { canInner, atTop } = getPanelScrollState(panel);
    return canInner && !atTop;
  }

  function canScrollPanelDown(panel) {
    const { canInner, atBottom } = getPanelScrollState(panel);
    return canInner && !atBottom;
  }

  function isInteractingWithText() {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return true;
    return pointerSelecting;
  }

  function resetOverscroll() {
    overscrollAccum = 0;
    window.clearTimeout(overscrollTimer);
  }

  function bumpOverscroll(delta) {
    overscrollAccum += delta;
    window.clearTimeout(overscrollTimer);
    overscrollTimer = window.setTimeout(() => {
      overscrollAccum = 0;
    }, 220);
  }

  function tryPageFromOverscroll(direction) {
    if (direction > 0) {
      if (!canPageDown() || overscrollAccum < PAGE_OVERSCROLL_THRESHOLD) return false;
      resetOverscroll();
      goTo(current + 1);
      return true;
    }

    if (!canPageUp() || overscrollAccum > -PAGE_OVERSCROLL_THRESHOLD) return false;
    resetOverscroll();
    goTo(current - 1);
    return true;
  }

  function syncPanelScrollable() {
    panels.forEach((panel) => {
      const needsScroll = panel.scrollHeight > panel.clientHeight + EDGE_EPS;
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

  document.addEventListener('mousedown', () => {
    pointerSelecting = false;
  });

  document.addEventListener(
    'mousemove',
    (e) => {
      if (e.buttons === 1) pointerSelecting = true;
    },
    { passive: true },
  );

  document.addEventListener('mouseup', () => {
    window.setTimeout(() => {
      pointerSelecting = false;
    }, 0);
  });

  window.addEventListener(
    'wheel',
    (e) => {
      if (busy || isInteractingWithText()) return;
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;

      const panel = panels[current];
      const delta = e.deltaY;
      if (Math.abs(delta) < 1) return;

      if (delta > 0) {
        if (canScrollPanelDown(panel)) {
          resetOverscroll();
          return;
        }
        if (!canPageDown()) {
          resetOverscroll();
          return;
        }
        bumpOverscroll(delta);
        if (tryPageFromOverscroll(1)) e.preventDefault();
        return;
      }

      if (canScrollPanelUp(panel)) {
        resetOverscroll();
        return;
      }
      if (!canPageUp()) {
        resetOverscroll();
        return;
      }
      bumpOverscroll(delta);
      if (tryPageFromOverscroll(-1)) e.preventDefault();
    },
    { passive: false },
  );

  // 觸控裝置：內層先捲到底／頂，再多滑一段才翻頁
  const pageEl = document.querySelector('.page') || track;
  let touchStartY = 0;
  let touchStartX = 0;
  let touchActive = false;
  let touchEdgeOverscroll = 0;
  let touchWasAtEdge = false;

  pageEl.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) return;
      touchActive = true;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchEdgeOverscroll = 0;
      touchWasAtEdge = false;
    },
    { passive: true },
  );

  pageEl.addEventListener(
    'touchmove',
    (e) => {
      if (!touchActive || busy || isInteractingWithText() || e.touches.length !== 1) return;

      const dy = touchStartY - e.touches[0].clientY;
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      if (dx > 40) return;

      const panel = panels[current];
      const scrollingDown = dy > 0;
      const scrollingUp = dy < 0;

      if (scrollingDown && canScrollPanelDown(panel)) {
        touchEdgeOverscroll = 0;
        touchWasAtEdge = false;
        return;
      }
      if (scrollingUp && canScrollPanelUp(panel)) {
        touchEdgeOverscroll = 0;
        touchWasAtEdge = false;
        return;
      }

      if (scrollingDown && canPageDown()) {
        touchWasAtEdge = true;
        touchEdgeOverscroll = Math.max(touchEdgeOverscroll, dy);
        if (touchEdgeOverscroll > 12) e.preventDefault();
        return;
      }

      if (scrollingUp && canPageUp()) {
        touchWasAtEdge = true;
        touchEdgeOverscroll = Math.min(touchEdgeOverscroll, dy);
        if (touchEdgeOverscroll < -12) e.preventDefault();
      }
    },
    { passive: false },
  );

  pageEl.addEventListener(
    'touchend',
    (e) => {
      if (!touchActive || busy || isInteractingWithText()) {
        touchActive = false;
        touchEdgeOverscroll = 0;
        touchWasAtEdge = false;
        return;
      }
      touchActive = false;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const dy = touchStartY - touch.clientY;
      const dx = Math.abs(touch.clientX - touchStartX);
      if (dx > Math.abs(dy)) {
        touchEdgeOverscroll = 0;
        touchWasAtEdge = false;
        return;
      }

      if (!touchWasAtEdge) return;

      if (dy > 0 && canPageDown() && touchEdgeOverscroll >= TOUCH_OVERSCROLL_THRESHOLD) {
        goTo(current + 1);
      } else if (dy < 0 && canPageUp() && touchEdgeOverscroll <= -TOUCH_OVERSCROLL_THRESHOLD) {
        goTo(current - 1);
      }

      touchEdgeOverscroll = 0;
      touchWasAtEdge = false;
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

  window.addEventListener('panels:contentchange', () => {
    requestAnimationFrame(syncPanelScrollable);
  });

  window.addEventListener('keydown', (e) => {
    if (busy || isInteractingWithText()) return;
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
