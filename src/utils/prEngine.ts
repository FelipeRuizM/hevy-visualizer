import type { TaggedWorkout } from '../hooks/useWorkouts';

export interface PRData {
  exerciseTitle: string;
  maxWeight: number;
  maxWeightDate: Date;
  maxVolume: number;
  maxVolumeDate: Date;
  daysSinceLastPR: number;
  bodyweightAtPR?: number; // Only used for Bodyweight exercises 
}

export const calculatePRs = (workouts: TaggedWorkout[]): PRData[] => {
  const prMap = new Map<string, PRData>();
  const BODYWEIGHT_EXERCISES = ['Pull Up', 'Chin Up', 'Dip', 'Push Up', 'Muscle Up'];

  workouts.forEach(w => {
    // w.weightKg already has the bodyweight included if it's a bodyweight exercise
    const entry = prMap.get(w.exerciseTitle) || {
      exerciseTitle: w.exerciseTitle,
      maxWeight: 0,
      maxWeightDate: w.startTime,
      maxVolume: 0,
      maxVolumeDate: w.startTime,
      daysSinceLastPR: 0,
    };

    if (w.weightKg > entry.maxWeight) {
      entry.maxWeight = w.weightKg;
      entry.maxWeightDate = w.startTime;
      if (BODYWEIGHT_EXERCISES.includes(w.exerciseTitle)) {
          entry.bodyweightAtPR = w.startTime < new Date('2026-02-01') ? 73 : 80; 
      }
    }
    
    // Max Set Volume
    const setVolume = w.weightKg * w.reps;
    if (setVolume > entry.maxVolume) {
      entry.maxVolume = setVolume;
      entry.maxVolumeDate = w.startTime;
    }

    prMap.set(w.exerciseTitle, entry);
  });

  // Calculate days since last PR for all entries
  const today = new Date();
  prMap.forEach((entry, key) => {
    const latestPRDate = new Date(Math.max(entry.maxWeightDate.getTime(), entry.maxVolumeDate.getTime()));
    const timeDiff = Math.abs(today.getTime() - latestPRDate.getTime());
    entry.daysSinceLastPR = Math.floor(timeDiff / (1000 * 3600 * 24));
    prMap.set(key, entry);
  });

  return Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight); // Secondary Sort by weight
};
