/* ===================================================================
   Practice easel for the Gallery section

   Loads easel-with-canvas.glb with Three.js and frames its canvas from a
   fixed camera. Press and drag on the canvas to draw; Reset clears it.
   Nothing is saved.

   Painting: a hidden 2D canvas (.easel-flat) is the paint buffer. In 3D it
   becomes a texture on a thin plane just in front of the model's canvas
   node, and only that plane is raycast. Without WebGL or the model, the
   buffer itself is shown flat with the same Reset button.

   Settings are just below.
   =================================================================== */

import * as THREE from 'three';
import { GLTFLoader } from '../coffee/vendor/GLTFLoader.js';


/* SETTINGS ============================================================ */

const MODEL_URL = new URL('./easel-with-canvas.glb', import.meta.url);
const CANVAS_NODE = 'easelCanvas';   // node in the GLB holding the stretched canvas (checked 16 Sep 2026)
const PAINT_WIDTH = 768;             // paint buffer size in pixels, 3:4 like the plane
const PAINT_HEIGHT = 1024;
const PAINT_COLOR = '#afa180';       // matches the model's canvasBase material, so a blank plane blends in
const INK_COLOR = '#1f1a17';
const BRUSH_PX = 14;                 // brush width in buffer pixels
const PLANE_INSET = 0.95;            // plane width as a fraction of the canvas box, leaving the edge visible
const PLANE_LIFT = 0.06;             // how far in front of the canvas face the plane sits, in box units (about 1mm)
const CAMERA_FOV = 20;               // a longer lens: gentler perspective, so the tray and legs do not splay
const CAMERA_DIRECTION = [-0.22, 0.10, 1]; // from the canvas centre toward the camera: a little left and above, so the canvas faces inward toward the page centre
const FRAME_MARGIN = 1.5;            // the canvas fills 2/3 of the shorter view axis, leaving room for the easel around it
const LOOK_DROP = 0.12;              // aim below the canvas centre so the tray, lower beam and legs show under it
const MAX_PIXEL_RATIO = 1.75;


/* MOUNT =============================================================== */

/**
 * Wires up the easel inside `container` (the #practice-easel element).
 * Returns { reset, mode, dispose }. Safe to call once per element.
 */
export function mountPracticeEasel(container) {
  if (!container || container.dataset.mounted) return null;
  container.dataset.mounted = 'true';

  const stage = container.querySelector('.easel-stage');
  const glCanvas = container.querySelector('.easel-canvas');
  const paint = container.querySelector('.easel-flat');
  const resetButton = container.querySelector('[data-action="reset"]');

  const aborter = new AbortController();
  const signal = aborter.signal;

  let mode = 'loading'; // 'loading' | '3d' | 'flat' | 'static'
  let renderer = null, scene, camera, raycaster, texture = null, plane = null;
  let frame = 0, dirty = true, onScreen = true;
  let drawing = null; // { id, last: {x, y} | null }
  let resizeObserver = null, visibilityObserver = null;

  /* Paint buffer ----------------------------------------------------- */

  paint.width = PAINT_WIDTH;
  paint.height = PAINT_HEIGHT;
  const ink = paint.getContext('2d');
  if (!ink) { showStatic(); return api(); }

  function clearPaint() {
    ink.fillStyle = PAINT_COLOR;
    ink.fillRect(0, 0, PAINT_WIDTH, PAINT_HEIGHT);
    markDirty();
  }

  // Draws a round dot, or a segment from `from` when given. Segments are
  // what keep fast strokes continuous.
  function strokeTo(point, from) {
    ink.strokeStyle = INK_COLOR;
    ink.lineWidth = BRUSH_PX;
    ink.lineCap = 'round';
    ink.lineJoin = 'round';
    ink.beginPath();
    ink.moveTo(from ? from.x : point.x, from ? from.y : point.y);
    ink.lineTo(point.x, point.y);
    ink.stroke();
    markDirty();
  }

  function markDirty() {
    dirty = true;
    if (texture) texture.needsUpdate = true;
    wake();
  }

  clearPaint();
  resetButton.addEventListener('click', () => { clearPaint(); }, { signal });

  /* Modes ------------------------------------------------------------- */

  function showFlat() {
    mode = 'flat';
    container.classList.add('is-flat');
    paint.hidden = false;
    stopLoop();
  }

  function showStatic() {
    mode = 'static';
    container.classList.add('is-static');
    stopLoop();
  }

  /* Pointer: press and drag to draw ------------------------------------ */
  // Listeners sit on the stage so the same code serves 3D and flat modes.

  function toPaint(event) {
    if (mode === 'flat') {
      const rect = paint.getBoundingClientRect();
      const u = (event.clientX - rect.left) / rect.width;
      const v = (event.clientY - rect.top) / rect.height;
      if (u < 0 || u > 1 || v < 0 || v > 1) return null;
      return { x: u * PAINT_WIDTH, y: v * PAINT_HEIGHT };
    }
    if (mode !== '3d') return null;
    const rect = glCanvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x, y }, camera);
    const hit = raycaster.intersectObject(plane, false)[0];
    if (!hit || !hit.uv) return null;
    // Plane UVs run left to right and bottom to top; the buffer's y runs down.
    return { x: hit.uv.x * PAINT_WIDTH, y: (1 - hit.uv.y) * PAINT_HEIGHT };
  }

  stage.addEventListener('pointerdown', event => {
    if (drawing || event.button !== 0) return;
    const point = toPaint(event);
    if (!point) return;
    event.preventDefault();
    try { stage.setPointerCapture(event.pointerId); } catch { /* not critical */ }
    drawing = { id: event.pointerId, last: point };
    strokeTo(point);
  }, { signal });

  stage.addEventListener('pointermove', event => {
    if (!drawing || event.pointerId !== drawing.id) return;
    const point = toPaint(event);
    if (!point) { drawing.last = null; return; } // left the canvas: the stroke ends here
    strokeTo(point, drawing.last);             // came back: a fresh dot, no line across the canvas
    drawing.last = point;
  }, { signal });

  const endStroke = event => { if (drawing && event.pointerId === drawing.id) drawing = null; };
  stage.addEventListener('pointerup', endStroke, { signal });
  stage.addEventListener('pointercancel', endStroke, { signal });
  stage.addEventListener('lostpointercapture', endStroke, { signal });

  /* Renderer ------------------------------------------------------------- */

  try {
    renderer = new THREE.WebGLRenderer({ canvas: glCanvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    showFlat();
    return api();
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 20);
  raycaster = new THREE.Raycaster();

  // Warm key light with a cyan fill, the same recipe as the coffee mug.
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x33455a, 0.9));
  const key = new THREE.DirectionalLight(0xffd8a8, 1.7);
  key.position.set(2.5, 4, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x66e8de, 0.5);
  fill.position.set(-3, 1.5, 1);
  scene.add(fill);

  function resize() {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false); // CSS controls the displayed size
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    frameCanvas();
    markDirty();
  }
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  glCanvas.addEventListener('webglcontextlost', event => { event.preventDefault(); stopLoop(); }, { signal });
  glCanvas.addEventListener('webglcontextrestored', markDirty, { signal });

  /* Model ----------------------------------------------------------------- */

  new GLTFLoader().load(MODEL_URL.href, onModelLoaded, undefined, () => showFlat());

  function onModelLoaded(gltf) {
    const canvasNode = gltf.scene.getObjectByName(CANVAS_NODE);
    if (!canvasNode) { console.warn(`Easel model has no "${CANVAS_NODE}" node.`); showFlat(); return; }

    // The paint plane is a child of the canvas node, so it inherits the node's
    // position and tilt. The node is a unit box scaled to the canvas size, so
    // plane sizes here are in box units: 2 is the full width.
    const { x: sx, y: sy } = canvasNode.scale;
    const planeWidth = 2 * PLANE_INSET;
    const planeHeight = planeWidth * (sx / sy) * (PAINT_HEIGHT / PAINT_WIDTH);
    texture = new THREE.CanvasTexture(paint);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const material = new THREE.MeshStandardMaterial({
      map: texture, roughness: 0.95, metalness: 0,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });
    plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight), material);
    plane.position.set(0, 0, 1 + PLANE_LIFT);
    canvasNode.add(plane);

    scene.add(gltf.scene);
    mode = '3d';
    container.classList.add('is-ready');
    resize();
  }

  // Places the camera so the paint plane fills most of the view, from a fixed angle.
  function frameCanvas() {
    if (!plane) return;
    plane.updateWorldMatrix(true, false);
    const centre = new THREE.Vector3().setFromMatrixPosition(plane.matrixWorld);
    const size = new THREE.Vector3(plane.geometry.parameters.width, plane.geometry.parameters.height, 0)
      .multiply(plane.parent.getWorldScale(new THREE.Vector3()));
    const halfTan = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2));
    const distForHeight = (size.y * FRAME_MARGIN / 2) / halfTan;
    const distForWidth = (size.x * FRAME_MARGIN / 2) / (halfTan * camera.aspect);
    const distance = Math.max(distForHeight, distForWidth);
    const direction = new THREE.Vector3(...CAMERA_DIRECTION).normalize();
    camera.position.copy(centre).addScaledVector(direction, distance);
    camera.lookAt(centre.x, centre.y - LOOK_DROP, centre.z);
  }

  /* Render on demand ----------------------------------------------------- */
  // Nothing moves on its own, so a frame is drawn only after a change.

  function wake() {
    if (frame || mode !== '3d' || !dirty || !onScreen || document.hidden) return;
    frame = requestAnimationFrame(render);
  }

  function stopLoop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function render() {
    frame = 0;
    dirty = false;
    renderer.render(scene, camera);
  }

  visibilityObserver = new IntersectionObserver(entries => {
    onScreen = entries[0].isIntersecting;
    if (onScreen) wake(); else stopLoop();
  }, { threshold: 0.05 });
  visibilityObserver.observe(container);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopLoop(); else wake(); }, { signal });

  /* Teardown ------------------------------------------------------------- */

  function dispose() {
    stopLoop();
    aborter.abort();
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    texture?.dispose();
    plane?.geometry.dispose();
    plane?.material.dispose();
    renderer?.dispose();
    delete container.dataset.mounted;
  }

  function api() {
    return { reset: clearPaint, get mode() { return mode; }, dispose };
  }

  return api();
}
