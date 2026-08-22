import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateNutritionTargets } from './nutritionTargets.ts';
import {
  buildWorkoutEntry,
  mapEntryToDbWorkout,
} from './workouts.ts';

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

test('workout insert payload omits invalid manual ids and keeps valid UUIDs', () => {
  const workout = buildWorkoutEntry('pilates', 35, 220);
  assert.match(workout.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

  const payload = mapEntryToDbWorkout(workout, 'user-123');
  assert.equal(payload.user_id, 'user-123');
  assert.equal(payload.id, workout.id);
  assert.ok(Object.hasOwn(payload, 'id'));

  const invalidEntry = { ...workout, id: '1787408045464-abc' };
  const invalidPayload = mapEntryToDbWorkout(invalidEntry, 'user-456');
  assert.ok(!Object.hasOwn(invalidPayload, 'id'));
});
