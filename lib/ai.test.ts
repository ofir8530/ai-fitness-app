import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeFood,
  chooseBestOpenFoodFactsProduct,
  estimateFoodFromText,
  extractExplicitFoodTerms,
  resolveGeminiModel,
} from './ai.ts';
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

test('extractExplicitFoodTerms keeps only values the user actually typed', async () => {
  const result = await extractExplicitFoodTerms('סלט טונה');

  assert.deepEqual(result, ['סלט טונה']);
  assert.ok(!result.some((value) => /לחם|רוטב|גבינה|תוספת/i.test(value)));
});

test('estimateFoodFromText changes meaningfully when the user adds explicit ingredients', async () => {
  const base = await estimateFoodFromText('סלט טונה');
  const withBread = await estimateFoodFromText('סלט טונה עם פרוסת לחם');

  assert.ok(withBread.calories > base.calories + 60, 'bread should meaningfully increase calories');
  assert.ok(withBread.protein >= base.protein + 3, 'bread should add protein');
  assert.ok(withBread.carbs > base.carbs + 10, 'bread should increase carbs');
});

test('analyzeFood does not call AI for plain text and keeps ingredients explicit-only', async () => {
  const originalFetch = global.fetch;
  const originalGeminiKey = process.env.GEMINI_API_KEY;
  const originalOpenAIKey = process.env.OPENAI_API_KEY;
  let fetchCalled = false;

  process.env.GEMINI_API_KEY = 'test-gemini-key';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  global.fetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"description":"סלט טונה","calories":220,"protein":40,"carbs":22,"fats":12,"ingredients":["סלט טונה"]}' }] } }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const result = await analyzeFood('סלט טונה');

    assert.ok(result);
    assert.equal(result?.description, 'סלט טונה');
    assert.deepEqual(result?.ingredients, ['סלט טונה']);
    assert.equal(fetchCalled, false);
  } finally {
    if (originalGeminiKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalGeminiKey;
    if (originalOpenAIKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalOpenAIKey;
    global.fetch = originalFetch;
  }
});
