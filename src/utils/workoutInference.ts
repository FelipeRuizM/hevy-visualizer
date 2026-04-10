import type { WorkoutSet } from './csvParser';

export type SplitType = 'Push' | 'Pull' | 'Legs' | 'Mixed';

export const tagWorkoutData = (workouts: WorkoutSet[]): (WorkoutSet & { splitType: SplitType })[] => {
  return workouts.map(w => ({
    ...w,
    splitType: ((w as any).splitType as SplitType) || 'Mixed'
  }));
};
