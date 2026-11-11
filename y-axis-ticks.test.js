const test = require('node:test');
const assert = require('node:assert/strict');
const { buildTicks, buildLogTicks, chooseStep, getOptimalStep, parseTickCounts } = require('./y-axis-ticks.js');

const covers = (t, min, max) => t[0] <= min && t[t.length - 1] >= max;

test('basic ranges', () => {
  assert.deepEqual(buildTicks(0, 1000), [0, 200, 400, 600, 800, 1000]);
  assert.deepEqual(buildTicks(100), [0, 20, 40, 60, 80, 100]);
  assert.deepEqual(buildTicks(0, 1000, [7, 5, 3]), [0, 500, 1000]);
  assert.deepEqual(buildTicks(0, 500, [10]), [0, 100, 200, 300, 400, 500]);
});

test('always covers the data, even for huge ranges', () => {
  for (const [min, max] of [[0, 1000], [-1000, 500], [3, 97], [0, 5e10], [-2.5, 2.5], [0.1, 0.7]]) {
    const t = buildTicks(min, max);
    assert.ok(covers(t, min, max), `${min}..${max} → ${t}`);
  }
});

test('no floating-point noise', () => {
  assert.deepEqual(buildTicks(0, 0.3), [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]);
  assert.deepEqual(buildTicks(0.1, 0.7), [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
  assert.ok(buildTicks(0, 1.5).every(v => String(v).length < 6));
});

test('steps stay on the pattern', () => {
  const t = buildTicks(0, 5e10);
  const gap = t[1] - t[0];
  assert.ok([1, 2, 5].includes(gap / Math.pow(10, Math.floor(Math.log10(gap)))));
  assert.deepEqual(buildTicks(0, 1000, [5], { multipliers: [1, 2.5, 5] }), [0, 250, 500, 750, 1000]);
});

test('swapped and flat input', () => {
  assert.deepEqual(buildTicks(1000, 0), buildTicks(0, 1000));
  assert.ok(buildTicks(5, 5).includes(5));
  assert.ok(buildTicks(0, 0).length >= 2);
});

test('rejects bad input', () => {
  assert.throws(() => buildTicks(NaN, 10), TypeError);
  assert.throws(() => buildTicks(0, Infinity), TypeError);
  assert.throws(() => buildTicks(0, 10, [1]), TypeError);
  assert.throws(() => buildTicks(0, 10, [5], { multipliers: [-1] }), TypeError);
  assert.throws(() => buildLogTicks(0, 10), RangeError);
});

test('log ticks', () => {
  assert.deepEqual(buildLogTicks(1, 1e6), [1, 10, 100, 1000, 10000, 100000, 1000000]);
  assert.deepEqual(buildLogTicks(0.02, 0.9), [0.02, 0.05, 0.1, 0.2, 0.5, 1]);
});

test('step helpers', () => {
  assert.equal(chooseStep(100), 20);
  assert.equal(chooseStep(1000), 200);
  assert.equal(chooseStep(50), 10);
  assert.equal(chooseStep(15), 2);
  assert.equal(chooseStep(-100), -20);
  assert.equal(getOptimalStep(1000, { multipliers: [1, 3, 6] }), 300);
});

test('parseTickCounts', () => {
  assert.deepEqual(parseTickCounts('7, 5, 3'), [7, 5, 3]);
  assert.deepEqual(parseTickCounts(''), [9, 8, 7, 6, 5, 4, 3]);
  assert.throws(() => parseTickCounts('7, x'));
  assert.throws(() => parseTickCounts('1'));
  assert.throws(() => parseTickCounts('2.5'));
});
