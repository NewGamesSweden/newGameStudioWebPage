/* ===================================================================
   The SCOPE thought over the workshop picture

   Now and then a small SCOPE appears above the developers, inflates far
   past its size, pops, and a sheepish "scope." takes its place. Sometimes
   "just one more feature" follows. Decorative only: nothing to click, no
   sound, no layout shift, hidden from screen readers. It runs only while
   the picture is on screen in a visible tab; under reduced motion
   style.css shows a still "scope." instead.

   The animation is in style.css, section 4b. This file picks the moment
   and the spot. Settings are at the top.
   =================================================================== */

(() => {
  const SEQUENCE_MS = 4000;          // one appearance, must match the keyframe duration in style.css
  const FIRST_DELAY_MS = 4500;       // quiet time after the picture comes on screen
  const QUIET_MIN_MS = 10500;        // quiet time between appearances: 10.5 to 18 seconds,
  const QUIET_EXTRA_MS = 7500;       //   so one thought every 14.5 to 22 seconds
  const ECHO_CHANCE = 0.35;          // how often the "just one more feature" afterthought follows
  const HOVER_ECHO_MS = 1600;        // pointing at the word while it plays shows the afterthought once, this long

  // Spots as percentages of the picture: in the air above the desk, clear of
  // faces and screens.
  const POSITIONS = [
    { x: 23, y: 8 },
    { x: 60, y: 6 },
    { x: 78, y: 7 },
  ];

  const workshop = document.querySelector('.workshop');
  const cloud = workshop?.querySelector('.scope-cloud');
  if (!cloud) return;

  const thought = cloud.querySelector('.scope-thought');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let startTimer = 0;
  let endTimer = 0;
  let echoTimer = 0;
  let onScreen = false;
  let previous = -1;

  const allowed = () => onScreen && !document.hidden && !reducedMotion.matches;

  function stop() {
    clearTimeout(startTimer);
    clearTimeout(endTimer);
    clearTimeout(echoTimer);
    startTimer = endTimer = echoTimer = 0;
    cloud.classList.remove('is-playing', 'has-echo', 'is-echoing');
  }

  // Pointing at the word while it is up shows the afterthought once.
  thought.addEventListener('pointerenter', () => {
    if (!cloud.classList.contains('is-playing')) return;
    if (cloud.classList.contains('has-echo') || cloud.classList.contains('is-echoing')) return;
    cloud.classList.add('is-echoing');
    echoTimer = setTimeout(() => cloud.classList.remove('is-echoing'), HOVER_ECHO_MS);
  });

  function schedule(delay) {
    clearTimeout(startTimer);
    if (allowed()) startTimer = setTimeout(play, delay);
  }

  function play() {
    if (!allowed()) return;

    // Never the same spot twice in a row.
    let index = Math.floor(Math.random() * POSITIONS.length);
    if (index === previous) index = (index + 1) % POSITIONS.length;
    previous = index;

    cloud.style.setProperty('--thought-x', `${POSITIONS[index].x}%`);
    cloud.style.setProperty('--thought-y', `${POSITIONS[index].y}%`);
    cloud.classList.toggle('has-echo', Math.random() < ECHO_CHANCE);
    cloud.classList.add('is-playing');

    endTimer = setTimeout(() => {
      clearTimeout(echoTimer);
      cloud.classList.remove('is-playing', 'has-echo', 'is-echoing');
      schedule(QUIET_MIN_MS + Math.random() * QUIET_EXTRA_MS);
    }, SEQUENCE_MS);
  }

  // Start over whenever the situation changes (scrolled into view, tab shown, motion setting).
  function sync() {
    stop();
    if (allowed()) schedule(FIRST_DELAY_MS);
  }

  new IntersectionObserver(entries => {
    onScreen = entries[0].isIntersecting;
    sync();
  }, { threshold: 0.25 }).observe(workshop);

  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', sync);
})();
