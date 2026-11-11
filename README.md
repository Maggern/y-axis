# Y-Axis Tick Generator

A JavaScript library for generating optimal axis tick marks using the 1-2-5 pattern. Perfect for data visualization, charts, and graphs.

## Features

- ✅ **1-2-5 Pattern**: Follows the standard 1-2-5 pattern for visually pleasing tick intervals
- ✅ **Negative Numbers**: Supports ranges with negative values
- ✅ **Custom Tick Counts**: Specify preferred number of ticks
- ✅ **Wide Range**: Handles values from 0.00001 to 5,000,000,000
- ✅ **Custom Patterns**: Any step multipliers, e.g. 1-2.5-5 or 1-3-6
- ✅ **Logarithmic Scales**: `buildLogTicks` for log axes
- ✅ **Clean Decimals**: No `0.30000000000000004` in the output
- ✅ **Real-time Calculation**: Live updates as you type
- ✅ **Responsive UI**: Bootstrap-based interface with locale-aware number formatting
- ✅ **Node, browser and CLI**: One file, typed (`y-axis-ticks.d.ts`), tested

## Files

| File | What |
|------|------|
| `y-axis-ticks.js` | The library (browser global or `require`) |
| `y-axis-ticks.d.ts` | TypeScript definitions |
| `y-axis-ticks.html` | Interactive demo (serve the folder, e.g. `npx http-server`) |
| `cli.js` | Command-line tool |
| `y-axis-ticks.test.js` | Tests — run `npm test` (Node 20+) |

## Install / Load

```html
<script src="y-axis-ticks.js"></script>  <!-- exposes buildTicks, buildLogTicks, ... -->
```

```javascript
const { buildTicks, buildLogTicks } = require('./y-axis-ticks.js');
```

## Quick Start

### Basic Usage

```javascript
// Generate ticks for a range from 0 to 1000
const ticks = buildTicks(0, 1000);
console.log(ticks); // [0, 200, 400, 600, 800, 1000]

// Generate ticks for a range from -500 to 500
const ticks = buildTicks(-500, 500);
console.log(ticks); // [-600, -400, -200, 0, 200, 400, 600]
```

### Advanced Usage

```javascript
// Custom tick count preferences
const ticks = buildTicks(0, 1000, [7, 5, 3]);
console.log(ticks); // [0, 500, 1000]  (no 1-2-5 step gives 7 or 5 ticks here)

// Custom step pattern
buildTicks(0, 1000, [5], { multipliers: [1, 2.5, 5] }); // [0, 250, 500, 750, 1000]

// Logarithmic axis
buildLogTicks(1, 1e6);    // [1, 10, 100, 1000, 10000, 100000, 1000000]
buildLogTicks(0.02, 0.9); // [0.02, 0.05, 0.1, 0.2, 0.5, 1]

// Single value (treats as max, min=0)
const ticks = buildTicks(100);
console.log(ticks); // [0, 20, 40, 60, 80, 100]
```

## Core Functions

### `buildTicks(min, max, desiredTicks, options)`

Generates tick marks that always cover `[min, max]` with a step from the pattern. Tries each count in `desiredTicks` in order and returns the first one a pattern step hits exactly; if none does, returns the finest step that stays within the largest count. `min > max` is swapped; `min === max` is padded. Throws `TypeError` on non-finite input or counts below 2.

**Parameters:**
- `min` (number): Minimum value of the range
- `max` (number): Maximum value of the range  
- `desiredTicks` (array, optional): Preferred tick counts in order of preference. Default: `[9, 8, 7, 6, 5, 4, 3]`
- `options.multipliers` (array, optional): Step pattern per power of 10. Default: `[1, 2, 5]`

**Returns:** Array of tick values

**Examples:**
```javascript
// Basic usage
buildTicks(0, 100);     // [0, 20, 40, 60, 80, 100]
buildTicks(-50, 50);    // [-60, -40, -20, 0, 20, 40, 60]
buildTicks(0, 0.3);     // [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]

// Custom tick preferences
buildTicks(0, 1000, [5, 3]);  // [0, 500, 1000]
buildTicks(0, 500, [10]);     // [0, 100, 200, 300, 400, 500]  (closest under 10)
```

### `buildLogTicks(min, max, options)`

Powers of 10 covering `[min, max]` (both must be > 0, else `RangeError`). Spans under 3 decades also get the pattern's in-between values (2, 5).

## CLI

```bash
node cli.js 0 1000            # 0 200 400 600 800 1000
node cli.js 0 1000 "7,5,3"    # 0 500 1000
node cli.js 1 1e6 --log       # 1 10 100 1000 10000 100000 1000000
node cli.js 0 1000 5 --pattern=1,2.5,5
printf '0 100
-50 50
' | node cli.js   # one range per line
```

### `chooseStep(n)`

Determines the optimal step size for a given range using the 1-2-5 pattern.

**Parameters:**
- `n` (number): The range value (max - min)

**Returns:** Optimal step size

**Examples:**
```javascript
chooseStep(100);   // 20
chooseStep(1000);  // 200
chooseStep(50);    // 10
chooseStep(15);    // 2
```

### `getOptimalStep(value, options)`

Advanced function with configurable options for step calculation.

**Parameters:**
- `value` (number): The range value
- `options` (object, optional): Configuration options
  - `multipliers` (array): Pattern multipliers. Default: `[1, 2, 5]`
  - `minRange` (number): Minimum range multiplier. Default: `2`
  - `maxRange` (number): Maximum range multiplier. Default: `10`
  - `minStep` (number): Minimum step size. Default: `0.01`
  - `maxStep` (number): Maximum step size. Default: `1e9`
  - `maxExponent` (number): Maximum power of 10. Default: `9`
  - `minExponent` (number): Minimum power of 10. Default: `-5`

**Returns:** Optimal step size

**Examples:**
```javascript
// Custom pattern (1-3-6 instead of 1-2-5)
getOptimalStep(1000, { multipliers: [1, 3, 6] });

// Tighter range
getOptimalStep(1000, { minRange: 3, maxRange: 7 });

// Different scale limits
getOptimalStep(1000, { minStep: 0.001, maxStep: 1e12 });
```

### `parseTickCounts(input)`

Parses and validates comma-separated tick count preferences.

**Parameters:**
- `input` (string): Comma-separated list of numbers (e.g., "7, 5, 3")

**Returns:** Array of validated tick counts

**Examples:**
```javascript
parseTickCounts("7, 5, 3");     // [7, 5, 3]
parseTickCounts("10, 15");      // [10, 15]
parseTickCounts("");            // [9, 8, 7, 6, 5, 4, 3] (default)
```

## Integration Examples

### Chart.js Integration

```javascript
// For Chart.js
const data = [10, 25, 45, 80, 120, 200];
const maxValue = Math.max(...data);
const ticks = buildTicks(0, maxValue, [7, 5]);

const chart = new Chart(ctx, {
  type: 'line',
  data: { /* your data */ },
  options: {
    scales: {
      y: {
        ticks: {
          stepSize: ticks[1] - ticks[0], // Use first interval
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    }
  }
});
```

### D3.js Integration

```javascript
// For D3.js
const data = [10, 25, 45, 80, 120, 200];
const maxValue = Math.max(...data);
const ticks = buildTicks(0, maxValue);

const yScale = d3.scaleLinear()
  .domain([0, maxValue])
  .range([height, 0]);

const yAxis = d3.axisLeft(yScale)
  .tickValues(ticks)
  .tickFormat(d3.format(","));
```

### React Component

```javascript
import React, { useState, useEffect } from 'react';

function TickGenerator({ min, max, preferredTicks = [7, 5, 3] }) {
  const [ticks, setTicks] = useState([]);

  useEffect(() => {
    const generatedTicks = buildTicks(min, max, preferredTicks);
    setTicks(generatedTicks);
  }, [min, max, preferredTicks]);

  return (
    <div>
      <h3>Generated Ticks:</h3>
      <ul>
        {ticks.map((tick, index) => (
          <li key={index}>{tick.toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Algorithm Details

### 1-2-5 Pattern

The algorithm follows the standard 1-2-5 pattern for optimal tick intervals:

- **Step sizes**: 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, etc.
- **Optimal range**: Each step is chosen when the range is between 2× and 10× the step size
- **Fallback logic**: If no optimal step is found, tries the next smaller power of 10
- **Precision**: Tick values are computed as integer × step and rounded to 12 significant digits

### Tick Count Selection

The algorithm tries to match the desired tick count by:
1. Listing every pattern step around the range's magnitude (multiplier × 10^k)
2. Snapping floor/ceiling of the data to each step and counting the ticks
3. Returning the first desired count that some step hits exactly
4. Falling back to the finest step whose tick count stays within the largest desired count

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Roadmap

Done: decimal precision, custom patterns, logarithmic scales, TypeScript definitions, unit tests, accessibility (labels, live result region), number-format locales, CLI, single-module extraction, input validation.

Not planned until someone needs it:
- **Date/time scales** — calendar steps (days, months, quarters) are a different algorithm, not a pattern tweak
- **Caching** — a call takes microseconds; nothing to cache
- **Web Components / React / Vue hooks** — `buildTicks` is a pure function; call it in `useMemo`
- **Docs site, plugins, bundling** — the library is one ~150-line file

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU GPL v3 - see the LICENSE file for details.

## Acknowledgments

- Inspired by the 1-2-5 pattern used in data visualization
- Built with Bootstrap for responsive design
- Uses modern JavaScript features for optimal performance


 
