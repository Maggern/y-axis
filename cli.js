#!/usr/bin/env node
// Usage: y-axis-ticks <min> <max> [counts] [--log] [--pattern=1,2,5]
//        echo "0 1000" | y-axis-ticks          (one range per line)
const { buildTicks, buildLogTicks, parseTickCounts } = require('./y-axis-ticks.js');

const flags = process.argv.slice(2).filter(a => a.startsWith('--'));
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const log = flags.includes('--log');
const pattern = flags.find(f => f.startsWith('--pattern='));
const options = pattern ? { multipliers: pattern.slice(10).split(',').map(Number) } : {};

function run([min, max, counts = '']) {
  const lo = Number(min), hi = Number(max);
  return log ? buildLogTicks(lo, hi, options) : buildTicks(lo, hi, parseTickCounts(counts), options);
}

try {
  if (args.length >= 2) {
    console.log(run(args).join(' '));
  } else {
    const lines = require('fs').readFileSync(0, 'utf8').split('\n').filter(l => l.trim());
    for (const line of lines) console.log(run(line.trim().split(/\s+/)).join(' '));
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
