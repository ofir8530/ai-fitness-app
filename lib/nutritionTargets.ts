import type { NutritionTargets } from './nutritionDay';

export type UserProfileInput = {
  age: number;
  gender: string;
  weight: number;
  height: number;
  goal: string;
  targetWeight?: number;
  activityLevel: number;
  dietaryPreferences?: string[];
};

export type StoredNutritionProfile = {
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
  goal?: string | null;
  target_weight?: number | null;
  activity_level?: number | null;
  dietary_preferences?: unknown;
  daily_calories?: number | null;
  protein_target?: number | null;
  carbs_target?: number | null;
  fats_target?: number | null;
  ai_nutrition_insight?: string | null;
};

export type ResolvedNutrition = NutritionTargets & {
  insight?: string;
};

function asDietList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeGoal(goal: string): 'lose' | 'maintain' | 'gain' {
  const normalized = (goal || 'maintain').toLowerCase();
  if (normalized.includes('lose') || normalized.includes('cut') || normalized.includes('fat')) {
    return 'lose';
  }
  if (normalized.includes('gain') || normalized.includes('muscle') || normalized.includes('bulk')) {
    return 'gain';
  }
  return 'maintain';
}

function safeNumber(value: number | string | null | undefined, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function calculateBmr(profile: UserProfileInput) {
  const weight = safeNumber(profile.weight, 0);
  const height = safeNumber(profile.height, 0);
  const age = safeNumber(profile.age, 0);
  const isMale = (profile.gender || 'female').toLowerCase().startsWith('m');

  if (!weight || !height || !age) return 0;

  return isMale
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateNutritionTargets(profile: UserProfileInput): ResolvedNutrition {
  const weight = safeNumber(profile.weight, 0);
  const height = safeNumber(profile.height, 0);
  const age = safeNumber(profile.age, 0);
  const goal = normalizeGoal(profile.goal);
  const activityLevel = safeNumber(profile.activityLevel, 1.2);
  const targetWeight = safeNumber(profile.targetWeight ?? profile.weight, weight);

  if (!weight || !height || !age) {
    return { dailyCalories: 0, protein: 0, carbs: 0, fats: 0, insight: 'לא מספיק נתונים לחישוב יעדי תזונה.' };
  }

  const bmr = calculateBmr(profile);
  const tdee = bmr * activityLevel;

  let dailyCalories = tdee;
  if (goal === 'lose') {
    dailyCalories = Math.max(1200, tdee - Math.max(300, weight * 0.2));
  } else if (goal === 'gain') {
    dailyCalories = tdee + Math.max(200, weight * 0.15);
  }

  const proteinFactor = goal === 'gain' ? 2.2 : goal === 'lose' ? 1.8 : 1.8;
  const protein = Math.round(Math.max(80, proteinFactor * Math.max(weight, targetWeight)));

  const fatsFactor = goal === 'lose' ? 0.7 : goal === 'gain' ? 0.9 : 0.8;
  const fats = Math.round(Math.max(45, fatsFactor * Math.max(weight, targetWeight)));

  const proteinCalories = protein * 4;
  const fatCalories = fats * 9;
  const remainingCalories = Math.max(0, dailyCalories - proteinCalories - fatCalories);
  const carbs = Math.round(Math.max(50, remainingCalories / 4));

  const goalText =
    goal === 'lose'
      ? 'חיטוב / ירידה במשקל'
      : goal === 'gain'
        ? 'עלייה במסת שריר'
        : 'שמירה / חיטוב';

  const insight = `היעד מחושב לפי Mifflin-St Jeor, רמת הפעילות והיעד ${goalText}. המטרה היא לייצר גרעון/עודף קלורי מבוקר תוך שמירה על חלבון מספיק לכל יום.`;

  return {
    dailyCalories: Math.round(dailyCalories),
    protein,
    carbs,
    fats,
    insight,
  };
}

function hasStoredTargets(profile: StoredNutritionProfile): boolean {
  return Boolean(
    profile.daily_calories &&
      profile.daily_calories > 0 &&
      profile.protein_target &&
      profile.protein_target > 0
  );
}

function fromStored(profile: StoredNutritionProfile): ResolvedNutrition {
  return {
    dailyCalories: Number(profile.daily_calories) || 0,
    protein: Number(profile.protein_target) || 0,
    carbs: Number(profile.carbs_target) || 0,
    fats: Number(profile.fats_target) || 0,
    insight: profile.ai_nutrition_insight || undefined,
  };
}

function profileToInput(profile: StoredNutritionProfile): UserProfileInput | null {
  if (!profile.age || !profile.weight || !profile.height) return null;
  return {
    age: profile.age,
    gender: profile.gender || 'female',
    weight: profile.weight,
    height: profile.height,
    goal: profile.goal || 'maintain',
    targetWeight: profile.target_weight ?? profile.weight,
    activityLevel: profile.activity_level || 1.2,
    dietaryPreferences: asDietList(profile.dietary_preferences),
  };
}

export async function resolveNutritionTargets(
  profile: StoredNutritionProfile
): Promise<ResolvedNutrition> {
  if (hasStoredTargets(profile)) {
    return fromStored(profile);
  }

  const input = profileToInput(profile);
  if (!input) {
    return { dailyCalories: 0, protein: 0, carbs: 0, fats: 0 };
  }

  return calculateNutritionTargets(input);
}

export function nutritionTargetsToDbFields(analysis: ResolvedNutrition) {
  return {
    daily_calories: analysis.dailyCalories,
    protein_target: analysis.protein,
    carbs_target: analysis.carbs,
    fats_target: analysis.fats,
    ai_nutrition_insight: analysis.insight || null,
  };
}
