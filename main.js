/* ===================================================================
   NewGameStudio main script

   1. Carousel: builds thumbnails from the slides in index.html,
      the "Auto-play screenshots" switch, previous/next buttons, keyboard arrows, swipe.
   2. Image preview dialog (the enlarge button).
   3. Logo joke tooltip.

   The occasional SCOPE thought over the workshop picture lives in its own
   file, workshop-scope.js.

   Settings you might want to change are at the top.
   =================================================================== */

const AUTOPLAY_INTERVAL_MS = 4500; // time between slides
const SWIPE_DISTANCE_PX = 45;      // how far a finger must travel to count as a swipe
const LOGO_JOKE_VISIBLE_MS = 3500; // how long the joke stays open after tapping the logo


/* 1. CAROUSEL ======================================================= */

const carousel = document.querySelector('.carousel');
const slideStage = carousel.querySelector('.slide-stage');
const slides = [...carousel.querySelectorAll('.slide')];
const thumbRail = carousel.querySelector('.thumbnails');
const caption = carousel.querySelector('.slide-caption');
const slideTitle = document.querySelector('#slide-title');
const slideCount = document.querySelector('#slide-count');
const autoplayButton = document.querySelector('#autoplay');
const preview = document.querySelector('#preview');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let current = 0;
let playing = false; // browsing is manual until the auto-play switch is pressed
let hovering = false;
let focused = false;
let visible = true;
let timer;

// Build one thumbnail button per slide and give each slide its accessibility labels.
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

  thumb.addEventListener('click', () => manualSlide(index));
  thumbRail.append(thumb);
  return thumb;
});

// Start or stop the autoplay timer depending on the current situation.
function schedule() {
  clearInterval(timer);
  autoplayButton.textContent = playing ? 'Pause auto-play' : 'Auto-play screenshots';
  autoplayButton.setAttribute('aria-pressed', String(playing));
  caption.setAttribute('aria-live', playing && !focused ? 'off' : 'polite');

  const shouldRun = playing && !hovering && !focused && visible && !document.hidden && !preview.open;
  if (shouldRun) {
    timer = setInterval(() => showSlide(current + 1), AUTOPLAY_INTERVAL_MS);
  }
}

function showSlide(index) {
  current = (index + slides.length) % slides.length; // wraps around at both ends

  slides.forEach((slide, i) => {
    const isCurrent = i === current;
    slide.classList.toggle('active', isCurrent);
    slide.setAttribute('aria-hidden', String(!isCurrent));
    thumbs[i].setAttribute('aria-current', String(isCurrent));
  });

  slideTitle.textContent = slides[current].dataset.title;
  slideCount.textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;

  // Scroll the thumbnail strip so the current thumbnail is centred.
  const thumb = thumbs[current];
  const left = thumb.offsetLeft - thumbRail.offsetLeft - (thumbRail.clientWidth - thumb.clientWidth) / 2;
  thumbRail.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

// Any manual navigation stops autoplay until the switch is pressed again.
function manualSlide(index) {
  playing = false;
  showSlide(index);
  schedule();
}

document.querySelector('#previous-slide').addEventListener('click', () => manualSlide(current - 1));
document.querySelector('#next-slide').addEventListener('click', () => manualSlide(current + 1));
autoplayButton.addEventListener('click', () => { playing = !playing; schedule(); });

// Pause while the mouse is over the carousel or something inside it has focus.
carousel.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') { hovering = true; schedule(); }
});
carousel.addEventListener('pointerleave', () => { hovering = false; schedule(); });
carousel.addEventListener('focusin', () => { focused = true; schedule(); });
carousel.addEventListener('focusout', event => {
  if (!carousel.contains(event.relatedTarget)) { focused = false; schedule(); }
});

// Keyboard: left and right arrows.
carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    manualSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
  }
});

// Touch: swipe left or right on the image.
let touchStart = null;
slideStage.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
});
slideStage.addEventListener('pointerup', event => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  if (Math.abs(dx) > SWIPE_DISTANCE_PX && Math.abs(dx) > Math.abs(dy)) {
    manualSlide(current + (dx < 0 ? 1 : -1));
  }
  touchStart = null;
});
slideStage.addEventListener('pointercancel', () => { touchStart = null; });

// Pause when the tab is hidden, when the carousel is scrolled off screen,
// or when the visitor turns on reduced motion.
document.addEventListener('visibilitychange', schedule);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) playing = false;
  schedule();
});
new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  schedule();
}, { threshold: 0.15 }).observe(carousel);


/* 2. IMAGE PREVIEW DIALOG =========================================== */

document.querySelector('#open-preview').addEventListener('click', () => {
  const source = slides[current].querySelector('img');
  const target = preview.querySelector('img');
  target.src = source.src;
  target.alt = source.alt;
  document.querySelector('#preview-caption').textContent = slides[current].dataset.title;
  preview.showModal();
  schedule();
});

document.querySelector('#close-preview').addEventListener('click', () => preview.close());
preview.addEventListener('close', schedule);

// Clicking the dark area outside the dialog closes it.
preview.addEventListener('click', event => {
  if (event.target !== preview) return;
  const box = preview.getBoundingClientRect();
  const outside = event.clientX < box.left || event.clientX > box.right ||
                  event.clientY < box.top || event.clientY > box.bottom;
  if (outside) preview.close();
});


/* 3. LOGO JOKE ====================================================== */
// Hover or focus shows the joke (handled in CSS). Tapping the logo shows it
// for a few seconds. Escape or tapping elsewhere dismisses it until the
// pointer leaves and comes back.

const logos = [...document.querySelectorAll('.logo-wrap')];

logos.forEach(logo => {
  let timeout;
  logo.querySelector('button').addEventListener('click', () => {
    clearTimeout(timeout);
    logo.classList.remove('dismissed');
    logo.classList.add('joke-open');
    timeout = setTimeout(() => logo.classList.remove('joke-open'), LOGO_JOKE_VISIBLE_MS);
  });
  ['pointerenter', 'pointerleave', 'focusin', 'focusout'].forEach(type => {
    logo.addEventListener(type, () => logo.classList.remove('dismissed'));
  });
});

function dismissJokes() {
  logos.forEach(logo => {
    logo.classList.remove('joke-open');
    logo.classList.add('dismissed');
  });
}
document.addEventListener('keydown', event => { if (event.key === 'Escape') dismissJokes(); });
document.addEventListener('pointerdown', event => {
  if (!logos.some(logo => logo.contains(event.target))) dismissJokes();
});


/* START ============================================================= */

showSlide(0);
schedule();
