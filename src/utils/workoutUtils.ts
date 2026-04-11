import { startOfWeek, format } from 'date-fns';
import type { WorkoutSet } from './csvParser';

// ─── Centralized Muscle Group Mapping ───────────────────────────────────────
// Matching is done via partial, case-insensitive includes() on exerciseTitle.
// Order matters: more specific entries should come before general ones.

export const MUSCLE_MAP: Record<string, string> = {
  // Chest
  'Incline Bench Press': 'Chest',
  'Decline Bench Press': 'Chest',
  'Bench Press': 'Chest',
  'Incline Press': 'Chest',
  'Decline Press': 'Chest',
  'Chest Fly': 'Chest',
  'Cable Fly': 'Chest',
  'Pec Deck': 'Chest',
  'Chest Press': 'Chest',
  'Push Up': 'Chest',
  'Dip': 'Chest',

  // Back
  'Romanian Deadlift': 'Legs', // More legs than back, override before generic Deadlift
  'Deadlift': 'Back',
  'Pulldown': 'Back',
  'Lat Pull': 'Back',
  'Pull Up': 'Back',
  'Chin Up': 'Back',
  'Seated Row': 'Back',
  'Cable Row': 'Back',
  'Bent Over Row': 'Back',
  'Row': 'Back',
  'Back Extension': 'Back',
  'Pull Over': 'Back',
  'Face Pull': 'Back',
  'Shrug': 'Back',
  'Rack Pull': 'Back',
  'Muscle Up': 'Back',

  // Legs
  'Hack Squat': 'Legs',
  'Front Squat': 'Legs',
  'Split Squat': 'Legs',
  'Bulgarian Split Squat': 'Legs',
  'Squat': 'Legs',
  'Leg Press': 'Legs',
  'Leg Extension': 'Legs',
  'Leg Curl': 'Legs',
  'Lying Leg Curl': 'Legs',
  'Seated Leg Curl': 'Legs',
  'Hip Thrust': 'Legs',
  'Glute Bridge': 'Legs',
  'Hip Abduction': 'Legs',
  'Hip Adduction': 'Legs',
  'Adduction': 'Legs',
  'Abduction': 'Legs',
  'Calf Raise': 'Legs',
  'Calf': 'Legs',
  'Nordic': 'Legs',
  'Lunge': 'Legs',
  'Step Up': 'Legs',
  'Good Morning': 'Legs',
  'Sissy Squat': 'Legs',

  // Shoulders
  'Overhead Press': 'Shoulders',
  'Military Press': 'Shoulders',
  'Shoulder Press': 'Shoulders',
  'Arnold Press': 'Shoulders',
  'Lateral Raise': 'Shoulders',
  'Front Raise': 'Shoulders',
  'Reverse Fly': 'Shoulders',
  'Rear Delt': 'Shoulders',
  'Upright Row': 'Shoulders',
  'Face Pull': 'Shoulders', // duplicate intentional – face pull hits rear delt

  // Arms – Biceps
  'Preacher Curl': 'Arms',
  'Concentration Curl': 'Arms',
  'Spider Curl': 'Arms',
  'Hammer Curl': 'Arms',
  'Incline Curl': 'Arms',
  'Bicep Curl': 'Arms',
  'Biceps Curl': 'Arms',
  'Cable Curl': 'Arms',
  'Barbell Curl': 'Arms',
  'EZ Bar Curl': 'Arms',

  // Arms – Triceps
  'Skull Crusher': 'Arms',
  'Triceps Pushdown': 'Arms',
  'Tricep Pushdown': 'Arms',
  'Close Grip Bench': 'Arms',
  'Overhead Tricep Extension': 'Arms',
  'Overhead Extension': 'Arms',
  'Triceps': 'Arms',
  'Tricep': 'Arms',
  'Wrist Curl': 'Arms',
  'Close Grip': 'Arms',

  // Core
  'Cable Crunch': 'Core',
  'Crunch': 'Core',
  'Sit Up': 'Core',
  'Plank': 'Core',
  'Russian Twist': 'Core',
  'Leg Raise': 'Core',
  'Hanging Leg Raise': 'Core',
  'Toes to Bar': 'Core',
  'Ab Wheel': 'Core',
  'Wood Chop': 'Core',
  'Hyperextension': 'Core',
  'Ab ': 'Core',
};

export function getMuscleGroup(exerciseTitle: string): string {
  const lower = exerciseTitle.toLowerCase();
  for (const [key, value] of Object.entries(MUSCLE_MAP)) {
    if (lower.includes(key.toLowerCase())) return value;
  }
  return 'Other';
}

// ─── Weekly Grouping Helpers ─────────────────────────────────────────────────

/** Returns the ISO week start (Monday) as a sortable 'yyyy-MM-dd' string. */
function getWeekKey(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

/** Display label for a week, e.g. "Jan 06". */
function getWeekLabel(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'MMM dd');
}

// ─── Weekly Volume ────────────────────────────────────────────────────────────

export interface WeeklyVolumePoint {
  weekKey: string;
  label: string;
  volumeKg: number;
}

export function getWeeklyVolume(workouts: WorkoutSet[]): WeeklyVolumePoint[] {
  const map = new Map<string, WeeklyVolumePoint>();

  workouts.forEach(w => {
    const key = getWeekKey(w.startTime);
    const existing = map.get(key) ?? { weekKey: key, label: getWeekLabel(w.startTime), volumeKg: 0 };
    existing.volumeKg += w.weightKg * w.reps;
    map.set(key, existing);
  });

  return Array.from(map.values()).sort((a, b) => a.weekKey.localeCompare(b.weekKey));
}

// ─── Weekly Frequency ────────────────────────────────────────────────────────

export interface WeeklyFrequencyPoint {
  weekKey: string;
  label: string;
  workoutCount: number;
}

/** Counts unique workout sessions (by `id`) per week. */
export function getWeeklyFrequency(workouts: (WorkoutSet & { id: string })[]): WeeklyFrequencyPoint[] {
  const weekMap = new Map<string, { label: string; ids: Set<string> }>();

  workouts.forEach(w => {
    const key = getWeekKey(w.startTime);
    if (!weekMap.has(key)) {
      weekMap.set(key, { label: getWeekLabel(w.startTime), ids: new Set() });
    }
    weekMap.get(key)!.ids.add(w.id);
  });

  return Array.from(weekMap.entries())
    .map(([weekKey, { label, ids }]) => ({ weekKey, label, workoutCount: ids.size }))
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey));
}

// ─── Top Exercises ────────────────────────────────────────────────────────────

export interface TopExercisePoint {
  exerciseTitle: string;
  volumeKg: number;
  setCount: number;
}

export function getTopExercises(workouts: WorkoutSet[], limit = 10): TopExercisePoint[] {
  const map = new Map<string, TopExercisePoint>();

  workouts.forEach(w => {
    const existing = map.get(w.exerciseTitle) ?? {
      exerciseTitle: w.exerciseTitle,
      volumeKg: 0,
      setCount: 0,
    };
    existing.volumeKg += w.weightKg * w.reps;
    existing.setCount += 1;
    map.set(w.exerciseTitle, existing);
  });

  return Array.from(map.values())
    .sort((a, b) => b.volumeKg - a.volumeKg)
    .slice(0, limit);
}

// ─── Volume by Muscle Group ───────────────────────────────────────────────────

export interface MuscleGroupPoint {
  name: string;
  sets: number;
  volumeKg: number;
}

export function getVolumeByMuscleGroup(workouts: WorkoutSet[]): MuscleGroupPoint[] {
  const map = new Map<string, MuscleGroupPoint>();

  workouts.forEach(w => {
    const group = getMuscleGroup(w.exerciseTitle);
    const existing = map.get(group) ?? { name: group, sets: 0, volumeKg: 0 };
    existing.sets += 1;
    existing.volumeKg += w.weightKg * w.reps;
    map.set(group, existing);
  });

  return Array.from(map.values())
    .sort((a, b) => b.volumeKg - a.volumeKg)
    .filter(r => r.sets > 0);
}
