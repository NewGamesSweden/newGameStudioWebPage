// Run with:  node --test "coffee/tests/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSipState, createGesture, createLevelAnimator } from '../coffee-state.js';

test('three sips empty a full mug and extra sips do nothing', () => {
  const s = createSipState();
  assert.equal(s.sips, 3);
  assert.equal(s.level, 1);
  assert.equal(s.sip(), true); assert.equal(s.sips, 2); assert.equal(s.label(), '2 sips left');
  assert.equal(s.sip(), true); assert.equal(s.sips, 1); assert.equal(s.label(), '1 sip left');
  assert.equal(s.sip(), true); assert.equal(s.sips, 0); assert.equal(s.isEmpty, true);
  assert.equal(s.sip(), false); assert.equal(s.sips, 0);
  assert.equal(s.label(), 'Out of coffee. Scope remains unlimited.');
});

test('refill restores three sips', () => {
  const s = createSipState();
  s.sip(); s.sip(); s.sip();
  s.refill();
  assert.equal(s.sips, 3);
});

test('a press and release without movement is a sip', () => {
  const g = createGesture(7);
  assert.equal(g.begin(1, 100, 100), true);
  assert.equal(g.move(1, 103, 102), 0);
  assert.equal(g.end(1), 'sip');
  assert.equal(g.active, false);
});

test('moving past the threshold makes it a drag, even if it comes back', () => {
  const g = createGesture(7);
  g.begin(1, 100, 100);
  g.move(1, 120, 100);
  g.move(1, 100, 100);
  assert.equal(g.dragging, true);
  assert.equal(g.end(1), 'drag');
});

test('a second pointer and other mouse buttons are ignored', () => {
  const g = createGesture(7);
  assert.equal(g.begin(1, 0, 0, 2), false, 'right button rejected');
  assert.equal(g.begin(1, 0, 0), true);
  assert.equal(g.begin(2, 50, 50), false, 'second pointer rejected');
  assert.equal(g.move(2, 80, 50), null);
  assert.equal(g.end(2), null);
  assert.equal(g.end(1), 'sip');
});

test('cancel never produces a sip', () => {
  const g = createGesture(7);
  g.begin(1, 0, 0);
  g.cancel();
  assert.equal(g.end(1), null);
  assert.equal(g.active, false);
});

test('level animator eases toward the latest target and never overshoots', () => {
  const a = createLevelAnimator(400, 1);
  a.setTarget(2 / 3, 0);
  a.update(200);
  assert.ok(a.value < 1 && a.value > 2 / 3);
  a.setTarget(1 / 3, 200);        // rapid second click mid-animation
  a.update(600);
  assert.equal(a.value, 1 / 3);
  assert.equal(a.settled, true);
  a.setTarget(0, 600);
  a.update(10000);
  assert.equal(a.value, 0);
  assert.ok(a.value >= 0);
});
