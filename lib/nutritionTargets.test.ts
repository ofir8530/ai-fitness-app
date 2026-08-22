import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateNutritionTargets } from './nutritionTargets.ts';

test('calculateNutritionTargets uses Mifflin-St Jeor and goal adjustment instead of AI', () => {
  const result = calculateNutritionTargets({
    age: 32,
    gender: 'male',
    weight: 80,
    height: 180,
    goal: 'lose',
    activityLevel: 1.375,
  });

  assert.ok(result.dailyCalories > 0);
  assert.ok(result.protein > 0);
  assert.ok(result.carbs > 0);
  assert.ok(result.fats > 0);
  assert.match(result.insight ?? '', /Mifflin-St Jeor|חיטוב/i);
});
