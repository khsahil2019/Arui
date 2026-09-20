/** ECRI v6.0 canonical scoring configuration derived from P0-5.
 * Do not hard-code alternate formulas in routes.
 */
export const ECRI_DIMENSION_WEIGHTS: Record<string, number> = {
  D01: 0.08, D02: 0.08, D03: 0.09, D04: 0.10, D05: 0.08, D06: 0.09,
  D07: 0.08, D08: 0.08, D09: 0.10, D10: 0.12, D11: 0.10,
};

export const ECRI_REQUIRED_MATURITY_TARGETS: Record<string, number> = {
  D01: 3, D02: 3, D03: 4, D04: 4, D05: 3, D06: 3,
  D07: 3, D08: 3, D09: 4, D10: 4, D11: 3,
};

export const ECRI_MATURITY_LABELS: Record<number, string> = {
  0: 'Absent', 1: 'Reactive', 2: 'Emerging', 3: 'Structured', 4: 'Integrated', 5: 'Adaptive',
};

export interface MetricFormulaInput {
  maturity: number | null;
  implementation: number | null;
  outcome: number | null;
  hasOutcome: boolean;
}

export function calculateEcriMetricPerformance(input: MetricFormulaInput): number | null {
  if (input.maturity === null || input.maturity === undefined) return null;
  const M = Math.max(0, Math.min(5, Number(input.maturity)));
  const I = Math.max(0, Math.min(5, Number(input.implementation ?? M)));
  // Current ECRI v6.0 metric registry marks all 132 metrics outcome-ineligible.
  // If a future version declares an outcome-eligible metric, use configured O and renormalize.
  if (input.hasOutcome && input.outcome !== null && input.outcome !== undefined) {
    const O = Math.max(0, Math.min(100, Number(input.outcome)));
    // P0-5 worked example for outcome-eligible constructs: 0.40 M + 0.30 I + 0.30 O.
    return Math.round((0.40 * (M / 5 * 100) + 0.30 * (I / 5 * 100) + 0.30 * O) * 100) / 100;
  }
  // P0-5 canonical ECRI v6.0: 0.60 M + 0.40 I.
  return Math.round((0.60 * (M / 5 * 100) + 0.40 * (I / 5 * 100)) * 100) / 100;
}

export function calculateWeightedMean(values: Array<{value: number; weight: number}>): number | null {
  if (!values.length) return null;
  const denom = values.reduce((s, x) => s + x.weight, 0);
  return denom > 0 ? Math.round((values.reduce((s, x) => s + x.value * x.weight, 0) / denom) * 100) / 100 : null;
}
