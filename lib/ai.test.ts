import test from 'node:test';
import assert from 'node:assert/strict';

import { chooseBestOpenFoodFactsProduct, resolveGeminiModel } from './ai.ts';
import { subtractFoodLogTotals } from './nutritionDay';
import { trimChatHistory } from './chat';

test('resolveGeminiModel uses a supported Gemini 3.x model', async () => {
  const model = await resolveGeminiModel();
  assert.match(model, /^gemini-3\./);
});

test('subtractFoodLogTotals removes the exact nutrition values from the daily total', () => {
  const totals = { calories: 1200, protein: 90, carbs: 150, fats: 40 };
  const removed = { calories: 320, protein: 24, carbs: 44, fats: 12 };

  assert.deepEqual(subtractFoodLogTotals(totals, removed), {
    calories: 880,
    protein: 66,
    carbs: 106,
    fats: 28,
  });
});

test('trimChatHistory keeps only the latest unique messages before sending to Gemini', async () => {
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: 'hi' },
    { role: 'assistant', content: 'hi' },
    { role: 'user', content: 'hi' },
    { role: 'user', content: 'What should I eat before training?' },
    { role: 'assistant', content: 'Aim for a light carb snack like banana.' },
    { role: 'user', content: 'How many grams of protein should I target?' },
    { role: 'assistant', content: 'Aim for 1.6-2.2g/kg.' },
  ];

  const trimmed = await trimChatHistory(history, 5);

  assert.deepEqual(trimmed, [
    { role: 'user', content: 'hi' },
    { role: 'user', content: 'What should I eat before training?' },
    { role: 'assistant', content: 'Aim for a light carb snack like banana.' },
    { role: 'user', content: 'How many grams of protein should I target?' },
    { role: 'assistant', content: 'Aim for 1.6-2.2g/kg.' },
  ]);
});

test('chooseBestOpenFoodFactsProduct prefers the best matching product with nutrition values', async () => {
  const result = await chooseBestOpenFoodFactsProduct({
    products: [
      {
        product_name: 'Yogurt Plain',
        nutriments: {
          'energy-kcal_100g': 59,
          proteins_100g: 10,
          carbohydrates_100g: 3.6,
          fat_100g: 0.4,
        },
      },
      {
        product_name: 'Banana',
        nutriments: {
          'energy-kcal_100g': 89,
          proteins_100g: 1.1,
          carbohydrates_100g: 22.8,
          fat_100g: 0.3,
        },
      },
    ],
  });

  assert.ok(result);
  assert.equal(result?.description, 'Yogurt Plain');
  assert.equal(result?.calories, 59);
  assert.equal(result?.protein, 10);
  assert.equal(result?.carbs, 3.6);
  assert.equal(result?.fats, 0.4);
});
