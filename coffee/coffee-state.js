/* ===================================================================
   Coffee mug: the rules, with no graphics in them

   Three small pieces that coffee-mug.js puts together:
   1. createSipState  - how many sips are left. The one source of truth.
   2. createGesture   - decides whether a pointer press was a click (sip)
                        or a drag (spin). Ignores extra fingers and buttons.
   3. createLevelAnimator - eases the visible liquid level toward the
                        real level so rapid clicks never look wrong.

   This file has no DOM or Three.js in it, so it can be tested with Node:
       node --test "coffee/tests/*.test.mjs"
   =================================================================== */

export const SIPS_WHEN_FULL = 3;

/* 1. Sips ----------------------------------------------------------- */
export function createSipState(full = SIPS_WHEN_FULL) {
  let sips = full;
  return {
    get sips() { return sips; },
    get isEmpty() { return sips === 0; },
    /** Fraction of coffee that should be shown: 1, 2/3, 1/3, 0. */
    get level() { return sips / full; },
    /** Returns true if a sip was actually taken. */
    sip() {
      if (sips === 0) return false;
      sips -= 1;
      return true;
    },
    /** Only the donation button (or a page refresh) should call this. */
    refill() { sips = full; },
    /** Text for the status line. */
    label() {
      if (sips === 0) return 'Out of coffee. Scope remains unlimited.';
      return `${sips} ${sips === 1 ? 'sip' : 'sips'} left`;
    },
  };
}

/* 2. Gesture --------------------------------------------------------- */
/**
 * Tracks a single owning pointer. Movement past `thresholdPx` at any point
 * turns the press into a drag, and it stays a drag even if the pointer
 * comes back to where it started.
 */
export function createGesture(thresholdPx = 7) {
  let owner = null;
  return {
    get active() { return owner !== null; },
    get dragging() { return owner !== null && owner.drag; },
    /** Returns true if this pointer now owns the interaction. */
    begin(pointerId, x, y, button = 0) {
      if (owner !== null || button !== 0) return false;
      owner = { id: pointerId, startX: x, startY: y, lastX: x, drag: false };
      return true;
    },
    /** Returns horizontal movement since the last move, or null if not ours. */
    move(pointerId, x, y) {
      if (owner === null || pointerId !== owner.id) return null;
      if (Math.hypot(x - owner.startX, y - owner.startY) > thresholdPx) owner.drag = true;
      const dx = x - owner.lastX;
      owner.lastX = x;
      return owner.drag ? dx : 0;
    },
    /** Returns 'sip', 'drag' or null (not our pointer). */
    end(pointerId) {
      if (owner === null || pointerId !== owner.id) return null;
      const result = owner.drag ? 'drag' : 'sip';
      owner = null;
      return result;
    },
    /** Pointer lost or cancelled: never counts as a sip. */
    cancel() { owner = null; },
  };
}

/* 3. Level animation ------------------------------------------------- */
export function createLevelAnimator(durationMs = 380, startLevel = 1) {
  let from = startLevel, to = startLevel, startTime = 0, current = startLevel;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  return {
    get value() { return current; },
    get settled() { return current === to; },
    /** Aim for a new level, starting from wherever the animation is right now. */
    setTarget(level, now) {
      if (level === to) return;
      from = current;
      to = level;
      startTime = now;
    },
    /** Jump straight there (reduced motion, or a page that just loaded). */
    snap(level) { from = to = current = level; },
    update(now) {
      if (current === to) return current;
      const t = Math.min(1, (now - startTime) / durationMs);
      current = from + (to - from) * easeOut(t);
      if (t >= 1) current = to;
      return current;
    },
  };
}
