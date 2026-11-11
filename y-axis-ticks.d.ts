export interface PatternOptions {
  /** Step multipliers per power of 10. Default [1, 2, 5]. */
  multipliers?: number[];
}

export interface StepOptions extends PatternOptions {
  minRange?: number;
  maxRange?: number;
  minStep?: number;
  maxStep?: number;
  maxExponent?: number;
  minExponent?: number;
}

export declare const DEFAULT_TICKS: number[];
export declare function buildTicks(max: number): number[];
export declare function buildTicks(min: number, max: number, desiredTicks?: number[], options?: PatternOptions): number[];
export declare function buildLogTicks(min: number, max: number, options?: PatternOptions): number[];
export declare function getOptimalStep(value: number, options?: StepOptions): number;
export declare function chooseStep(n: number): number;
export declare function parseTickCounts(input: string): number[];
