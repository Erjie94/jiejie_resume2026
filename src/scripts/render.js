import { qs, assetUrl } from './utils.js';

function setText(selector, value) {
  const el = qs(selector);
  if (el && value != null) el.textContent = value;
}

export function renderResume(data) {
  const { profile, about, skills, experience, projects, contact } = data;

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
    aboutEl.innerHTML = about.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  }

  const skillsEl = qs('[data-field="skills"]');
  if (skillsEl) {
    skillsEl.innerHTML = skills
      .map(
        (s) =>
          `<li class="skill-chip" data-skill="${escapeAttr(s.name)}"><strong>${escapeHtml(
            s.name,
          )}</strong><span>${s.level}%</span></li>`,
      )
      .join('');
  }

  const expEl = qs('[data-field="experience"]');
  if (expEl) {
    expEl.innerHTML = experience
      .map(
        (item) => `
        <li class="timeline__item" data-animate="fade-up">
          <p class="timeline__period">${escapeHtml(item.period)}</p>
          <h3 class="timeline__role">${escapeHtml(item.role)}</h3>
          <p class="timeline__company">${escapeHtml(item.company)} — ${escapeHtml(item.summary)}</p>
          <ul class="timeline__highlights">
            ${item.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
        </li>`,
      )
      .join('');
  }

  const projectsEl = qs('[data-field="projects"]');
  if (projectsEl) {
    projectsEl.innerHTML = projects
      .map(
        (p) => `
        <li class="project-item" data-animate="fade-up">
          <h3>${
            p.url
              ? `<a href="${escapeAttr(p.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.title)}</a>`
              : escapeHtml(p.title)
          }</h3>
          <p>${escapeHtml(p.description)}</p>
          <div class="project-tags">${p.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join(' · ')}</div>
        </li>`,
      )
      .join('');
  }

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
