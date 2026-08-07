import EmblaCarousel from 'embla-carousel';

/**
 * 作品區專用 Embla 輪播
 * 僅掛在 projects viewport；經歷軌道／標籤列仍走 initHorizontalScroll
 */
export function initProjectCarousel({
  viewport,
  container,
  prevBtn,
  nextBtn,
  carouselRoot,
  reducedMotion = false,
} = {}) {
  if (!viewport || !container) {
    return {
      destroy() {},
      refresh() {},
      scrollPrev() {},
      scrollNext() {},
      scrollToStart() {},
    };
  }

  const embla = EmblaCarousel(viewport, {
    axis: 'x',
    align: 'start',
    containScroll: 'trimSnaps',
    duration: reducedMotion ? 0 : 22,
    watchDrag: true,
    watchSlides: true,
    skipSnaps: false,
  });

  function markSwiped() {
    carouselRoot?.classList.add('has-swiped');
  }

  function syncUi() {
    const snaps = embla.scrollSnapList();
    const alone = snaps.length <= 1;
    const inView = new Set(embla.slidesInView());

    embla.slideNodes().forEach((node, index) => {
      node.classList.toggle('is-active', inView.has(index));
    });

    if (prevBtn) prevBtn.disabled = alone || !embla.canScrollPrev();
    if (nextBtn) nextBtn.disabled = alone || !embla.canScrollNext();
    carouselRoot?.classList.toggle('is-single', alone);
  }

  embla.on('select', syncUi);
  embla.on('reInit', syncUi);
  embla.on('settle', syncUi);
  embla.on('pointerDown', () => {
    container.classList.add('is-grabbing');
    markSwiped();
  });
  embla.on('pointerUp', () => {
    container.classList.remove('is-grabbing');
  });

  syncUi();

  return {
    destroy() {
      container.classList.remove('is-grabbing');
      embla.destroy();
    },
    refresh() {
      embla.reInit();
      syncUi();
    },
    scrollPrev() {
      markSwiped();
      embla.scrollPrev();
    },
    scrollNext() {
      markSwiped();
      embla.scrollNext();
    },
    scrollToStart() {
      embla.scrollTo(0, true);
      syncUi();
    },
  };
}
