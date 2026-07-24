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
    <div class="timeline-h__detail" id="exp-detail" data-exp-detail tabindex="-1">
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

  function setActiveButton(index) {
    buttons.forEach((btn) => {
      const active = Number(btn.dataset.expIndex) === index;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-expanded', active ? 'true' : 'false');
      if (active) {
        btn.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'nearest', block: 'nearest' });
      }
    });
  }

  async function showDetail(index, { instant = false } = {}) {
    const item = experience[index];
    if (!item || !detailEl || !stageEl) return;
    if (index === currentIndex) return;
    if (animating && !instant) return;

    const direction = instant || currentIndex < 0 ? 0 : Math.sign(index - currentIndex);
    setActiveButton(index);

    const incoming = document.createElement('div');
    incoming.className = 'timeline-h__slide';
    incoming.innerHTML = await buildDetailMarkup(item);

    const outgoing = stageEl.querySelector('.timeline-h__slide');

    // 首次載入或減少動態：直接替換
    if (direction === 0 || !outgoing || reduceMotion || instant) {
      stageEl.replaceChildren(incoming);
      currentIndex = index;
      detailEl.classList.add('is-open');
      window.dispatchEvent(new CustomEvent('panels:contentchange'));
      return;
    }

    animating = true;
    const fromH = outgoing.offsetHeight;
    stageEl.style.height = `${fromH}px`;
    outgoing.classList.add('is-outgoing');
    incoming.classList.add('is-incoming');
    stageEl.appendChild(incoming);

    const toH = incoming.offsetHeight;
    const duration = 800;
    const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
    // direction > 0：往時間線右側 → 舊內容向左退出，新內容自右推入
    const outX = `${-direction * 100}%`;
    const inFromX = `${direction * 100}%`;

    try {
      await Promise.all([
        outgoing.animate(
          [{ transform: 'translateX(0)' }, { transform: `translateX(${outX})` }],
          { duration, easing, fill: 'forwards' },
        ).finished,
        incoming.animate(
          [{ transform: `translateX(${inFromX})` }, { transform: 'translateX(0)' }],
          { duration, easing, fill: 'forwards' },
        ).finished,
        stageEl.animate(
          [{ height: `${fromH}px` }, { height: `${toH}px` }],
          { duration, easing, fill: 'forwards' },
        ).finished,
      ]);
    } catch {
      /* animation cancelled */
    }

    outgoing.remove();
    incoming.getAnimations().forEach((a) => a.cancel());
    stageEl.getAnimations().forEach((a) => a.cancel());
    incoming.classList.remove('is-incoming');
    incoming.style.transform = '';
    stageEl.style.height = '';
    currentIndex = index;
    animating = false;
    detailEl.classList.add('is-open');
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
function initHorizontalScroll(rail) {
  let pointerId = null;
  let startX = 0;
  let startScroll = 0;
  let dragging = false;

  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointerId = e.pointerId;
    startX = e.clientX;
    startScroll = rail.scrollLeft;
    dragging = false;
    rail.dataset.dragging = '0';
  });

  rail.addEventListener('pointermove', (e) => {
    if (pointerId == null || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;

    // 超過門檻才進入拖曳，並延後 capture，避免吃掉 button click
    if (!dragging && Math.abs(dx) > 10) {
      dragging = true;
      rail.dataset.dragging = '1';
      rail.classList.add('is-grabbing');
      try {
        rail.setPointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    }

    if (!dragging) return;
    rail.scrollLeft = startScroll - dx;
    e.preventDefault();
  });

  function endDrag(e) {
    if (pointerId == null || (e && e.pointerId !== pointerId)) return;
    const wasDragging = dragging;
    pointerId = null;
    dragging = false;
    rail.classList.remove('is-grabbing');

    if (wasDragging) {
      rail.dataset.dragging = '1';
      window.setTimeout(() => {
        rail.dataset.dragging = '0';
      }, 80);
    } else {
      rail.dataset.dragging = '0';
    }
  }

  rail.addEventListener('pointerup', endDrag);
  rail.addEventListener('pointercancel', endDrag);

  rail.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (rail.scrollWidth <= rail.clientWidth + 2) return;
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
  if (!projectsEl) return Promise.resolve();

  const allTags = collectProjectTags(projects);
  /** @type {Set<string>} */
  const activeTags = new Set();

  function projectItemHtml(p, index, media) {
    const mediaHtml = media
      .map((item) => {
        if (isVideoUrl(item.url)) {
          return `<video class="project-item__media" src="${escapeAttr(item.url)}" controls playsinline preload="metadata"></video>`;
        }
        return `<img class="project-item__media" src="${escapeAttr(item.url)}" alt="${escapeAttr(p.title)}" loading="lazy" decoding="async" />`;
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

  return Promise.all(
    projects.map((p) => resolveMediaItemsAsync(p.image).then((items) => items.slice(0, 3))),
  ).then((resolvedMedia) => {
    projectsEl.innerHTML = projects
      .map((p, i) => projectItemHtml(p, i, resolvedMedia[i]))
      .join('');
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
