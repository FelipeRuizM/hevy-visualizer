/**
 * Bodyweight-loaded exercises. What gets *logged* for these is the added load,
 * but every weight the app reasons about (volume, PRs, warm-up ratios) is the
 * total the body actually moves — so `useWorkouts` folds bodyweight in on read
 * and the logger strips it back off for entry. Keep the two in step by using
 * these helpers rather than re-declaring the list.
 */
export const BODYWEIGHT_EXERCISES = ['Pull Up', 'Chin Up', 'Dip', 'Push Up', 'Muscle Up'];

export const isBodyweightExercise = (exerciseTitle: string): boolean =>
  BODYWEIGHT_EXERCISES.includes(exerciseTitle);

/** Bodyweight (kg) to fold into a set logged on `date`. */
export const getBodyweightAddition = (date: Date): number =>
  date >= new Date('2026-02-01') ? 80 : 73;
