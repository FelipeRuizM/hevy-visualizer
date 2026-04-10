import Papa from 'papaparse';
import { parse } from 'date-fns';

export interface RawWorkoutRow {
  title: string;
  start_time: string;
  end_time: string;
  description: string;
  exercise_title: string;
  superset_id: string;
  exercise_notes: string;
  set_index: string;
  set_type: string;
  weight_kg: string;
  reps: string;
  distance_km: string;
  duration_seconds: string;
  rpe: string;
}

export interface WorkoutSet {
  title: string;
  startTime: Date;
  endTime: Date;
  description: string;
  exerciseTitle: string;
  supersetId: string;
  exerciseNotes: string;
  setIndex: number;
  setType: 'warmup' | 'normal' | 'dropset' | 'failure';
  weightKg: number;
  reps: number;
  distanceKm: number;
  durationSeconds: number;
  rpe: number;
}

const BODYWEIGHT_EXERCISES = ['Pull Up', 'Chin Up', 'Dip', 'Push Up', 'Muscle Up', 'Chin Up (Assisted)', 'Dips'];

export const fetchAndParseWorkouts = async (): Promise<WorkoutSet[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<RawWorkoutRow>('/workout_data.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData: WorkoutSet[] = results.data.map((row) => {
            const startTime = parse(row.start_time, 'd MMM yyyy, HH:mm', new Date());
            const endTime = parse(row.end_time, 'd MMM yyyy, HH:mm', new Date());
            
            // Bodyweight calculation
            const splitDate = new Date('2026-02-01T00:00:00');
            const bodyweight = startTime < splitDate ? 73 : 80;
            
            const exerciseTitle = row.exercise_title || 'Unknown Exercise';
            let weightKg = row.weight_kg ? Number(row.weight_kg) : 0;
            
            // Add user bodyweight for specific exercises
            if (BODYWEIGHT_EXERCISES.includes(exerciseTitle)) {
              weightKg += bodyweight;
            }

            return {
              title: row.title || 'Untitled Workout',
              startTime,
              endTime,
              description: row.description || '',
              exerciseTitle,
              supersetId: row.superset_id || '',
              exerciseNotes: row.exercise_notes || '',
              setIndex: Number(row.set_index) || 0,
              setType: (row.set_type as WorkoutSet['setType']) || 'normal',
              weightKg,
              reps: row.reps ? Number(row.reps) : 0,
              distanceKm: row.distance_km ? Number(row.distance_km) : 0,
              durationSeconds: row.duration_seconds ? Number(row.duration_seconds) : 0,
              rpe: row.rpe ? Number(row.rpe) : 0,
            };
          });
          resolve(parsedData);
        } catch (error) {
          console.error("Error transforming CSV data:", error);
          reject(error);
        }
      },
      error: (error: Error) => {
        console.error("Error downloading CSV data:", error);
        reject(error);
      }
    });
  });
};
