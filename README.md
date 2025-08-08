# Y-Axis Tick Generator

A JavaScript library for generating optimal axis tick marks using the 1-2-5 pattern. Perfect for data visualization, charts, and graphs.

## Features

- ✅ **1-2-5 Pattern**: Follows the standard 1-2-5 pattern for visually pleasing tick intervals
- ✅ **Negative Numbers**: Supports ranges with negative values
- ✅ **Custom Tick Counts**: Specify preferred number of ticks
- ✅ **Wide Range**: Handles values from 0.00001 to 5,000,000,000
- ✅ **Real-time Calculation**: Live updates as you type
- ✅ **Responsive UI**: Bootstrap-based interface

## Quick Start

### Basic Usage

```javascript
// Generate ticks for a range from 0 to 1000
const ticks = buildTicks(0, 1000);
console.log(ticks); // [0, 200, 400, 600, 800, 1000]

// Generate ticks for a range from -500 to 500
const ticks = buildTicks(-500, 500);
console.log(ticks); // [-500, -250, 0, 250, 500]
```

### Advanced Usage

```javascript
// Custom tick count preferences
const ticks = buildTicks(0, 1000, [7, 5, 3]);
console.log(ticks); // [0, 167, 333, 500, 667, 833, 1000]

// Single value (treats as max, min=0)
const ticks = buildTicks(100);
console.log(ticks); // [0, 20, 40, 60, 80, 100]
```

## Core Functions

### `buildTicks(min, max, desiredTicks)`

Generates optimal tick marks for a given range.

**Parameters:**
- `min` (number): Minimum value of the range
- `max` (number): Maximum value of the range  
- `desiredTicks` (array, optional): Preferred tick counts in order of preference. Default: `[9, 8, 7, 6, 5, 4, 3]`

**Returns:** Array of tick values

**Examples:**
```javascript
// Basic usage
buildTicks(0, 100);     // [0, 20, 40, 60, 80, 100]
buildTicks(-50, 50);    // [-50, -25, 0, 25, 50]

// Custom tick preferences
buildTicks(0, 1000, [5, 3]);  // [0, 250, 500, 750, 1000]
buildTicks(0, 500, [10]);     // [0, 56, 111, 167, 222, 278, 333, 389, 444, 500]
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

### Tick Count Selection

The algorithm tries to match the desired tick count by:
1. Calculating the optimal step size for the range
2. Testing different gap multiples of the step
3. Selecting the first gap that produces the desired number of ticks
4. Falling back to fewer ticks if the desired count cannot be achieved

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Future Improvements

### High Priority
- [ ] **Performance optimization**: Cache step calculations for repeated ranges
- [ ] **Decimal precision**: Better handling of floating-point arithmetic
- [ ] **Custom patterns**: Support for non-1-2-5 patterns (e.g., 1-3-6, 1-2-4-8)
- [ ] **Logarithmic scales**: Support for logarithmic tick generation
- [ ] **Date/time scales**: Specialized handling for temporal data

### Medium Priority
- [ ] **TypeScript support**: Add TypeScript definitions
- [ ] **Unit tests**: Comprehensive test suite
- [ ] **Performance benchmarks**: Measure and optimize for large datasets
- [ ] **Accessibility**: ARIA labels and keyboard navigation
- [ ] **Internationalization**: Support for different number formats

### Low Priority
- [ ] **Web Components**: Create reusable web components
- [ ] **React/Vue hooks**: Framework-specific hooks
- [ ] **CLI tool**: Command-line interface for batch processing
- [ ] **Documentation site**: Interactive documentation with examples
- [ ] **Plugin ecosystem**: Support for third-party plugins

### Technical Debt
- [ ] **Code refactoring**: Extract utility functions into separate modules
- [ ] **Error handling**: More robust error handling and validation
- [ ] **Memory optimization**: Reduce memory footprint for large datasets
- [ ] **Bundle size**: Optimize for tree-shaking and code splitting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the 1-2-5 pattern used in data visualization
- Built with Bootstrap for responsive design
- Uses modern JavaScript features for optimal performance


 
