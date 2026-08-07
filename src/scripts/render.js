import gsap from 'gsap';
import { qs, assetUrl, resolveMediaItemsAsync, isVideoUrl } from './utils.js';
import { initLightbox } from './lightbox.js';

function setText(selector, value) {
  const el = qs(selector);
  if (el && value != null) el.textContent = value;
}

export async function renderResume(data) {
  const { profile, about, experience, projects, contact } = data;

  setText('[data-field="name"]', profile.name);
  setText('[data-field="nav-name"]', profile.name);
  setText('[data-field="tagline"]', profile.tagline);

  const avatarEl = qs('[data-field="avatar"]');
  if (avatarEl && profile.avatar) {
    avatarEl.src = assetUrl(profile.avatar);
    avatarEl.alt = `${profile.name} 的個人照片`;
  }

  document.querySelectorAll('[data-brand], [data-brand-hero]').forEach((el) => {
    if (profile.nameEn || profile.name) {
      el.textContent = profile.nameEn || profile.name;
    }
  });

  const aboutEl = qs('[data-field="about"]');
  if (aboutEl) {
    aboutEl.innerHTML = (about.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  }

  const certs = about?.Certificate || about?.certificate || [];
  const certEl = qs('[data-field="certificates"]');
  const certTitle = qs('.about__subtitle');
  if (certEl) {
    if (!certs.length) {
      certEl.innerHTML = '';
      if (certTitle) certTitle.hidden = true;
    } else {
      if (certTitle) certTitle.hidden = false;
      certEl.innerHTML = certs
        .map(
          (c, i) => `
        <li class="cert-card" style="--cert-i: ${i}">
          <span class="cert-card__seal" aria-hidden="true"></span>
          <span class="cert-card__label">Certificate</span>
          <strong class="cert-card__name">${escapeHtml(c.name)}</strong>
        </li>`,
        )
        .join('');
    }
  }

  renderExperience(experience);
  await renderProjects(projects);

  setText('[data-field="contact-heading"]', contact.heading);
  setText('[data-field="contact-message"]', contact.message);

  const emailEl = qs('[data-field="email"]');
  if (emailEl && profile.email) {
    emailEl.textContent = profile.email;
    emailEl.setAttribute('href', `mailto:${profile.email}`);
  }

  setText(
    '[data-field="footer"]',
    `© ${new Date().getFullYear()} ${profile.nameEn || profile.name}`,
  );
}

function renderExperience(experience = []) {
  const root = qs('[data-field="experience"]');
  if (!root) return;

  const nodes = experience
    .map(
      (item, index) => `
      <li class="timeline-h__item">
        <button
          type="button"
          class="timeline-h__node${index === 0 ? ' is-active' : ''}"
          data-exp-index="${index}"
          aria-expanded="${index === 0 ? 'true' : 'false'}"
          aria-controls="exp-detail"
        >
          <span class="timeline-h__dot" aria-hidden="true"></span>
          <span class="timeline-h__period">${escapeHtml(item.period)}</span>
          <span class="timeline-h__title">${escapeHtml(item.role)}</span>
          <span class="timeline-h__org">${escapeHtml(item.company)}</span>
        </button>
      </li>`,
    )
    .join('');

  root.innerHTML = `
    <ol class="timeline-h__rail" data-exp-rail>${nodes}</ol>
    <div class="timeline-h__detail" id="exp-detail" data-exp-detail data-panel-scroll tabindex="-1">
      <div class="timeline-h__stage" data-exp-stage></div>
    </div>
  `;

  const detailEl = qs('[data-exp-detail]', root);
  const stageEl = qs('[data-exp-stage]', root);
  const rail = qs('[data-exp-rail]', root);
  const buttons = [...root.querySelectorAll('[data-exp-index]')];
  let currentIndex = -1;
  let animating = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mediaItemHtml(url, alt) {
    if (isVideoUrl(url)) {
      return `<video class="timeline-h__shot" src="${escapeAttr(url)}" controls playsinline preload="metadata"></video>`;
    }

    return `<button type="button" class="timeline-h__shot-btn" data-lightbox-src="${escapeAttr(url)}" data-lightbox-alt="${escapeAttr(alt)}" aria-label="放大預覽照片">
        <img class="timeline-h__shot" src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async" />
      </button>`;
  }

  async function buildDetailMarkup(item) {
    const media = await resolveMediaItemsAsync(item.picture);
    const count = media.length;
    /* 4 張以上改為兩欄（4→2×2、6→2×3），避免直向堆疊超出 */
    const cols = count >= 4 ? 2 : 1;
    const alt = `${item.role} 相關照片`;
    const mediaHtml = count
      ? `<div class="timeline-h__media" data-count="${count}" data-cols="${cols}">${media
          .map((m) => mediaItemHtml(m.url, alt))
          .join('')}</div>`
      : '';

    const highlights = (item.highlights || [])
      .map((h) => `<li>${escapeHtml(h)}</li>`)
      .join('');

    return `
      <div class="timeline-h__detail-layout${media.length ? ' has-media' : ''}">
        <div class="timeline-h__copy">
          <p class="timeline-h__detail-period">${escapeHtml(item.period)}</p>
          <h3 class="timeline-h__detail-role">${escapeHtml(item.role)}</h3>
          <p class="timeline-h__detail-company">${escapeHtml(item.company)}</p>
          <p class="timeline-h__detail-summary">${escapeHtml(item.summary || '')}</p>
          ${highlights ? `<ul class="timeline-h__highlights">${highlights}</ul>` : ''}
        </div>
        ${mediaHtml}
      </div>
    `;
  }

  /** 只在橫向軌道內捲動，避免 scrollIntoView 連帶捲動 .page 把 Hero 推走 */
  function scrollRailToButton(btn) {
    if (!rail || !btn) return;
    const railRect = rail.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    let delta = 0;
    if (btnRect.left < railRect.left + 8) {
      delta = btnRect.left - railRect.left - 8;
    } else if (btnRect.right > railRect.right - 8) {
      delta = btnRect.right - railRect.right + 8;
    }
    if (!delta) return;
    rail.scrollBy({ left: delta, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function setActiveButton(index) {
    buttons.forEach((btn) => {
      const active = Number(btn.dataset.expIndex) === index;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-expanded', active ? 'true' : 'false');
      if (active) scrollRailToButton(btn);
    });
  }

  async function showDetail(index, { instant = false } = {}) {
    const item = experience[index];
    if (!item || !detailEl || !stageEl) return;
    if (index === currentIndex) return;
    if (animating && !instant) return;

    setActiveButton(index);

    const incoming = document.createElement('div');
    incoming.className = 'timeline-h__slide';
    incoming.innerHTML = await buildDetailMarkup(item);

    const outgoing = stageEl.querySelector('.timeline-h__slide');

    // 首次載入或減少動態：直接替換
    if (!outgoing || reduceMotion || instant || currentIndex < 0) {
      gsap.killTweensOf([stageEl, outgoing, incoming].filter(Boolean));
      stageEl.replaceChildren(incoming);
      gsap.set(incoming, { clearProps: 'opacity,y' });
      currentIndex = index;
      detailEl.classList.add('is-open');
      detailEl.scrollTop = 0;
      window.dispatchEvent(new CustomEvent('panels:contentchange'));
      return;
    }

    animating = true;
    const fromH = outgoing.offsetHeight;
    stageEl.style.height = `${fromH}px`;
    outgoing.classList.add('is-outgoing');
    incoming.classList.add('is-incoming');
    gsap.set(incoming, { opacity: 0, y: 12 });
    stageEl.appendChild(incoming);

    const toH = incoming.offsetHeight;

    await new Promise((resolve) => {
      gsap
        .timeline({
          defaults: { ease: 'power2.inOut' },
          onComplete: resolve,
        })
        .to(outgoing, { opacity: 0, y: -10, duration: 0.32 }, 0)
        .to(stageEl, { height: toH, duration: 0.45 }, 0)
        .to(incoming, { opacity: 1, y: 0, duration: 0.4 }, 0.12);
    });

    outgoing.remove();
    incoming.classList.remove('is-incoming');
    gsap.set(incoming, { clearProps: 'opacity,y' });
    stageEl.style.height = '';
    currentIndex = index;
    animating = false;
    detailEl.classList.add('is-open');
    detailEl.scrollTop = 0;
    window.dispatchEvent(new CustomEvent('panels:contentchange'));
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (rail?.dataset.dragging === '1') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      showDetail(Number(btn.dataset.expIndex));
    });
  });

  if (rail) initHorizontalScroll(rail);

  initLightbox({ root });

  if (experience.length) showDetail(0, { instant: true });
}

/** 橫向軌道：隱藏捲軸，支援滑鼠拖曳／滾輪與觸控滑動（不干擾按鈕點擊） */
function initHorizontalScroll(rail, { pageSnap = false, onPageChange } = {}) {
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let startScroll = 0;
  let dragging = false;
  let axis = null; // null | 'x' | 'y'
  let paging = false;

  if (pageSnap) rail.classList.add('is-paged');

  function pageWidth() {
    return rail.clientWidth || 1;
  }

  function clampIndex(index, count) {
    return Math.max(0, Math.min(count - 1, index));
  }

  function visibleCount() {
    return [...rail.children].filter(
      (el) => el.nodeType === 1 && !el.hidden && !el.classList.contains('is-filtered-out'),
    ).length;
  }

  function animateTo(targetLeft, { duration = 560 } = {}) {
    if (paging) return Promise.resolve();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = rail.scrollLeft;
    const maxLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const to = Math.max(0, Math.min(maxLeft, targetLeft));

    const finish = () => {
      rail.scrollLeft = to;
      rail.classList.remove('is-animating');
      paging = false;
      onPageChange?.(Math.round(to / pageWidth()));
    };

    if (Math.abs(to - from) < 1) {
      finish();
      return Promise.resolve();
    }

    if (reduce) {
      finish();
      return Promise.resolve();
    }

    paging = true;
    rail.classList.add('is-animating');
    const start = performance.now();

    return new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        rail.scrollLeft = from + (to - from) * eased;
        if (t < 1) {
          requestAnimationFrame(frame);
          return;
        }
        finish();
        resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  function goPage(dir) {
    const count = Math.max(1, visibleCount());
    const index = Math.round(rail.scrollLeft / pageWidth());
    const next = clampIndex(index + dir, count);
    return animateTo(next * pageWidth());
  }

  function snapAfterDrag() {
    const page = pageWidth();
    const count = Math.max(1, visibleCount());
    const startIndex = Math.round(startScroll / page);
    const delta = rail.scrollLeft - startScroll;
    const threshold = Math.max(48, page * 0.18);

    let nextIndex = startIndex;
    if (delta > threshold) nextIndex = startIndex + 1;
    else if (delta < -threshold) nextIndex = startIndex - 1;
    else nextIndex = Math.round(rail.scrollLeft / page);

    return animateTo(clampIndex(nextIndex, count) * page);
  }

  rail.__goPage = goPage;
  rail.__animateToPage = (index) => animateTo(clampIndex(index, visibleCount()) * pageWidth());

  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    /* 僅避開需直接操作的控件；時間線按鈕仍可拖曳（超過門檻才算拖） */
    if (e.target.closest('video, a, input, textarea, select')) return;
    if (paging) return;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    startScroll = rail.scrollLeft;
    dragging = false;
    axis = null;
    rail.dataset.dragging = '0';
  });

  rail.addEventListener('pointermove', (e) => {
    if (pointerId == null || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // 先判斷軸向：垂直為主則放棄橫拖，讓手機可上下翻頁
    if (!dragging && axis == null) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        axis = 'y';
        pointerId = null;
        return;
      }
      axis = 'x';
      dragging = true;
      rail.dataset.dragging = '1';
      rail.classList.add('is-grabbing');
      try {
        rail.setPointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    }

    if (axis !== 'x' || !dragging) return;
    rail.scrollLeft = startScroll - dx;
    e.preventDefault();
  });

  function endDrag(e) {
    if (pointerId == null || (e && e.pointerId !== pointerId)) return;
    const wasDragging = dragging;
    pointerId = null;
    dragging = false;
    axis = null;
    rail.classList.remove('is-grabbing');

    if (wasDragging) {
      rail.dataset.dragging = '1';
      window.setTimeout(() => {
        rail.dataset.dragging = '0';
      }, 80);

      if (pageSnap) {
        // 先鎖住互動，再補上與箭頭相同的換頁轉場
        rail.classList.add('is-animating');
        snapAfterDrag();
      }
    } else {
      rail.dataset.dragging = '0';
    }
  }

  rail.addEventListener('pointerup', endDrag);
  rail.addEventListener('pointercancel', endDrag);

  rail.addEventListener(
    'wheel',
    (e) => {
      if (rail.scrollWidth <= rail.clientWidth + 2) return;

      if (pageSnap) {
        /*
          作品區：垂直滾輪留給全站翻頁；
          僅在明確橫向滾動（deltaX）時切換作品，避免擋掉向下換頁。
        */
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        e.stopPropagation();
        if (paging) return;
        const dir = Math.sign(e.deltaX);
        if (!dir) return;
        goPage(dir);
        return;
      }

      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      rail.scrollLeft += e.deltaY;
      e.preventDefault();
      e.stopPropagation();
    },
    { passive: false },
  );
}

function collectProjectTags(projects = []) {
  const seen = new Set();
  const tags = [];
  projects.forEach((p) => {
    (p.tags || []).forEach((tag) => {
      const key = String(tag).trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      tags.push(String(tag).trim());
    });
  });
  return tags;
}

function projectHasTag(project, tag) {
  const needle = String(tag).trim().toLowerCase();
  return (project.tags || []).some((t) => String(t).trim().toLowerCase() === needle);
}

function renderProjects(projects = []) {
  const projectsEl = qs('[data-field="projects"]');
  const filtersEl = qs('[data-field="project-filters"]');
  const carousel = qs('[data-project-carousel]');
  const prevBtn = qs('[data-project-prev]');
  const nextBtn = qs('[data-project-next]');
  if (!projectsEl) return Promise.resolve();

  const allTags = collectProjectTags(projects);
  /** @type {Set<string>} */
  const activeTags = new Set();

  function visibleItems() {
    return [...projectsEl.querySelectorAll('.project-item')].filter(
      (item) => !item.hidden && !item.classList.contains('is-filtered-out'),
    );
  }

  function syncActiveItem() {
    const items = visibleItems();
    const page = projectsEl.clientWidth || 1;
    const index = Math.round(projectsEl.scrollLeft / page);
    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    syncCarouselNav();
  }

  function syncCarouselNav() {
    const items = visibleItems();
    const atStart = projectsEl.scrollLeft <= 4;
    const atEnd =
      projectsEl.scrollLeft + projectsEl.clientWidth >= projectsEl.scrollWidth - 4;
    const alone = items.length <= 1;

    if (prevBtn) prevBtn.disabled = alone || atStart;
    if (nextBtn) nextBtn.disabled = alone || atEnd;
    if (carousel) carousel.classList.toggle('is-single', alone);
  }

  function markSwiped() {
    carousel?.classList.add('has-swiped');
  }

  function goBy(dir) {
    markSwiped();
    if (typeof projectsEl.__goPage === 'function') {
      projectsEl.__goPage(dir).then(syncActiveItem);
      return;
    }
    const items = visibleItems();
    if (!items.length) return;
    const page = projectsEl.clientWidth || 1;
    const index = Math.round(projectsEl.scrollLeft / page);
    const next = Math.max(0, Math.min(items.length - 1, index + dir));
    projectsEl.scrollTo({ left: next * page, behavior: 'smooth' });
    window.setTimeout(syncActiveItem, 360);
  }

  function projectItemHtml(p, index, media) {
    const mediaHtml = media
      .map((item) => {
        if (isVideoUrl(item.url)) {
          return `<video class="project-item__media" src="${escapeAttr(item.url)}" controls playsinline preload="metadata"></video>`;
        }
        return `<button type="button" class="project-item__shot-btn" data-lightbox-src="${escapeAttr(item.url)}" data-lightbox-alt="${escapeAttr(p.title)}" aria-label="放大預覽 ${escapeAttr(p.title)}">
          <img class="project-item__media" src="${escapeAttr(item.url)}" alt="${escapeAttr(p.title)}" loading="lazy" decoding="async" />
        </button>`;
      })
      .join('');

    const tagAttrs = (p.tags || []).map((t) => String(t).trim().toLowerCase()).join(' ');

    return `
      <li class="project-item" data-animate="fade-up" data-project-index="${index}" data-project-tags="${escapeAttr(tagAttrs)}">
        <h3>${
          p.url
            ? `<a href="${escapeAttr(p.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.title)}</a>`
            : escapeHtml(p.title)
        }</h3>
        <p>${escapeHtml(p.description)}</p>
        <div class="project-tags">${(p.tags || [])
          .map((t) => `<span data-tag="${escapeAttr(t)}">${escapeHtml(t)}</span>`)
          .join(' · ')}</div>
        ${mediaHtml ? `<div class="project-item__media-wrap">${mediaHtml}</div>` : ''}
      </li>`;
  }

  function applyFilter() {
    const items = [...projectsEl.querySelectorAll('.project-item')];
    items.forEach((item, index) => {
      const project = projects[index];
      const visible =
        activeTags.size === 0 || [...activeTags].some((tag) => projectHasTag(project, tag));
      item.hidden = !visible;
      item.classList.toggle('is-filtered-out', !visible);
    });

    if (filtersEl) {
      filtersEl.querySelectorAll('[data-filter-tag]').forEach((btn) => {
        const tag = btn.getAttribute('data-filter-tag') || '';
        const isAll = tag === '';
        const active = isAll ? activeTags.size === 0 : activeTags.has(tag);
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    projectsEl.scrollLeft = 0;
    syncActiveItem();
    window.dispatchEvent(new CustomEvent('panels:contentchange'));
  }

  if (filtersEl) {
    const chips = [
      `<li><button type="button" class="tag-chip is-active" data-filter-tag="" aria-pressed="true">全部</button></li>`,
      ...allTags.map(
        (tag) =>
          `<li><button type="button" class="tag-chip" data-filter-tag="${escapeAttr(tag)}" aria-pressed="false">${escapeHtml(tag)}</button></li>`,
      ),
    ];
    filtersEl.innerHTML = chips.join('');
    initHorizontalScroll(filtersEl);

    filtersEl.addEventListener('click', (e) => {
      if (filtersEl.dataset.dragging === '1') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const btn = e.target.closest('[data-filter-tag]');
      if (!btn || !filtersEl.contains(btn)) return;

      e.preventDefault();
      const tag = btn.getAttribute('data-filter-tag') || '';
      if (!tag) {
        activeTags.clear();
      } else if (activeTags.has(tag)) {
        activeTags.delete(tag);
      } else {
        activeTags.add(tag);
      }

      applyFilter();
    });
  }

  prevBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    goBy(-1);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    goBy(1);
  });

  projectsEl.addEventListener('scroll', () => syncActiveItem(), { passive: true });

  return Promise.all(
    projects.map((p) => resolveMediaItemsAsync(p.image).then((items) => items.slice(0, 3))),
  ).then((resolvedMedia) => {
    projectsEl.innerHTML = projects
      .map((p, i) => projectItemHtml(p, i, resolvedMedia[i]))
      .join('');
    initHorizontalScroll(projectsEl, {
      pageSnap: true,
      onPageChange: () => {
        markSwiped();
        syncActiveItem();
      },
    });
    initLightbox({ root: projectsEl });
    applyFilter();
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("'", '&#39;');
}
