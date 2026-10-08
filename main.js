/* ===================================================================
   NewGameStudio main script

   1. The money modal: works on every page. The nav's "give us money"
      button opens it; Close, Escape or a click on the dimmed background
      closes it.
   2. The playtest modal (index.html only): the help-us-test section's
      button opens the questionnaire; it closes the same ways.
   3. The carousel: a filmstrip of every slide that drifts on its own and
      loops forever, with a round chevron at each end that steps one
      picture at a time (centre to centre), thumbnail previews, caption
      labels and a click-to-enlarge dialog. Only index.html has a
      carousel.
   4. The image preview dialog.
   5. The september moments frame: cycles the baked timeline images (index.html
      only), once its frames are all fetched and decoded.
   6. The header brand fade (index.html): while the page hero is on screen
      the header's own wordmark fades out and returns once it scrolls past.

   Settings you might want to change are at the top.
   =================================================================== */

const SWIPE_DISTANCE_PX = 45;    // how far a press may travel and still count as a click
const AUTO_SCROLL_PX_PER_S = 30; // the idle drift speed of the strip

const carousel = document.querySelector('.carousel');

// Shared by every self-driven animation: reduce motion means none.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Shared by both dialogs: a click on the dark area outside the dialog closes it.
function closeOnOutsideClick(dialog) {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    const outside = event.clientX < box.left || event.clientX > box.right ||
                    event.clientY < box.top || event.clientY > box.bottom;
    if (outside) dialog.close();
  });
}

/* 1. MONEY MODAL (every page) ======================================= */

const moneyDialog = document.querySelector('#money');

if (moneyDialog) {
  document.querySelector('#open-money').addEventListener('click', () => moneyDialog.showModal());
  moneyDialog.querySelector('.money-close').addEventListener('click', () => moneyDialog.close());
  closeOnOutsideClick(moneyDialog);
}

/* 2. PLAYTEST MODAL (index.html) ===================================== */

const testDialog = document.querySelector('#test');

if (testDialog) {
  document.querySelector('#open-test').addEventListener('click', () => testDialog.showModal());
  testDialog.querySelector('.money-close').addEventListener('click', () => testDialog.close());
  closeOnOutsideClick(testDialog);
}

/* 3. FILMSTRIP CAROUSEL (index.html) ================================ */

if (carousel) {

const strip = carousel.querySelector('.strip');
const stage = carousel.querySelector('.slide-stage');
const slides = [...carousel.querySelectorAll('.slide')];
const thumbRail = carousel.querySelector('.thumbnails');
const preview = document.querySelector('#preview');

// Images would otherwise start a native drag on mouse-down, which cancels the
// pointer events the click-to-enlarge handling below relies on.
slides.forEach(slide => { slide.querySelector('img').draggable = false; });

// One thumbnail button per slide. Clicking one scrolls the strip to the image.
const thumbs = slides.map((slide, index) => {
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);

  const thumb = document.createElement('button');
  thumb.type = 'button';
  thumb.className = 'thumb';
  thumb.setAttribute('aria-label', `Show ${slide.dataset.title}`);

  const image = document.createElement('img');
  image.src = slide.querySelector('img').src;
  image.alt = '';
  image.loading = 'lazy';
  thumb.append(image);

  thumb.addEventListener('click', () => {
    steeredAt = performance.now();
    // Centre the picture, same as a chevron press would.
    let left = (offsets[index] || 0) + slides[index].offsetWidth / 2 - stage.clientWidth / 2;
    if (loopW) left = ((left % loopW) + loopW) % loopW; // stay inside one copy of the loop
    strip.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  thumbRail.append(thumb);
  return thumb;
});

/* The seamless loop: one hidden copy of the list is appended, and the scroll
   position quietly jumps back one copy width each time it crosses the seam.
   The strip's content at s and at s + loopW is pixel-identical, so the jump
   is invisible — even in the middle of a trackpad fling. */
let loopW = 0;    // pixel width of one copy of the list
let offsets = []; // where each original slide sits inside the strip

function measure() {
  loopW = strip.scrollWidth / 2;
  offsets = slides.map(slide => slide.offsetLeft - slides[0].offsetLeft);
  expectedLeft = strip.scrollLeft;
}

// When the pictures do land (or fail), refine the geometry — widths are
// attribute-exact already, so this is a belt-and-braces re-measure. A broken
// file resolves too — one missing image must not stall the strip.
Promise.all(slides.map(slide => {
  const image = slide.querySelector('img');
  return image.complete ? null : new Promise(resolve => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  });
})).then(measure);

window.addEventListener('resize', measure, { passive: true });

/* The drift: the strip advances on its own unless the visitor is on it —
   pointer over the carousel, keyboard focus inside it, a press on the strip,
   the preview open — or the carousel is scrolled offscreen, or the visitor
   prefers reduced motion. */
let hovering = false;
let pressing = false;
let onScreen = true;
let previewOpen = false;
let steeredAt = -1e9; // last time the strip was sent somewhere on purpose

const drifting = () => !reducedMotion.matches && !hovering && !pressing && onScreen && !previewOpen &&
                       performance.now() - steeredAt > 1200;

// Any scroll movement the drift did not cause counts as steering too — a drag's
// momentum, a wheel or an in-flight smooth scroll — and buys another quiet
// second before the drift takes over again.
strip.addEventListener('scroll', () => {
  if (Math.abs(strip.scrollLeft - expectedLeft) > 1) steeredAt = performance.now();
}, { passive: true });

carousel.addEventListener('mouseenter', () => { hovering = true; });
carousel.addEventListener('mouseleave', () => { hovering = false; });
carousel.addEventListener('focusin', () => { hovering = true; });
carousel.addEventListener('focusout', () => { hovering = false; });
carousel.addEventListener('pointerdown', () => { pressing = true; });
window.addEventListener('pointerup', () => { pressing = false; });
new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }).observe(carousel);

let last = 0;
let active = -1; // which original slide is in view (the thumbnail rail follows it)
let expectedLeft = 0; // where the drift left the strip, so outside scrolls are recognised

// Boot now: the slide imgs wear width/height attributes, so the strip's
// geometry is real before any pixels arrive. Waiting for the images used to
// starve the whole carousel — the strip sits below the lazy-load line, so at
// page open no slide had even been requested: no clones, no drift, dead
// chevrons. (This must run after the drift state above is declared; the old
// boot hid inside a promise callback and never noticed.)
slides.forEach(slide => {
  const clone = slide.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.dataset.clone = 'true';
  clone.querySelector('img').draggable = false;
  strip.append(clone);
});
measure();
last = performance.now();
requestAnimationFrame(tick);

function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1); // clamp tab-switch gaps
  last = now;
  const s = strip.scrollLeft;
  if (Math.abs(s - expectedLeft) > 1) {
    // Something else is scrolling — a drag, a fling's momentum or one of the
    // smooth scrolls from the arrows and thumbnails. Hands off: writing the
    // position now would cancel that animation mid-flight. Drift resumes
    // once the strip settles where it was headed.
    expectedLeft = s;
  } else if (drifting()) {
    expectedLeft = s + AUTO_SCROLL_PX_PER_S * dt;
    strip.scrollLeft = expectedLeft;
  }

  // Wrap in both directions to keep the loop endless: the strip's home range
  // is [0, loopW). The upper bound alone does the work — 0 is a fine resting
  // place (same pixels as loopW), and folding it into the wrap made the boot
  // ping-pong 0 <-> loopW every frame while the drift sat offscreen. The lower
  // bound only catches rubber-band overscroll, which can report a negative
  // scrollLeft. The guard is paranoia beyond that: one copy of the list is
  // always far wider than any viewport.
  if (loopW > stage.clientWidth) {
    const cur = strip.scrollLeft;
    if (cur >= loopW) { strip.scrollLeft = cur - loopW; expectedLeft = strip.scrollLeft; }
    else if (cur < 0) { strip.scrollLeft = cur + loopW; expectedLeft = strip.scrollLeft; }
  }

  // Track which picture is in view (measured from the centre of the stage,
  // so "in view" means the same picture the chevrons would centre next) —
  // this keeps the thumbnails in step with manual scrolling, the drift and
  // the chevrons alike.
  const view = (strip.scrollLeft % (loopW || 1)) + stage.clientWidth * 0.5;
  let index = 0;
  while (index + 1 < slides.length && offsets[index + 1] <= view) index++;
  if (index !== active) {
    active = index;
    thumbs.forEach((thumb, i) => thumb.setAttribute('aria-current', String(i === active)));
  }

  requestAnimationFrame(tick);
}

// The chevrons: one press advances (or rewinds) exactly one picture, from
// centre of the picture in view to centre of the next — the shortest way
// around the loop in the pressed direction.
const slideCenter = i => offsets[i] + slides[i].offsetWidth / 2;
const scrollByPic = direction => {
  steeredAt = performance.now();
  if (!loopW) return;
  const centre = (strip.scrollLeft + stage.clientWidth / 2) % loopW;
  const next = (Math.max(active, 0) + direction + slides.length) % slides.length;
  let delta = (slideCenter(next) - centre) % loopW;
  if (direction > 0 && delta < 0) delta += loopW;
  if (direction < 0 && delta > 0) delta -= loopW;
  strip.scrollBy({ left: delta, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
};
document.querySelector('.strip-arrow--left').addEventListener('click', () => scrollByPic(-1));
document.querySelector('.strip-arrow--right').addEventListener('click', () => scrollByPic(1));

// Keyboard on the focused carousel: arrows scroll, Enter or Space enlarges
// the picture in view (only when the carousel itself has focus, not a button
// inside it).
carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    scrollByPic(event.key === 'ArrowRight' ? 1 : -1);
  } else if ((event.key === 'Enter' || event.key === ' ') && event.target === carousel) {
    event.preventDefault();
    openPreview(Math.max(active, 0));
  }
});

// A short press on a picture opens the preview; longer drags are the strip's
// own native scrolling and must not count as a click.
let pointerStart = null;
stage.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  pointerStart = { x: event.clientX, y: event.clientY };
});
stage.addEventListener('pointerup', event => {
  if (!pointerStart) return;
  const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  pointerStart = null;
  if (moved >= SWIPE_DISTANCE_PX) return;
  // The whole slide counts as the click target, caption label included.
  const slideEl = event.target.closest('.slide');
  if (!slideEl) return;
  const all = [...strip.querySelectorAll('.slide')];
  openPreview(all.indexOf(slideEl) % slides.length);
});
stage.addEventListener('pointercancel', () => { pointerStart = null; });


/* 4. IMAGE PREVIEW DIALOG =========================================== */

function openPreview(index) {
  const source = slides[index].querySelector('img');
  const target = preview.querySelector('img');
  target.src = source.src;
  target.alt = source.alt;
  document.querySelector('#preview-caption').textContent = slides[index].dataset.title;
  previewOpen = true;
  preview.showModal();
}

document.querySelector('#close-preview').addEventListener('click', () => preview.close());
preview.addEventListener('close', () => { previewOpen = false; });

// Clicking the dark area outside the dialog closes it.
closeOnOutsideClick(preview);

}


/* 5. SEPTEMBER MOMENTS ============================================== */

// The timeline's moments frame: swap which baked image is visible every
// MOMENT_MS. Reduced motion keeps the first frame (it ships visible in the
// HTML), like the carousel keeping its drift off.

const MOMENT_MS = 160; // how long each image is on screen

const momentBox = document.querySelector('.ngs-moment');
if (momentBox && !reducedMotion.matches) {
  const frames = [...momentBox.querySelectorAll('img')];

  // An unloaded frame paints an empty box, and at 160ms a lap is ~14s of
  // flicker while the frames trickle in — fine on localhost, a light show on
  // a deployed site. So the cycle waits for its pictures: as the reader
  // approaches, force every frame's fetch (lazy images with no box are a
  // browser mood, and setting loading=eager is the documented way to pull
  // them all at once), then start flipping only once every frame is fetched
  // AND decoded. Until then the first frame just sits there, like reduced
  // motion. A broken frame rejects decode() — allSettled keeps one missing
  // picture from stalling the other 85.
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    frames.forEach(frame => { frame.loading = 'eager'; });
    Promise.allSettled(frames.map(frame => frame.decode())).then(() => {
      let on = 0;
      setInterval(() => {
        frames[on].classList.remove('moment-on');
        on = (on + 1) % frames.length;
        frames[on].classList.add('moment-on');
      }, MOMENT_MS);
    });
  }, { rootMargin: '100% 0px' }).observe(momentBox);
}


/* 6. HEADER BRAND FADE (index.html) ================================== */

// While the page hero (wordmark + one-liner) is on screen, the header hides
// its own wordmark — same words twice looks like a bug. main.js only toggles
// the class; the fade itself is CSS. Reduced motion gets an instant swap via
// the global transition kill.
const heroMark = document.querySelector('.ngs-hero');
const headerBar = document.querySelector('.site-header');
if (heroMark && headerBar) {
  new IntersectionObserver(([entry]) => {
    headerBar.classList.toggle('at-hero', entry.isIntersecting);
  }).observe(heroMark);
}
