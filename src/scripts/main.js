import resume from '../data/resume.json';
import { renderResume } from './render.js';
import { prefersReducedMotion, canUseHeavyFx, assetUrl, prewarmMediaFromResume } from './utils.js';
import { initNav } from './nav.js';
import { initTyped } from './animations/typed.js';
import { initGsap } from './animations/gsap.js';
import { initAnime } from './animations/anime.js';
import { initMo } from './animations/mo.js';

function safe(label, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`[init] ${label} 失敗：`, err);
  }
}

async function boot() {
  const bootHash =
    window.__resumeBootHash ||
    (() => {
      const h = window.location.hash.replace('#', '');
      if (h) history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      return h;
    })();
  window.__resumeBootHash = '';
  window.scrollTo(0, 0);

  document.documentElement.lang = resume.meta?.lang || 'zh-Hant';
  if (resume.meta?.siteTitle) {
    document.title = resume.meta.siteTitle;
  }

  await prewarmMediaFromResume(resume);
  await renderResume(resume);

  const reduced = prefersReducedMotion();

  let gsapApi = { goToSection: () => {} };
  safe('gsap', () => {
    gsapApi = initGsap({ reducedMotion: reduced, initialHash: bootHash }) || gsapApi;
  });

  initNav({ goToSection: gsapApi.goToSection });

  safe('typed', () =>
    initTyped({
      el: '#typed-role',
      strings: resume.profile.roles,
      reducedMotion: reduced,
    }),
  );

  safe('anime', () => initAnime({ reducedMotion: reduced }));
  safe('mo', () => initMo({ reducedMotion: reduced }));

  requestAnimationFrame(async () => {
    const desktop = window.matchMedia('(min-width: 901px)').matches;
    if (desktop) {
      try {
        const { initLottie } = await import('./animations/lottie.js');
        initLottie({
          selector: '#lottie-mail',
          path: assetUrl('assets/lottie/mail.json'),
          reducedMotion: reduced,
        });
      } catch (err) {
        console.warn('[init] lottie 失敗：', err);
      }
    }

    if (!reduced && canUseHeavyFx()) {
      try {
        const { initThreeScene } = await import('./three/scene.js');
        initThreeScene({ root: '#webgl-root' });
      } catch (err) {
        console.warn('[init] three 失敗：', err);
      }
    }
  });
}

boot();
