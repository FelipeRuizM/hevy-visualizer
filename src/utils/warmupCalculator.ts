import type { WorkoutSet } from './csvParser';
import { isWorkingSet } from './workoutDisplay';

/**
 * Warm-up / feeder ramp calculator.
 *
 * The ramp is expressed as ratios of the day's *working* weight, learned from
 * how the lifter has actually warmed up for that exercise in the past: for each
 * past session we take the top working set as 100% and record where each
 * warm-up and feeder set sat relative to it. Medians across sessions (per rung,
 * so the first warm-up is compared with other first warm-ups) make the scheme
 * robust to the odd off-day. Exercises without enough history fall back to
 * STANDARD_RAMP.
 */

export type RampSetType = 'warmup' | 'feeder';

export interface RampRung {
  setType: RampSetType;
  /** Fraction of the working weight — 0.65 means 65%. */
  ratio: number;
  reps: number;
}

export interface RampScheme {
  rungs: RampRung[];
  source: 'history' | 'standard';
  /** Past sessions the ratios were learned from. */
  sessions: number;
}

/** Fallback for exercises with too little ramp history to learn from. */
export const STANDARD_RAMP: RampRung[] = [
  { setType: 'warmup', ratio: 0.50, reps: 15 },
  { setType: 'warmup', ratio: 0.65, reps: 15 },
  { setType: 'feeder', ratio: 0.80, reps: 4 },
  { setType: 'feeder', ratio: 0.90, reps: 4 },
];

/** History is only trusted once this many past sessions include a ramp. */
const MIN_SESSIONS = 3;

const RAMP_TYPES: RampSetType[] = ['warmup', 'feeder'];

const median = (xs: number[]): number => {
  const s = xs.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/** Ratios outside this band are logging noise, not a warm-up — ignore them. */
const isPlausibleRatio = (r: number) => r > 0 && r < 1;

interface RungStats {
  ratios: number[][]; // ratios[i] = every ratio seen at rung i, across sessions
  reps: number[][];
  counts: number[];   // how many rungs of this type each session had
}

/**
 * Derives the lifter's own ramp for `exerciseTitle` from their logged history.
 * `sets` is the full flat set list — it gets filtered here.
 */
export function learnRamp(
  sets: (WorkoutSet & { id: string })[],
  exerciseTitle: string,
): RampScheme {
  const sessions = new Map<string, (WorkoutSet & { id: string })[]>();
  sets.forEach(s => {
    if (s.exerciseTitle !== exerciseTitle) return;
    const arr = sessions.get(s.id) ?? [];
    arr.push(s);
    sessions.set(s.id, arr);
  });

  const stats: Record<RampSetType, RungStats> = {
    warmup: { ratios: [], reps: [], counts: [] },
    feeder: { ratios: [], reps: [], counts: [] },
  };
  let analyzed = 0;

  sessions.forEach(rows => {
    // The session's heaviest working set is the 100% reference.
    const working = rows.filter(r => isWorkingSet(r.setType)).map(r => r.weightKg);
    const top = working.length > 0 ? Math.max(...working) : 0;
    if (top <= 0) return;

    let sawRamp = false;
    RAMP_TYPES.forEach(type => {
      const rungs = rows
        .filter(r => r.setType === type && isPlausibleRatio(r.weightKg / top))
        .sort((a, b) => (a.setIndex ?? 0) - (b.setIndex ?? 0));
      if (rungs.length === 0) return;

      sawRamp = true;
      const bucket = stats[type];
      bucket.counts.push(rungs.length);
      rungs.forEach((r, i) => {
        if (!bucket.ratios[i]) { bucket.ratios[i] = []; bucket.reps[i] = []; }
        bucket.ratios[i].push(r.weightKg / top);
        bucket.reps[i].push(r.reps);
      });
    });
    if (sawRamp) analyzed += 1;
  });

  if (analyzed < MIN_SESSIONS) {
    return { rungs: STANDARD_RAMP, source: 'standard', sessions: analyzed };
  }

  const rungs: RampRung[] = [];
  RAMP_TYPES.forEach(type => {
    const { ratios, reps, counts } = stats[type];
    if (counts.length === 0) return;
    // A typical session's rung count — not the max, so a one-off extra warm-up
    // set doesn't permanently lengthen the ramp.
    const n = Math.max(1, Math.round(median(counts)));
    for (let i = 0; i < n && ratios[i]; i++) {
      rungs.push({
        setType: type,
        ratio: median(ratios[i]),
        reps: Math.max(1, Math.round(median(reps[i]))),
      });
    }
  });

  if (rungs.length === 0) {
    return { rungs: STANDARD_RAMP, source: 'standard', sessions: analyzed };
  }
  return { rungs, source: 'history', sessions: analyzed };
}

export interface RampStep extends RampRung {
  /** Weight to load, rounded to the chosen increment, in the display unit. */
  weight: number;
}

/**
 * Turns a scheme into loadable weights.
 *
 * All arguments are in the display unit, so rounding lands on real plates
 * (2.5kg / 5lb). For bodyweight exercises pass the lifter's `bodyweight` and a
 * `workingWeight` of just the *added* load: ratios apply to the total the body
 * moves, and the result is converted back to added load.
 */
export function applyRamp(
  rungs: RampRung[],
  workingWeight: number,
  increment: number,
  bodyweight = 0,
): RampStep[] {
  const total = workingWeight + bodyweight;
  const step = increment > 0 ? increment : 1;
  return rungs.map(r => {
    const raw = r.ratio * total - bodyweight;
    const rounded = Math.round(raw / step) * step;
    return { ...r, weight: Math.max(0, Math.round(rounded * 100) / 100) };
  });
}

/**
 * The most recent session's heaviest working set for an exercise, in kg —
 * used to prefill the calculator. Returns 0 when there's no history.
 */
export function lastWorkingWeightKg(
  sets: (WorkoutSet & { id: string })[],
  exerciseTitle: string,
): number {
  let latestMs = -Infinity;
  let top = 0;
  sets.forEach(s => {
    if (s.exerciseTitle !== exerciseTitle || !isWorkingSet(s.setType)) return;
    const ms = s.startTime.getTime();
    if (ms > latestMs) { latestMs = ms; top = s.weightKg; }
    else if (ms === latestMs) { top = Math.max(top, s.weightKg); }
  });
  return top;
}
