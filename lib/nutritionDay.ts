export type FoodLog = {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
};

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type NutritionTargets = {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export function sumFoodLogs(logs: Pick<FoodLog, 'calories' | 'protein' | 'carbs' | 'fats'>[]): DailyTotals {
  return logs.reduce(
    (acc, log) => ({
      calories: acc.calories + (Number(log.calories) || 0),
      protein: acc.protein + (Number(log.protein) || 0),
      carbs: acc.carbs + (Number(log.carbs) || 0),
      fats: acc.fats + (Number(log.fats) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

export function subtractFoodLogTotals(
  current: DailyTotals,
  removed: Pick<FoodLog, 'calories' | 'protein' | 'carbs' | 'fats'>
): DailyTotals {
  return {
    calories: Math.max(0, (Number(current.calories) || 0) - (Number(removed.calories) || 0)),
    protein: Math.max(0, (Number(current.protein) || 0) - (Number(removed.protein) || 0)),
    carbs: Math.max(0, (Number(current.carbs) || 0) - (Number(removed.carbs) || 0)),
    fats: Math.max(0, (Number(current.fats) || 0) - (Number(removed.fats) || 0)),
  };
}

export function todayRangeISO() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatMealTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function progressRatio(consumed: number, target: number) {
  if (!target || target <= 0) return 0;
  return Math.min(consumed / target, 1);
}
