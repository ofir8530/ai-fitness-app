export type WorkoutEntry = {
  id: string;
  type: string;
  title: string;
  time: string;
  duration: number;
  calories: number;
  icon: string;
  bg: string;
  color: string;
};

export type WorkoutDraft = {
  id?: string;
  type: string;
  duration: number | string;
  calories: number | string;
};

export const WORKOUT_STORAGE_KEY = 'calceat-workouts-v1';

export const workoutMeta: Record<string, { title: string; icon: string; bg: string; color: string }> = {
  pilates: { title: 'פילאטיס', icon: 'self_improvement', bg: 'bg-primary-fixed', color: 'text-primary' },
  yoga: { title: 'יוגה', icon: 'self_improvement', bg: 'bg-secondary-fixed', color: 'text-secondary' },
  strength: { title: 'אימון כוח', icon: 'fitness_center', bg: 'bg-primary-fixed', color: 'text-primary' },
  hiit: { title: 'HIIT', icon: 'fitness_center', bg: 'bg-secondary-fixed', color: 'text-secondary' },
  walking: { title: 'הליכה', icon: 'directions_walk', bg: 'bg-tertiary-fixed', color: 'text-tertiary' },
  running: { title: 'ריצה', icon: 'directions_run', bg: 'bg-primary-fixed', color: 'text-primary' },
};

export function buildWorkoutEntry(type: string, duration: number, calories: number): WorkoutEntry {
  const meta = workoutMeta[type] ?? workoutMeta.pilates;
  const now = new Date();
  const time = `היום, ${now.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    title: meta.title,
    time,
    duration: Math.max(0, Number(duration) || 0),
    calories: Math.max(0, Number(calories) || 0),
    icon: meta.icon,
    bg: meta.bg,
    color: meta.color,
  };
}

export function applyWorkoutDraft(
  workouts: WorkoutEntry[],
  draft: WorkoutDraft
): WorkoutEntry[] {
  const type = String(draft.type || 'pilates');
  const safeDuration = Math.max(0, Number(draft.duration) || 0);
  const safeCalories = Math.max(0, Number(draft.calories) || 0);
  const meta = workoutMeta[type] ?? workoutMeta.pilates;

  if (draft.id) {
    return workouts.map((workout) =>
      workout.id === draft.id
        ? {
            ...workout,
            type,
            title: meta.title,
            duration: safeDuration,
            calories: safeCalories,
            icon: meta.icon,
            bg: meta.bg,
            color: meta.color,
          }
        : workout
    );
  }

  return [buildWorkoutEntry(type, safeDuration, safeCalories), ...workouts];
}

export function removeWorkoutEntry(workouts: WorkoutEntry[], id: string): WorkoutEntry[] {
  return workouts.filter((workout) => workout.id !== id);
}
