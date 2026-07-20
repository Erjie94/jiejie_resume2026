import * as THREE from 'three';

/**
 * Hero 背景輕量 3D（旋轉幾何氛圍）
 * 離開視窗或分頁隱藏時暫停渲染
 * @see docs/animation-guide.md
 */
export function initThreeScene({ root } = {}) {
  const container = typeof root === 'string' ? document.querySelector(root) : root;
  if (!container) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1.6, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0xb8e1ff,
    metalness: 0.2,
    roughness: 0.45,
    flatShading: true,
    transparent: true,
    opacity: 0.9,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(2.2, 0.4, 0);
  scene.add(mesh);

  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xff785a, transparent: true, opacity: 0.45 }),
  );
  mesh.add(wire);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(3, 4, 5);
  scene.add(ambient, dir);

  let raf = 0;
  let visible = true;
  let pageVisible = true;

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    const width = w || window.innerWidth;
    const height = h || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function tick() {
    if (!visible || !pageVisible) return;
    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.005;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(raf);
  }

  resize();
  start();
  window.addEventListener('resize', resize);

  document.addEventListener('visibilitychange', () => {
    pageVisible = document.visibilityState === 'visible';
    if (pageVisible && visible) start();
    else stop();
  });

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && pageVisible) start();
      else stop();
    },
    { threshold: 0.05 },
  );
  io.observe(container);

  return { scene, renderer, dispose: () => {
    stop();
    io.disconnect();
    window.removeEventListener('resize', resize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    container.innerHTML = '';
  } };
}
