import type { Recipe } from './recipes';

const USER_RECIPES_KEY = 'calceat-user-recipes';
const NUTRITION_CACHE_KEY = 'calceat-recipe-nutrition-cache';

type NutritionCache = Record<
  string,
  {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    insight?: string;
  }
>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUserRecipes(): Recipe[] {
  return readJson<Recipe[]>(USER_RECIPES_KEY, []);
}

export function saveUserRecipe(recipe: Recipe) {
  const existing = getUserRecipes();
  const idx = existing.findIndex((r) => r.id === recipe.id);
  const next =
    idx >= 0
      ? existing.map((r) => (r.id === recipe.id ? recipe : r))
      : [recipe, ...existing];
  writeJson(USER_RECIPES_KEY, next);
}

function estimateNutritionFromIngredients(ingredients: string[]) {
  const ingredientText = ingredients.join(' ').toLowerCase();
  let calories = 220;

  if (/עוף|chicken|דג|tuna|salmon|beef|steak|turkey/.test(ingredientText)) calories += 260;
  if (/אורז|rice|פסטה|pasta|קינואה|quinoa|couscous/.test(ingredientText)) calories += 220;
  if (/אבוקדו|avocado/.test(ingredientText)) calories += 140;
  if (/שמן|oil|חמאה|butter/.test(ingredientText)) calories += 120;
  if (/גבינה|cheese|יוגורט|yogurt/.test(ingredientText)) calories += 110;
  if (/סלט|vegetable|spinach|lettuce/.test(ingredientText)) calories += 80;
  if (/שקד|almond|nut|peanut/.test(ingredientText)) calories += 110;

  const protein = Math.max(12, Math.round(calories * 0.23));
  const carbs = Math.max(20, Math.round(calories * 0.38));
  const fats = Math.max(10, Math.round(calories * 0.39));

  return { calories: Math.round(calories), protein, carbs, fats };
}

export function getRecipeById(id: string, builtins: Recipe[]): Recipe | undefined {
  const user = getUserRecipes().find((r) => r.id === id);
  if (user) return user;
  const builtin = builtins.find((r) => r.id === id);
  if (!builtin) return undefined;

  const cache = getNutritionCache();
  const cached = cache[id];
  const fallback =
    builtin.calories > 0 || builtin.protein > 0 || builtin.carbs > 0 || builtin.fats > 0
      ? {
          calories: builtin.calories,
          protein: builtin.protein,
          carbs: builtin.carbs,
          fats: builtin.fats,
          aiInsight: builtin.aiInsight,
        }
      : estimateNutritionFromIngredients(builtin.ingredients);

  if (cached && cached.calories > 0) {
    return {
      ...builtin,
      calories: cached.calories,
      protein: cached.protein,
      carbs: cached.carbs,
      fats: cached.fats,
      aiInsight: cached.insight,
    };
  }

  return {
    ...builtin,
    ...fallback,
  };
}

export function getNutritionCache(): NutritionCache {
  return readJson<NutritionCache>(NUTRITION_CACHE_KEY, {});
}

export function cacheRecipeNutrition(
  id: string,
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    insight?: string;
  }
) {
  const cache = getNutritionCache();
  cache[id] = nutrition;
  writeJson(NUTRITION_CACHE_KEY, cache);
}

export function createRecipeId() {
  return `user-${Date.now()}`;
}

export const DEFAULT_RECIPE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCzKbwku5eAjFZ94_v67F6rJTK-vB_zkBT0x-VZbfmLwrGd8dF7NQ3Zj0A4mAWCL1alRv-zCmu5ygo2P3b5O0oBXxy_SwoPIgYLeCZfE6FQlC1O2CtqbDItgfag_OGxv_xgN4DkZ2e3uj-pVkYWCKLp2V2Ko7NgyMuwDSorVd5Ut6YDhxvAaBOyUm8SQv_NPfTSsSjTwMi-s5MULim6dXMivq7t5sCkIL_PsUirNdldOVZ6k13h39eE';
