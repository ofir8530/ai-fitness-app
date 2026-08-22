'use server';

import {
  analyzeFood,
  estimateFoodFromText,
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
      console.log('[getFoodAnalysis] text route: OpenFoodFacts lookup only');
      const externalResult = await searchFoodFromOpenFoodFacts(rawInput);
      if (externalResult) {
        console.log('[getFoodAnalysis] OpenFoodFacts result:', externalResult);
        return externalResult;
      }

      const explicitTextFallback = await estimateFoodFromText(rawInput);
      console.log('[getFoodAnalysis] text fallback without AI:', explicitTextFallback);
      return explicitTextFallback;
    }

    const result = await analyzeFood(rawInput);
    console.log('[getFoodAnalysis] image/complex analysis result:', result);
    return result;
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('נכשלנו בניתוח האוכל');
  }
}