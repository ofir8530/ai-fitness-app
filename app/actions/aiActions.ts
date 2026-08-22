'use server';

import {
  analyzeFood,
  searchFoodFromOpenFoodFacts,
  type FoodSearchSource,
} from '@/lib/ai';

export async function getFoodAnalysis(
  input: string,
  source: FoodSearchSource = 'text'
) {
  const rawInput = String(input ?? '').trim();
  console.log('[getFoodAnalysis] source:', source);
  console.log(
    '[getFoodAnalysis] raw input:',
    source === 'image' ? { length: rawInput.length, preview: rawInput.slice(0, 120) } : rawInput
  );

  try {
    if (source === 'text') {
      console.log('[getFoodAnalysis] looking up OpenFoodFacts for:', rawInput);
      const externalResult = await searchFoodFromOpenFoodFacts(rawInput);
      if (externalResult) {
        console.log('[getFoodAnalysis] OpenFoodFacts result:', externalResult);
        return externalResult;
      }
    }

    const result = await analyzeFood(rawInput);
    console.log('[getFoodAnalysis] final AI result:', result);
    return result;
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('נכשלנו בניתוח האוכל');
  }
}