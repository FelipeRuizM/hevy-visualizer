import { useState, useEffect } from 'react';
import type { WorkoutSet } from '../utils/csvParser';
import { parse } from 'date-fns';
import { realtimeDb } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { tagWorkoutData, type SplitType } from '../utils/workoutInference';

export type TaggedWorkout = WorkoutSet & { splitType: SplitType };

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<TaggedWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  const updateSplit = (sessionId: string, newSplit: SplitType) => {
    setWorkouts(prev => prev.map(w => 
      w.startTime.getTime().toString() === sessionId 
        ? { ...w, splitType: newSplit } 
        : w
    ));
  };

  useEffect(() => {
    const parseDataToFlat = (dataArray: any[]): WorkoutSet[] => {
      const flatData: WorkoutSet[] = [];
      const BODYWEIGHT_EXERCISES = ['Pull Up', 'Chin Up', 'Dip', 'Push Up', 'Muscle Up'];
      
      // Realtime Database might return an object with keys or an array
      const normalizedData = Array.isArray(dataArray) 
        ? dataArray 
        : Object.values(dataArray);

      normalizedData.forEach(item => {
        if (!item) return;

        if (item.exercises) {
            const startTimeString = String(item.start_time);
            let startTime = new Date();
            try {
               startTime = parse(startTimeString, 'd MMM yyyy, HH:mm', new Date());
               if (isNaN(startTime.getTime())) startTime = new Date(startTimeString);
            } catch (e) {}

            item.exercises.forEach((ex: any) => {
              const rootTitle = ex.exercise_title || '';
              const isBodyweight = BODYWEIGHT_EXERCISES.includes(rootTitle);
              
              let bodyweightAddition = 0;
              if (isBodyweight) {
                // Determine bodyweight based on date
                bodyweightAddition = startTime < new Date('2026-02-01') ? 73 : 80;
              }

              ex.sets.forEach((s: any) => {
                let finalWeight = s.weight_kg || 0;
                if (isBodyweight) finalWeight += bodyweightAddition;
                flatData.push({
                  title: item.title || '',
                  startTime,
                  endTime: item.end_time ? new Date(item.end_time) : undefined,
                  description: item.description || '',
                  exerciseTitle: rootTitle,
                  supersetId: '',
                  exerciseNotes: ex.exercise_notes || '',
                  setIndex: s.set_index || 0,
                  setType: s.set_type || 'normal',
                  weightKg: finalWeight,
                  reps: s.reps || 0,
                  distanceKm: 0,
                  durationSeconds: s.duration_seconds || 0,
                  rpe: 0
                });
              });
            });
        }
      });
      
      return flatData;
    };

    // Reference to the 'workouts' node in Realtime Database
    const workoutsRef = ref(realtimeDb, '/'); 

    const unsubscribe = onValue(workoutsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mapped = parseDataToFlat(data);
        setWorkouts(tagWorkoutData(mapped));
      }
      setLoading(false);
    }, (error) => {
      console.error("Realtime Database listen failed:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { workouts, updateSplit, loading };
};
