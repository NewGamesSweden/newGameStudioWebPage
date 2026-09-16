/* ===================================================================
   Interactive coffee mug for the orange coffee section

   What it does
   - Loads workshop-mug-with-steam.glb with Three.js into the canvas
     inside #coffee-mug.
   - Spins slowly on its own. Drag it and it takes the throw, then settles
     back into its slow spin in whichever direction it was thrown.
   - Click the mug to sip (3 sips, then empty). Nothing on the page explains
     this; it is a small detail to discover. Fast spins splash a few drops.
     Only the donation button refills it.
   - Keyboard: Enter or Space on the canvas sips, arrow keys spin. A
     visually hidden status line announces sip changes to screen readers.
   - Falls back to a plain ☕ if WebGL or the model is unavailable.

   The rules (sips, click vs drag, easing) live in coffee-state.js.
   Settings you might want to change are just below.
   =================================================================== */

import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createSipState, createGesture, createLevelAnimator } from './coffee-state.js';


/* SETTINGS ============================================================ */

// Paste the real donation link here when you have one, for example
// 'https://buymeacoffee.com/newgamestudio'. While it is empty the
// "REFILL THE DEVS" label stays a plain, clearly unavailable placeholder.
export const DONATION_URL = '';

const MODEL_URL = new URL('./workshop-mug-with-steam.glb', import.meta.url);
const LEVEL_ANIMATION_MS = 380;      // how long the liquid takes to settle after a sip
const DRAG_THRESHOLD_PX = 7;         // move further than this and it is a drag, not a click
const DRAG_SENSITIVITY = 0.012;      // radians of spin per CSS pixel dragged
const KEY_ROTATE_STEP = Math.PI / 6; // 30 degrees per arrow key press
const IDLE_SPIN_SPEED = 0.45;        // radians per second when nobody is touching the mug
const SPIN_SETTLE_RATE = 2.5;        // how quickly a throw eases back to the idle speed (higher = sooner)
const SPLASH_SPEED = 3;              // radians per second of spin before coffee spills
const SPLASH_COOLDOWN_MS = 600;
const DROPLET_LIFE_MS = 400;
const MAX_PIXEL_RATIO = 1.75;
const CAMERA_POSITION = [2.3, 3.6, 2.3]; // looking down at about 40 degrees so every level is visible
const CAMERA_TARGET = [0, 0.95, 0];
const VIEW_HALF_SIZE = 1.5;              // model units from the centre to the edge of the canvas
const START_ROTATION = -0.35;            // handle a little to the right on load

const FALLBACK_TEXT = {
  webgl: 'The 3D mug needs WebGL. Have an imaginary coffee instead.',
  model: 'The mug did not load. Have an imaginary coffee instead.',
};


/* MOUNT =============================================================== */

/**
 * Wires up the mug inside `container` (the #coffee-mug element).
 * Returns { sip, refill, sips, dispose }. Safe to call once per element.
 */
export function mountCoffeeMug(container) {
  if (!container || container.dataset.mounted) return null;
  container.dataset.mounted = 'true';

  const canvas = container.querySelector('.coffee-mug-canvas');
  const status = container.querySelector('.coffee-mug-status');
  const donation = document.querySelector('#donation-button');
  const donationNote = document.querySelector('#donation-note');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const sips = createSipState();
  const gesture = createGesture(DRAG_THRESHOLD_PX);
  const level = createLevelAnimator(LEVEL_ANIMATION_MS, 1);

  // Every listener is registered with this signal so dispose() can remove them all at once.
  const aborter = new AbortController();
  const signal = aborter.signal;

  let renderer = null, scene, camera, raycaster;
  let root = null, coffee, steam = [], solids = [], droplets = [];
  let velocity = 0, idleDirection = 1, lastMoveTime = 0, splashReadyAt = 0;
  let frame = 0, lastFrameTime = 0, onScreen = true;
  let resizeObserver = null, visibilityObserver = null;

  /* Status and controls ------------------------------------------------ */

  function announce() {
    status.textContent = sips.label();
  }

  function showFallback(message) {
    container.classList.add('is-fallback');
    status.textContent = message;
    stopLoop();
  }

  function takeSip() {
    if (!sips.sip()) return;
    announce();
    applyLevel();
  }

  // Only the donation link (or a page refresh) gets the mug back to full.
  function refill() {
    sips.refill();
    announce();
    applyLevel();
  }

  function applyLevel() {
    if (reducedMotion.matches) level.snap(sips.level);
    else level.setTarget(sips.level, performance.now());
    wake();
  }

  // Keyboard nudge. The idle spin then carries on the way the key pointed.
  function rotateBy(radians) {
    if (!root) return;
    root.rotation.y += radians;
    idleDirection = Math.sign(radians) || idleDirection;
    velocity = 0;
    wake();
  }

  canvas.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); rotateBy(-KEY_ROTATE_STEP); }
    if (event.key === 'ArrowRight') { event.preventDefault(); rotateBy(KEY_ROTATE_STEP); }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); takeSip(); }
  }, { signal });

  /* Donation link ------------------------------------------------------- */
  // With a URL, the placeholder label becomes a real link that opens in a new
  // tab and refills the mug. That refill acknowledges the click, not a payment.

  if (donation && DONATION_URL) {
    const link = document.createElement('a');
    link.className = donation.className;
    link.id = donation.id;
    link.href = DONATION_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = donation.textContent;
    donation.replaceWith(link);
    link.addEventListener('click', refill, { signal });
    if (donationNote) donationNote.textContent = 'Opens in a new tab.';
  }

  /* Renderer ------------------------------------------------------------- */

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    showFallback(FALLBACK_TEXT.webgl);
    return api();
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
  camera.position.set(...CAMERA_POSITION);
  camera.lookAt(...CAMERA_TARGET);
  raycaster = new THREE.Raycaster();

  // Warm key light with a cyan fill, matching the workshop illustration.
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x33455a, 0.7));
  const key = new THREE.DirectionalLight(0xffd8a8, 1.6);
  key.position.set(3, 4, 2);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x66e8de, 0.55);
  fill.position.set(-3, 1, -1);
  scene.add(fill);

  function resize() {
    const size = Math.max(1, Math.round(canvas.getBoundingClientRect().width));
    renderer.setSize(size, size, false); // CSS controls the displayed size
    camera.left = -VIEW_HALF_SIZE; camera.right = VIEW_HALF_SIZE;
    camera.top = VIEW_HALF_SIZE; camera.bottom = -VIEW_HALF_SIZE;
    camera.updateProjectionMatrix();
    wake();
  }
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  // A lost WebGL context must not touch the sip count. Let the browser restore it.
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); stopLoop(); }, { signal });
  canvas.addEventListener('webglcontextrestored', wake, { signal });

  /* Model ----------------------------------------------------------------- */

  new GLTFLoader().load(MODEL_URL.href, onModelLoaded, undefined, () => showFallback(FALLBACK_TEXT.model));

  function onModelLoaded(gltf) {
    root = gltf.scene.getObjectByName('MugRoot') || gltf.scene;
    coffee = root.getObjectByName('Coffee');
    steam = [1, 2, 3].map(n => root.getObjectByName(`Steam_${n}`));
    if (!coffee || steam.some(s => !s)) { root = null; showFallback(FALLBACK_TEXT.model); return; }

    // Only the ceramic counts as "the mug" for clicks. Steam and empty canvas do not.
    solids = ['Mug_Body', 'Mug_Handle', 'Mug_Accent'].map(n => root.getObjectByName(n)).filter(Boolean);

    // Each ribbon gets its own material so it can fade independently.
    steam.forEach(s => {
      s.material = s.material.clone();
      s.material.transparent = true;
      s.material.depthWrite = false;
      s.userData.base = s.position.clone();
      s.userData.baseOpacity = s.material.opacity;
    });

    // A small pool of droplets for the splash. Recycled, never grows.
    const dropletGeometry = new THREE.IcosahedronGeometry(0.05, 0);
    for (let i = 0; i < 5; i++) {
      const material = new THREE.MeshStandardMaterial({ color: coffee.material.color, roughness: 0.35, transparent: true });
      const drop = new THREE.Mesh(dropletGeometry, material);
      drop.visible = false;
      drop.userData = { active: false, born: 0, velocity: new THREE.Vector3() };
      scene.add(drop);
      droplets.push(drop);
    }

    root.rotation.y = START_ROTATION;
    scene.add(gltf.scene);
    container.classList.add('is-ready');
    announce();
    wake();
  }

  /* Pointer: click to sip, drag to spin ----------------------------------- */

  function hitTest(event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x, y }, camera);
    return raycaster.intersectObjects(solids, false).length > 0;
  }

  canvas.addEventListener('pointerdown', event => {
    if (!root || event.button !== 0 || gesture.active || !hitTest(event)) return;
    if (!gesture.begin(event.pointerId, event.clientX, event.clientY, event.button)) return;
    try { canvas.setPointerCapture(event.pointerId); } catch { /* not critical */ }
    velocity = 0;
    lastMoveTime = performance.now();
    canvas.classList.add('is-grabbing');
  }, { signal });

  canvas.addEventListener('pointermove', event => {
    const dx = gesture.move(event.pointerId, event.clientX, event.clientY);
    if (dx === null || !gesture.dragging) return;
    const now = performance.now();
    const dt = Math.max(0.016, (now - lastMoveTime) / 1000);
    lastMoveTime = now;
    const delta = dx * DRAG_SENSITIVITY;
    root.rotation.y += delta;
    velocity = Math.max(-8, Math.min(8, delta / dt));
    maybeSplash(now);
    wake();
  }, { signal });

  canvas.addEventListener('pointerup', event => {
    const result = gesture.end(event.pointerId);
    if (result === null) return;
    canvas.classList.remove('is-grabbing');
    if (result === 'sip') takeSip();
    // After a drag the throw carries on, then eases back to the idle spin
    // in the direction the mug was thrown.
    if (result === 'drag' && velocity !== 0) idleDirection = Math.sign(velocity);
    wake();
  }, { signal });

  // Cancelled or captured-away pointers never count as a sip.
  const cancelGesture = () => { if (gesture.active) { gesture.cancel(); velocity = 0; canvas.classList.remove('is-grabbing'); } };
  canvas.addEventListener('pointercancel', cancelGesture, { signal });
  canvas.addEventListener('lostpointercapture', cancelGesture, { signal });

  /* Splash ------------------------------------------------------------------ */

  function maybeSplash(now) {
    if (reducedMotion.matches || sips.isEmpty || now < splashReadyAt || Math.abs(velocity) < SPLASH_SPEED) return;
    splashReadyAt = now + SPLASH_COOLDOWN_MS;
    const count = 3 + Math.floor(Math.random() * 3);
    const spin = Math.sign(velocity);
    let emitted = 0;
    for (const drop of droplets) {
      if (emitted >= count) break;
      if (drop.userData.active) continue;
      // Leave the rim on the side facing the camera, thrown the way the mug is turning.
      const azimuth = Math.PI / 4 + (Math.random() - 0.5) * 1.2;
      const rimY = 0.2 + 1.04 * level.value;
      drop.position.set(Math.sin(azimuth) * 0.7, rimY + 0.05, Math.cos(azimuth) * 0.7);
      drop.userData.velocity.set(
        Math.cos(azimuth) * spin * 1.4 + Math.sin(azimuth) * 0.6,
        1.6 + Math.random() * 0.6,
        -Math.sin(azimuth) * spin * 1.4 + Math.cos(azimuth) * 0.6
      );
      drop.scale.setScalar(0.8 + Math.random() * 0.5);
      drop.material.opacity = 1;
      drop.userData.active = true;
      drop.userData.born = now;
      drop.visible = true;
      emitted++;
    }
  }

  function updateDroplets(dt, now) {
    let anyActive = false;
    for (const drop of droplets) {
      if (!drop.userData.active) continue;
      const age = (now - drop.userData.born) / DROPLET_LIFE_MS;
      if (age >= 1) { drop.userData.active = false; drop.visible = false; continue; }
      anyActive = true;
      drop.userData.velocity.y -= 6 * dt;
      drop.position.addScaledVector(drop.userData.velocity, dt);
      drop.material.opacity = 1 - age;
      drop.scale.multiplyScalar(1 - dt * 2);
    }
    return anyActive;
  }

  /* Render loop --------------------------------------------------------------- */
  // Runs only while something is moving and the mug is on screen in a visible tab.

  function wake() {
    if (frame || !root || !onScreen || document.hidden || container.classList.contains('is-fallback')) return;
    lastFrameTime = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function stopLoop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function tick(now) {
    frame = 0;
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000); // clamp after a pause
    lastFrameTime = now;
    const keepGoing = update(dt, now);
    renderer.render(scene, camera);
    if (keepGoing) frame = requestAnimationFrame(tick);
  }

  function update(dt, now) {
    const shown = level.update(now);
    coffee.visible = shown > 0.008;
    coffee.scale.set(0.94 + 0.06 * shown, Math.max(0.001, shown), 0.94 + 0.06 * shown);

    // Left alone, the mug turns slowly. A throw eases back to that speed.
    // With reduced motion it stands still.
    if (!gesture.dragging) {
      const idle = reducedMotion.matches ? 0 : idleDirection * IDLE_SPIN_SPEED;
      velocity += (idle - velocity) * (1 - Math.exp(-dt * SPIN_SETTLE_RATE));
      if (Math.abs(velocity - idle) < 0.01) velocity = idle;
      root.rotation.y += velocity * dt;
    }

    // Steam: drifts and flickers while there is coffee, fades with the last sip.
    // Ribbons counter-rotate so they always face the camera.
    const strength = Math.min(1, shown * 3);
    const t = reducedMotion.matches ? 0 : now / 1000;
    const faceCamera = Math.PI / 4 - root.rotation.y;
    steam.forEach((s, i) => {
      s.visible = strength > 0.01;
      s.position.y = s.userData.base.y + Math.sin(t * 1.5 + i) * 0.08;
      s.position.x = s.userData.base.x + Math.sin(t * 1.2 + i * 2) * 0.05;
      s.rotation.y = faceCamera + Math.sin(t * 0.6 + i) * 0.25;
      s.material.opacity = s.userData.baseOpacity * strength * (0.75 + 0.25 * Math.sin(t * 2 + i));
    });

    const dropsMoving = updateDroplets(dt, now);
    const steamMoving = strength > 0.01 && !reducedMotion.matches;
    return !level.settled || gesture.dragging || velocity !== 0 || dropsMoving || steamMoving;
  }

  /* Pause when hidden or scrolled away ---------------------------------------- */

  visibilityObserver = new IntersectionObserver(entries => {
    onScreen = entries[0].isIntersecting;
    if (onScreen) wake(); else stopLoop();
  }, { threshold: 0.05 });
  visibilityObserver.observe(container);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopLoop(); else wake(); }, { signal });
  reducedMotion.addEventListener('change', () => { velocity = 0; level.snap(sips.level); wake(); }, { signal });

  /* Teardown ------------------------------------------------------------------- */

  function dispose() {
    stopLoop();
    aborter.abort();
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    steam.forEach(s => s.material.dispose());
    droplets.forEach(d => { d.material.dispose(); d.geometry.dispose(); });
    renderer?.dispose();
    delete container.dataset.mounted;
  }

  function api() {
    return { sip: takeSip, refill, get sips() { return sips.sips; }, dispose };
  }

  announce();
  return api();
}
