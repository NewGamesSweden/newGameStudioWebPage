/* ===================================================================
   The rocket: leaves the workshop, comes back to push SCOPE away

   Two scenes, one controller.
   1. Hero launch. A small rocket picture sits on the workshop shelf (placed
      by style.css, so it is there without JavaScript). Scrolling lifts it
      off, leans it right and takes it off the edge before the Gallery
      section arrives. Scrolling back brings it home.
   2. Workbench scene. On desktop the section becomes a tall scroll track
      with a sticky stage. Scroll progress grows SCOPE about its centre,
      brings the side-on rocket in from the right edge, pushes SCOPE off
      the left edge on contact and settles the rocket with the two projects
      readable on its hull.

   Both scenes are driven by scrollY, eased over a few frames so wheel
   notches glide instead of stepping; they always converge on the exact
   state for the current scroll position, so reverse scrolling, fast
   scrolling and reloading mid-way all land right. Reduced motion, phones,
   no JavaScript and a missing rocket picture all get the plain layout.

   Settings are at the top.
   =================================================================== */

(() => {
  const SMOOTH_TIME = 0.09;   // seconds for the scenes to catch up with the scroll; 0 is instant
  const FLIGHT_END_GAP = 40;  // the flight is over when the Gallery section's top is this far under the header
  const FLIGHT_LIFT = 0.3;    // how high the rocket climbs on screen, as a fraction of the viewport height
  const MAX_BANK = 82;        // degrees the rocket may lean while flying (90 would be flat)
  const BANK_BIAS = 14;       // extra lean to the right, so it reads as heading off rather than climbing

  // Workbench phases, as fractions of the section's scroll track.
  const PHASE = { scopeStart: 0.12, scopeFull: 0.45, rocketEnter: 0.45, rocketPush: 0.62, settle: 0.82 };
  const FRAME_MAX = 1280;        // SCOPE and the rocket are sized against the page column, not the whole viewport
  const SCOPE_MAX_WIDTH = 0.8;   // SCOPE grows to this fraction of the frame width
  const SCOPE_START_PX = 26;     // height of the small SCOPE already on stage before it grows
  const ROCKET_PEEK = 0.08;      // how far the nose is in by the end of the "dominance" phase, of the frame width
  const CONTACT_PX = 120;        // over this much push SCOPE reaches its full tilt and squash

  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const header = document.querySelector('.site-header');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 700px)');

  /* Render loop: one frame per scroll or resize, more while easing ------- */

  let queued = 0, lastFrame = 0;
  const shown = { flight: null, scene: null }; // eased progress, null until the first frame snaps it

  function requestRender() {
    if (!queued && !document.hidden) queued = requestAnimationFrame(render);
  }

  function render(now) {
    queued = 0;
    const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1;
    lastFrame = now;
    const k = SMOOTH_TIME > 0 && !reducedMotion.matches ? 1 - Math.exp(-dt / SMOOTH_TIME) : 1;
    let busy = false;

    const ease = (key, target) => {
      let value = shown[key] === null ? target : shown[key] + (target - shown[key]) * k;
      if (Math.abs(target - value) < 0.0005) value = target; else busy = true;
      shown[key] = value;
      return value;
    };

    if (flight) renderFlight(ease('flight', flightProgress()));
    if (scene) renderScene(ease('scene', sceneProgress()));

    if (busy) requestRender(); else lastFrame = 0;
  }

  /* 1. Hero launch ---------------------------------------------------- */

  const workshopImg = document.querySelector('.workshop img');
  const flyer = document.querySelector('.rocket-flyer');
  const flyerImg = flyer?.querySelector('img');
  const games = document.querySelector('#games');
  let flight = null; // measured: shelf position in page pixels, sprite size, end of the flight

  if (flyerImg && !flyerImg.complete) flyerImg.addEventListener('load', measure, { once: true });

  // The picture is object-fit: contain, so work out the box the pixels actually fill.
  function paintedBox(img) {
    const box = img.getBoundingClientRect();
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : box.width / box.height;
    let width = box.width, height = box.width / ratio;
    if (height > box.height) { height = box.height; width = box.height * ratio; }
    return { left: box.left + (box.width - width) / 2, top: box.top + (box.height - height) / 2, width, height };
  }

  function measureFlight() {
    flight = null;
    if (!flyer || !flyerImg || !workshopImg || !games || reducedMotion.matches) return;
    if (!flyerImg.complete || !flyerImg.naturalWidth) return; // no rocket picture: nothing flies
    // Read the resting position style.css gives the sprite on the shelf.
    const wasFlying = flyer.classList.contains('is-flying');
    flyer.classList.remove('is-flying');
    flyer.style.transform = ''; flyer.style.width = ''; flyer.style.height = '';
    const sprite = paintedBox(flyerImg);
    if (wasFlying) flyer.classList.add('is-flying');
    const headerHeight = header ? header.offsetHeight : 0;
    const gamesTop = games.getBoundingClientRect().top + scrollY;
    flight = {
      originX: sprite.left,
      originY: sprite.top + scrollY,
      width: sprite.width,
      height: sprite.height,
      endScroll: gamesTop - headerHeight - FLIGHT_END_GAP,
      lift: innerHeight * FLIGHT_LIFT,
    };
  }

  const flightProgress = () => (flight.endScroll > 0 ? clamp(scrollY / flight.endScroll) : 1);

  function renderFlight(p) {
    if (p <= 0.001) { // back on the shelf: let the stylesheet place it
      flyer.hidden = false;
      flyer.classList.remove('is-flying');
      flyer.style.transform = ''; flyer.style.width = ''; flyer.style.height = '';
      flyer.style.setProperty('--flame', '0');
      return;
    }
    if (p >= 1) { flyer.hidden = true; return; }
    flyer.hidden = false;
    flyer.classList.add('is-flying');
    flyer.style.width = `${flight.width}px`;
    flyer.style.height = `${flight.height}px`;
    // A screen-space curve from the shelf: up and to the right, then dipping as it leaves
    // past the right edge.
    const exitX = innerWidth - flight.originX + flight.width * 2;
    const R = flight.lift;
    const p1 = { x: exitX * 0.3, y: -R }, p2 = { x: exitX, y: R * 0.35 };
    const q = 1 - p;
    const x = 2 * q * p * p1.x + p * p * p2.x;
    const y = 2 * q * p * p1.y + p * p * p2.y;
    const dx = 2 * q * p1.x + 2 * p * (p2.x - p1.x);
    const dy = 2 * q * p1.y + 2 * p * (p2.y - p1.y);
    const heading = Math.atan2(dy, dx) * 180 / Math.PI + 90; // 0 is straight up
    const liftOff = clamp(p * 5);                              // the first fifth of the flight is the take-off
    const bank = clamp(heading + BANK_BIAS, -MAX_BANK, MAX_BANK) * liftOff;
    const grow = 1 + 1.2 * p; // it comes toward the viewer as it leaves
    // Before lift-off it still scrolls with the page; in flight it holds its own screen path.
    const screenY = flight.originY - scrollY * (1 - liftOff) + y;
    flyer.style.transform = `translate(${flight.originX + x}px, ${screenY}px) rotate(${bank}deg) scale(${grow})`;
    flyer.style.setProperty('--flame', liftOff.toFixed(2)); // engine on once it leaves the shelf
  }

  /* 2. Workbench scene ------------------------------------------------ */

  const section = document.querySelector('#workbench');
  const stage = section?.querySelector('.workbench-stage');
  const scope = section?.querySelector('.workbench-scope');
  const carrier = section?.querySelector('.workbench-rocket');
  const art = carrier?.querySelector('.workbench-rocket-art');
  const copy = carrier?.querySelector('.workbench-copy');
  let artReady = false;
  let sceneOn = false;
  let scene = null; // measured: section top, track length, stage and frame widths, SCOPE and carrier sizes

  if (section && art) {
    const onArt = () => { artReady = true; syncScene(); };
    if (art.complete && art.naturalWidth) onArt();
    else { art.addEventListener('load', onArt, { once: true }); art.addEventListener('error', () => { artReady = false; syncScene(); }, { once: true }); }
  }

  // The scene runs only on wider screens, without reduced motion, and with the rocket art loaded.
  function syncScene() {
    const on = artReady && !phone.matches && !reducedMotion.matches;
    if (on === sceneOn) return;
    sceneOn = on;
    section.classList.toggle('is-scene', on);
    if (!on) { scope.style.cssText = ''; carrier.style.transform = ''; copy.style.opacity = ''; scene = null; }
    measure();
  }

  function measureScene() {
    if (!sceneOn) { scene = null; return; }
    const headerHeight = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--header-h', `${headerHeight}px`);
    const rect = section.getBoundingClientRect();
    const stageW = stage.clientWidth;
    const frameW = Math.min(stageW, FRAME_MAX);
    // SCOPE is laid out at its full size and only ever scaled down, so the browser can keep one
    // crisp texture of it instead of re-rasterising the word on every frame.
    scope.style.fontSize = '100px';
    const widthAt100 = scope.offsetWidth;
    const fontSize = 100 * (frameW * SCOPE_MAX_WIDTH) / widthAt100;
    scope.style.fontSize = `${fontSize}px`;
    scene = {
      start: rect.top + scrollY - headerHeight,          // the stage sticks here
      track: Math.max(1, section.offsetHeight - stage.offsetHeight),
      stageW,                                             // the whole viewport: the rocket enters from its edge
      frameW,                                             // the page column: SCOPE and the rocket are sized to it
      scopeW: scope.offsetWidth,                          // full-size width; offsetWidth ignores transforms
      scopeMinScale: SCOPE_START_PX / fontSize,
      carrierW: carrier.offsetWidth,
    };
  }

  const sceneProgress = () => clamp((scrollY - scene.start) / scene.track);

  function renderScene(p) {
    const { stageW, frameW, scopeW, scopeMinScale, carrierW } = scene;

    // SCOPE sits small on the stage from the start, then grows to full size about its centre.
    let scale = scopeMinScale, opacity = 1;
    if (p >= PHASE.scopeStart) {
      const t = clamp((p - PHASE.scopeStart) / (PHASE.scopeFull - PHASE.scopeStart));
      scale = scopeMinScale + (1 - scopeMinScale) * easeOut(t);
    }

    // The rocket: nose peeks in from the viewport's right edge, then travels left and settles centred.
    let carrierX = stageW; // fully off the right edge
    if (p >= PHASE.rocketEnter) {
      const peek = frameW * ROCKET_PEEK;
      if (p < PHASE.rocketPush) {
        carrierX = stageW - peek * easeInOut(clamp((p - PHASE.rocketEnter) / (PHASE.rocketPush - PHASE.rocketEnter)));
      } else {
        const settled = (stageW - carrierW) / 2;
        const t = easeInOut(clamp((p - PHASE.rocketPush) / (PHASE.settle - PHASE.rocketPush)));
        carrierX = (stageW - peek) + (settled - (stageW - peek)) * t;
      }
    }

    // Contact: once the nose reaches SCOPE's right edge, SCOPE is shoved along with it.
    const scopeRight = stageW / 2 + (scopeW * scale) / 2;
    let shift = 0, tilt = 0, squash = 1;
    if (carrierX < scopeRight) {
      shift = scopeRight - carrierX;
      const force = clamp(shift / CONTACT_PX);
      tilt = -4 * force;
      squash = 1 - 0.06 * force;
    }
    // After settling, the last of the word slides off and fades.
    if (p > PHASE.settle) {
      const t = clamp((p - PHASE.settle) / (1 - PHASE.settle));
      shift += stageW * 0.15 * t;
      opacity *= 1 - t;
    }

    scope.style.opacity = opacity.toFixed(3);
    scope.style.transform = `translate(calc(-50% - ${shift.toFixed(1)}px), -50%) rotate(${tilt.toFixed(2)}deg) scale(${(scale * squash).toFixed(4)}, ${scale.toFixed(4)})`;
    carrier.style.transform = `translate(${carrierX.toFixed(1)}px, -50%)`;
    copy.style.opacity = p < PHASE.settle ? '0' : clamp((p - PHASE.settle) / 0.12).toFixed(3);
  }

  /* Shared wiring ------------------------------------------------------- */

  function measure() {
    measureFlight();
    measureScene();
    requestRender();
  }

  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('load', measure);
  document.fonts?.ready.then(measure);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) measure(); });
  phone.addEventListener('change', syncScene);
  reducedMotion.addEventListener('change', () => { syncScene(); measure(); });
  if (workshopImg) new ResizeObserver(measure).observe(workshopImg);
  if (stage) new ResizeObserver(measure).observe(stage);
  syncScene();
  measure();
})();
