'use server';

export type RecipeNutritionInput = {
  title: string;
  ingredients: string[];
  steps?: string[];
  servings?: number;
};

function estimateCaloriesFromIngredients(ingredients: string[]) {
  const normalized = ingredients.join(' ').toLowerCase();
  let calories = 200;

  if (normalized.includes('chicken') || normalized.includes('turkey')) calories += 280;
  if (normalized.includes('beef') || normalized.includes('salmon') || normalized.includes('tuna')) calories += 260;
  if (normalized.includes('egg')) calories += 90;
  if (normalized.includes('rice') || normalized.includes('pasta') || normalized.includes('couscous')) calories += 180;
  if (normalized.includes('bread') || normalized.includes('toast')) calories += 120;
  if (normalized.includes('avocado')) calories += 120;
  if (normalized.includes('olive oil') || normalized.includes('oil')) calories += 120;
  if (normalized.includes('cheese')) calories += 120;
  if (normalized.includes('yogurt') || normalized.includes('milk')) calories += 90;
  if (normalized.includes('sweet potato') || normalized.includes('potato')) calories += 100;
  if (normalized.includes('bean') || normalized.includes('lentil') || normalized.includes('chickpea')) calories += 150;
  if (normalized.includes('vegetable') || normalized.includes('salad') || normalized.includes('spinach')) calories += 80;

  return Math.max(180, calories);
}

export async function getRecipeNutritionAnalysis(recipe: RecipeNutritionInput) {
  const ingredientCount = Math.max(recipe.ingredients.length, 1);
  const calories = estimateCaloriesFromIngredients(recipe.ingredients) * Math.max(1, Math.ceil(ingredientCount / 3));
  const protein = Math.round(calories * 0.22 / 4);
  const carbs = Math.round(calories * 0.38 / 4);
  const fats = Math.round(calories * 0.4 / 9);

  return {
    calories: Math.round(calories),
    protein,
    carbs,
    fats,
    insight: 'הערכות בסיסיות מבוססות על המרכיבים והכמויות, ללא שימוש ב-AI כדי להימנע מבזבוז חישובי.',
  };
}
