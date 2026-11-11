/* Y-Axis Tick Generator — nice axis ticks on a 1-2-5 (or custom) pattern.
   Works as a browser <script> (globals) and as a CommonJS module. */
(function (root) {
  'use strict';

  const DEFAULT_TICKS = [9, 8, 7, 6, 5, 4, 3];
  const EPS = 1e-9;

  // Strip float noise: 0.30000000000000004 → 0.3
  const clean = v => (v === 0 ? 0 : parseFloat(v.toPrecision(12)));

  function assertFinite(name, v) {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new TypeError(`${name} must be a finite number, got ${v}`);
    }
  }

  /**
   * Step size for a range, picked from multipliers × 10^k so that
   * minRange·step <= |value| < maxRange·step. Sign follows value.
   */
  function getOptimalStep(value, options = {}) {
    const {
      multipliers = [1, 2, 5],
      minRange = 2,
      maxRange = 10,
      minStep = 0.01,
      maxStep = 1e9,
      maxExponent = 9,
      minExponent = -5
    } = options;
    assertFinite('value', value);
    if (value === 0) return 0;

    const sign = Math.sign(value);
    const abs = Math.abs(value);
    if (abs < minStep) return sign * minStep;
    if (abs > maxStep) return sign * maxStep;

    const power = Math.floor(Math.log10(abs));
    // Try this power of 10, then the one below (e.g. 15 → step 2, not 10).
    for (const p of [power, power - 1]) {
      const base = Math.pow(10, Math.max(minExponent, Math.min(maxExponent, p)));
      for (const mult of multipliers) {
        const step = clean(mult * base);
        if (abs >= minRange * step && abs < maxRange * step) return sign * step;
      }
    }
    return sign * Math.pow(10, Math.max(minExponent, Math.min(maxExponent, power)));
  }

  const chooseStep = n => getOptimalStep(n);

  /** Candidate steps around the range's magnitude, ascending. */
  function candidateSteps(range, multipliers) {
    const e = Math.floor(Math.log10(range));
    const steps = [];
    for (let p = e - 3; p <= e + 2; p++) {
      for (const m of multipliers) steps.push(clean(m * Math.pow(10, p)));
    }
    return steps.sort((a, b) => a - b);
  }

  function ticksFor(min, max, step) {
    const lo = Math.floor(min / step + EPS);
    const hi = Math.ceil(max / step - EPS);
    const ticks = [];
    for (let i = lo; i <= hi; i++) ticks.push(clean(i * step));
    return ticks;
  }

  /**
   * Ticks that cover [min, max] with a "nice" step. Tries each tick count in
   * desiredTicks in order and returns the first that a nice step hits exactly;
   * otherwise the finest nice step that stays within the largest count.
   * buildTicks(max) is shorthand for buildTicks(0, max).
   */
  function buildTicks(min, max, desiredTicks = DEFAULT_TICKS, options = {}) {
    if (max === undefined) [min, max] = [0, min];
    assertFinite('min', min);
    assertFinite('max', max);
    if (!Array.isArray(desiredTicks) || desiredTicks.length === 0 ||
        !desiredTicks.every(n => Number.isInteger(n) && n >= 2)) {
      throw new TypeError('desiredTicks must be a non-empty array of integers >= 2');
    }
    const { multipliers = [1, 2, 5] } = options;
    if (!multipliers.length || !multipliers.every(m => m > 0 && Number.isFinite(m))) {
      throw new TypeError('multipliers must be positive numbers');
    }

    if (min > max) [min, max] = [max, min];
    if (min === max) { // flat data: give it some room
      const pad = min === 0 ? 1 : Math.abs(min) / 10;
      min -= pad; max += pad;
    }

    const steps = candidateSteps(max - min, multipliers);
    const layouts = steps.map(step => ticksFor(min, max, step));

    for (const want of desiredTicks) {
      const hit = layouts.find(t => t.length === want);
      if (hit) return hit;
    }
    const limit = Math.max(...desiredTicks);
    return layouts.find(t => t.length <= limit) || layouts[layouts.length - 1];
  }

  /**
   * Log-scale ticks: powers of 10 covering [min, max] (both > 0). Spans of
   * fewer than 3 decades also get the multipliers' in-between values (2, 5).
   */
  function buildLogTicks(min, max, options = {}) {
    assertFinite('min', min);
    assertFinite('max', max);
    if (min <= 0 || max <= 0) throw new RangeError('log scale needs min and max > 0');
    if (min > max) [min, max] = [max, min];
    const { multipliers = [1, 2, 5] } = options;

    const lo = Math.floor(Math.log10(min) + EPS);
    const hi = Math.ceil(Math.log10(max) - EPS);
    const mults = hi - lo < 3 ? multipliers : [1];
    const ticks = [];
    for (let p = lo; p <= hi; p++) {
      for (const m of mults) {
        const v = clean(m * Math.pow(10, p));
        if (p === hi && v > Math.pow(10, hi)) break;
        ticks.push(v);
      }
    }
    // Trim in-between ticks that sit outside the data.
    const first = ticks.findLastIndex(v => v <= min * (1 + EPS));
    const last = ticks.findIndex(v => v >= max * (1 - EPS));
    return ticks.slice(Math.max(0, first), last + 1);
  }

  /** "7, 5, 3" → [7, 5, 3]. Empty → defaults. Throws on anything outside 2–100. */
  function parseTickCounts(input) {
    const parts = String(input).split(',').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return DEFAULT_TICKS.slice();
    return parts.map(s => {
      const n = Number(s);
      if (!Number.isInteger(n) || n < 2 || n > 100) {
        throw new Error(`Invalid tick count: ${s}. Must be a whole number between 2 and 100.`);
      }
      return n;
    });
  }

  const api = { buildTicks, buildLogTicks, getOptimalStep, chooseStep, parseTickCounts, DEFAULT_TICKS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
