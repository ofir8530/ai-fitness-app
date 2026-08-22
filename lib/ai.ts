'use server';

import OpenAI from 'openai';

export type FoodAnalysis = {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
};

export type FoodSearchSource = 'text' | 'image';

type OpenFoodFactsProduct = {
  product_name?: string;
  generic_name?: string;
  brands?: string;
  ingredients_text?: string;
  nutriments?: Record<string, string | number | undefined>;
};

export async function resolveGeminiModel() {
  return (process.env.GEMINI_MODEL ?? 'gemini-3.6-flash').trim() || 'gemini-3.6-flash';
}

const GEMINI_MODEL = 'gemini-3.6-flash';

function toNumberFromValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getBestProductName(product: OpenFoodFactsProduct) {
  return product.product_name || product.generic_name || product.brands || 'מוצר';
}

function parseJsonLoose(text: string) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(cleaned.slice(start, end + 1));
  }
  return JSON.parse(cleaned);
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function extractExplicitFoodTerms(input: string): Promise<string[]> {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const parts = trimmed
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length ? parts : [trimmed];
}

export async function estimateFoodFromText(input: string): Promise<FoodAnalysis> {
  const trimmed = input.trim();
  const explicitIngredients = trimmed ? [trimmed] : [];
  const normalized = trimmed.toLowerCase();

  let calories = 160;
  let protein = 18;
  let carbs = 16;
  let fats = 8;

  if (/טונה|tuna/.test(normalized)) {
    calories += 95;
    protein += 16;
    fats += 3;
  }

  if (/עוף|chicken/.test(normalized)) {
    calories += 120;
    protein += 22;
    fats += 5;
  }

  if (/ביצה|egg/.test(normalized)) {
    calories += 80;
    protein += 7;
    fats += 5;
  }

  if (/סלט|salad/.test(normalized)) {
    calories += 45;
    carbs += 10;
  }

  if (/(עם|with)\s+((פרוסת\s+)?לחם|bread|toast|pita|bagel|sandwich)/.test(normalized)) {
    calories += 140;
    protein += 5;
    carbs += 24;
    fats += 2;
  }

  if (/(עם|with)\s+((פרוסת\s+)?גבינה|cheese)/.test(normalized)) {
    calories += 120;
    protein += 8;
    fats += 9;
  }

  if (/(עם|with)\s+((חתיכת\s+)?אבוקדו|avocado)/.test(normalized)) {
    calories += 160;
    carbs += 12;
    fats += 15;
  }

  if (/(עם|with)\s+((כמות\s+)?רוטב|sauce|oil|שמן)/.test(normalized)) {
    calories += 100;
    fats += 11;
  }

  if (trimmed.length > 20) {
    calories += Math.min(70, Math.round(trimmed.length * 0.8));
  }

  return {
    description: trimmed.slice(0, 80) || 'ארוחה',
    calories: Math.max(60, Math.round(calories)),
    protein: Math.max(8, Math.round(protein)),
    carbs: Math.max(8, Math.round(carbs)),
    fats: Math.max(4, Math.round(fats)),
    ingredients: explicitIngredients.length ? explicitIngredients : ['מזון'],
  };
}

function getOpenFoodFactsMealScale(query: string) {
  const normalized = query.toLowerCase();

  let servingWeight = 220;
  if (/סלט|salad|bowls?|רוסטב|wrap|soup/.test(normalized)) servingWeight = 260;
  if (/(עם|with)\s+((פרוסת\s+)?לחם|bread|toast|sandwich)/.test(normalized)) servingWeight += 80;
  if (/(עם|with)\s+((פרוסת\s+)?גבינה|cheese)/.test(normalized)) servingWeight += 40;
  if (/(עם|with)\s+((חתיכת\s+)?אבוקדו|avocado)/.test(normalized)) servingWeight += 50;
  if (/(עם|with)\s+((כמות\s+)?רוטב|sauce|oil|שמן)/.test(normalized)) servingWeight += 25;
  if (/(שניצל|burger|פיתה| pita|bagel)/.test(normalized)) servingWeight += 60;

  return Math.max(180, Math.min(420, servingWeight));
}

function getExplicitMealAdditions(query: string) {
  const normalized = query.toLowerCase();
  const bonuses = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  if (/(עם|with)\s+((פרוסת\s+)?לחם|bread|toast)/.test(normalized)) {
    bonuses.calories += 150;
    bonuses.protein += 6;
    bonuses.carbs += 25;
    bonuses.fats += 2;
  }

  if (/(עם|with)\s+((פרוסת\s+)?גבינה|cheese)/.test(normalized)) {
    bonuses.calories += 110;
    bonuses.protein += 7;
    bonuses.carbs += 1;
    bonuses.fats += 9;
  }

  if (/(עם|with)\s+((חתיכת\s+)?אבוקדו|avocado)/.test(normalized)) {
    bonuses.calories += 160;
    bonuses.protein += 2;
    bonuses.carbs += 12;
    bonuses.fats += 15;
  }

  if (/(עם|with)\s+((כמות\s+)?רוטב|sauce|oil|שמן)/.test(normalized)) {
    bonuses.calories += 110;
    bonuses.protein += 0;
    bonuses.carbs += 1;
    bonuses.fats += 12;
  }

  return bonuses;
}

export async function chooseBestOpenFoodFactsProduct(
  payload: {
    products?: OpenFoodFactsProduct[];
  } | null | undefined,
  query = ''
): Promise<FoodAnalysis | null> {
  if (!payload?.products?.length) return null;

  for (const product of payload.products) {
    const nutriments = product.nutriments ?? {};
    const caloriesPer100 =
      toNumberFromValue(
        nutriments['energy-kcal_100g'] ??
          nutriments['energy-kcal_serving'] ??
          nutriments['energy_100g'] ??
          nutriments['energy-kj_100g']
      ) || 0;
    const proteinPer100 =
      toNumberFromValue(
        nutriments.proteins_100g ?? nutriments.protein_100g ?? nutriments.proteins
      ) || 0;
    const carbsPer100 =
      toNumberFromValue(
        nutriments.carbohydrates_100g ??
          nutriments.carbohydrate_100g ??
          nutriments.carbohydrates
      ) || 0;
    const fatsPer100 =
      toNumberFromValue(
        nutriments.fat_100g ?? nutriments.fats_100g ?? nutriments.fat
      ) || 0;

    if (caloriesPer100 <= 0 && proteinPer100 <= 0 && carbsPer100 <= 0 && fatsPer100 <= 0) {
      continue;
    }

    const ingredients = product.ingredients_text && product.ingredients_text.trim()
      ? product.ingredients_text
          .split(/[,:;]|\n/)
          .map((part) => part.trim())
          .filter(Boolean)
          .slice(0, 6)
      : ['מזון'];

    if (!query.trim()) {
      return {
        description: getBestProductName(product),
        calories: caloriesPer100,
        protein: proteinPer100,
        carbs: carbsPer100,
        fats: fatsPer100,
        ingredients,
      };
    }

    const servingWeight = getOpenFoodFactsMealScale(query);
    const explicitBonuses = getExplicitMealAdditions(query);
    const scaledCalories = Math.max(0, Math.round((caloriesPer100 * servingWeight) / 100 + explicitBonuses.calories));
    const scaledProtein = Math.max(0, Math.round((proteinPer100 * servingWeight) / 100 + explicitBonuses.protein));
    const scaledCarbs = Math.max(0, Math.round((carbsPer100 * servingWeight) / 100 + explicitBonuses.carbs));
    const scaledFats = Math.max(0, Math.round((fatsPer100 * servingWeight) / 100 + explicitBonuses.fats));

    return {
      description: getBestProductName(product),
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fats: scaledFats,
      ingredients,
    };
  }

  return null;
}

export async function searchFoodFromOpenFoodFacts(
  query: string
): Promise<FoodAnalysis | null> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return null;

  try {
    const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
    url.searchParams.set('search_terms', normalizedQuery);
    url.searchParams.set('search_simple', '1');
    url.searchParams.set('action', 'process');
    url.searchParams.set('json', '1');
    url.searchParams.set('page_size', '5');
    url.searchParams.set(
      'fields',
      'product_name,generic_name,brands,ingredients_text,nutriments'
    );

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return chooseBestOpenFoodFactsProduct(data, normalizedQuery);
  } catch (error) {
    console.warn('Open Food Facts search failed:', error);
    return null;
  }
}

export type UserNutritionAnalysis = {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  insight: string;
};

export type RecipeNutritionInput = {
  title: string;
  ingredients: string[];
  steps?: string[];
  servings?: number;
};

export type RecipeNutritionAnalysis = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  insight: string;
};

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim();
}

function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

async function callGeminiJson(prompt: string, imageBase64?: string) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const model = await resolveGeminiModel();

    const parts: Array<any> = [{ text: prompt }];

    if (imageBase64) {
      const matches = imageBase64.match(/^data:(image\/[a-zA-Z+-]+);base64,(.+)$/);
      if (matches) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2],
          },
        });
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Gemini API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[Gemini raw response]', data);
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? '')
        .join('') || '';

    if (!text) return null;
    return parseJsonLoose(text);
  } catch (error) {
    console.warn('Gemini API failed:', error);
    return null;
  }
}

async function callOpenAiJson(prompt: string) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) return null;

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content || '{}';
    return parseJsonLoose(text);
  } catch (error) {
    console.warn('OpenAI API failed:', error);
    return null;
  }
}

async function callHybridJson(prompt: string, imageBase64?: string) {
  const geminiResult = await callGeminiJson(prompt, imageBase64);
  if (geminiResult) return geminiResult;

  // OpenAI fallback still text-only here; if you want image support on the
  // fallback too, use gpt-4o (not mini) with an image_url content part.
  return callOpenAiJson(prompt);
}

function normalizeAnalysis(raw: unknown): FoodAnalysis | null {
  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as Record<string, unknown>;
  const description =
    typeof candidate.description === 'string' && candidate.description.trim()
      ? candidate.description.trim()
      : 'ארוחה';

  const ingredientList: string[] = [];
  if (Array.isArray(candidate.ingredients)) {
    for (const item of candidate.ingredients) {
      if (typeof item === 'string' && item.trim()) {
        ingredientList.push(item.trim());
        continue;
      }

      if (item && typeof item === 'object') {
        const ingredient = item as Record<string, unknown>;
        const name =
          typeof ingredient.name === 'string' && ingredient.name.trim()
            ? ingredient.name.trim()
            : '';
        if (name) ingredientList.push(name);
      }
    }
  }

  const safeIngredients = ingredientList.length
    ? ingredientList
    : [description || 'מזון'];

  return {
    description,
    calories: toNumber(candidate.calories),
    protein: toNumber(candidate.protein),
    carbs: toNumber(candidate.carbs),
    fats: toNumber(candidate.fats),
    ingredients: safeIngredients,
  };
}

function normalizeUserNutrition(raw: unknown): UserNutritionAnalysis | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;
  const insight =
    typeof c.insight === 'string' && c.insight.trim() ? c.insight.trim() : '';
  const dailyCalories = toNumber(c.dailyCalories ?? c.calories);
  const protein = toNumber(c.protein);
  const carbs = toNumber(c.carbs);
  const fats = toNumber(c.fats);
  if (!dailyCalories && !protein) return null;
  return { dailyCalories, protein, carbs, fats, insight };
}

function normalizeRecipeNutrition(raw: unknown): RecipeNutritionAnalysis | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;
  const insight =
    typeof c.insight === 'string' && c.insight.trim() ? c.insight.trim() : '';
  const calories = toNumber(c.calories);
  const protein = toNumber(c.protein);
  const carbs = toNumber(c.carbs);
  const fats = toNumber(c.fats);
  if (!calories && !protein) return null;
  return { calories, protein, carbs, fats, insight };
}

function fallbackUserNutrition(profile: UserProfileInput): UserNutritionAnalysis {
  const fallbackCalories = Math.max(1200, Math.round(profile.weight * 22 + profile.height * 0.6 - profile.age * 2.5));
  const protein = Math.max(80, Math.round(profile.weight * 1.7));
  const carbs = Math.max(120, Math.round(fallbackCalories * 0.4 / 4));
  const fats = Math.max(40, Math.round(fallbackCalories * 0.3 / 9));

  return {
    dailyCalories: fallbackCalories,
    protein,
    carbs,
    fats,
    insight: 'הערכה בסיסית על פי נתוני הפרופיל, ללא תלות ב-AI, כדי להימנע מקריסה של הזרימה.',
  };
}

function fallbackRecipeNutrition(recipe: RecipeNutritionInput): RecipeNutritionAnalysis {
  const ingredientText = recipe.ingredients.join(' ').toLowerCase();
  let calories = 220;

  if (/עוף|chicken|דג|tuna|salmon|beef|steak|turkey/.test(ingredientText)) calories += 260;
  if (/אורז|rice|פסטה|pasta|קינואה|quinoa|couscous/.test(ingredientText)) calories += 220;
  if (/אבוקדו|avocado/.test(ingredientText)) calories += 140;
  if (/שמן|oil|חמאה|butter/.test(ingredientText)) calories += 120;
  if (/גבינה|cheese|יוגורט|yogurt/.test(ingredientText)) calories += 110;
  if (/סלט|vegetable|spinach|lettuce/.test(ingredientText)) calories += 80;

  const protein = Math.max(12, Math.round(calories * 0.23));
  const carbs = Math.max(20, Math.round(calories * 0.38));
  const fats = Math.max(10, Math.round(calories * 0.39));

  return {
    calories: Math.round(calories),
    protein,
    carbs,
    fats,
    insight: 'הערכה בסיסית על פי המרכיבים, ללא שימוש ב-AI, כדי להבטיח תצוגה תקינה גם כששירותי המודל אינם זמינים.',
  };
}

export async function analyzeFood(input: string, imageBase64?: string): Promise<FoodAnalysis | null> {
  const normalizedInput = input?.trim() || '';

  // אם input עצמו הוא data URI של תמונה (למשל, מגיע ככה מ-getFoodAnalysis
  // כשה-source הוא "image"), נעביר אותו כ-imageBase64 בפועל, ולא כטקסט חופשי.
  const isDataUri = /^data:image\/[a-zA-Z+-]+;base64,/.test(normalizedInput);
  const effectiveImage = imageBase64 || (isDataUri ? normalizedInput : undefined);
  const textInput = isDataUri ? '' : normalizedInput;

  if (!textInput && !effectiveImage) return null;

  // Plain text entries must never hit AI. They are resolved directly from the external food database
  // or by a conservative explicit-text fallback without inventing extra ingredients.
  if (!effectiveImage && textInput) {
    console.log('[analyzeFood] plain text route: skipping AI and returning explicit-only estimate');
    return estimateFoodFromText(textInput);
  }

  const prompt = `את מומחית תזונה ומערכות ניתוח מזון. התפקיד שלך הוא לנתח את נתוני הקלט (טקסט ו/או תמונה מצורפת) ולהחזיר אובייקט JSON תקני בלבד, ללא שום טקסט נוסף לפני או אחרי.

מבנה ה-JSON הנדרש לחזרה:
{
  "description": "תיאור מפורט ומדויק של המנה",
  "calories": מספר שלם (הערכה קלורית),
  "protein": מספר (גרם חלבון),
  "carbs": מספר (גרם פחמימות),
  "fats": מספר (גרם שומנים),
  "ingredients": ["רשימת", "מרכיבים", "שנכתבו או נראים במפורש"]
}

הנחיות קריטיות מחייבות:
1. אל תוסיף מאף פעם רכיבים שלא צוינו במפורש בטקסט או שנראים בבירור בתמונה.
2. אם המשתמש כתב רק "סלט טונה", אז ingredients חייב להכיל רק פריטים שנמצאים שם, ולא "לחם", "רוטב", "גבינה" או תוספות כלשהן.
3. אם יש תמונה, נתחי רק מה שנראה במפורש ובבירור. אם יש ספק או פריטים לא ברורים, אל תכלילי אותם.
4. אם אין לכם ביטחון מלא לגבי רכיב מסוים, העדיפו לשמור את תיאור הקלט כערך description ולא להמציא מרכיבים.
5. החזרי JSON תקני בלבד, ללא fenced code blocks, ללא Markdown, ללא הערות.
${effectiveImage ? '\nיש תמונה מצורפת של המנה - נתחי אותה ישירות, אך רק לפי מה שנראה בבירור ולא לפי השערות.' : ''}
${textInput ? `\nתיאור טקסטואלי מהמשתמש: ${textInput}` : ''}`;

  console.log('[analyzeFood] textInput:', textInput || '(none)');
  console.log('[analyzeFood] has image:', Boolean(effectiveImage));
  console.log('[analyzeFood] prompt:', prompt);

  const raw = await callHybridJson(prompt, effectiveImage);
  console.log('[analyzeFood] raw AI result:', raw);
  const normalized = normalizeAnalysis(raw);
  if (normalized) return normalized;

  return estimateFoodFromText(textInput || 'מנה לא מזוהה מהתמונה');
}

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

export async function analyzeUserNutrition(
  profile: UserProfileInput
): Promise<UserNutritionAnalysis> {
  const goalLabels: Record<string, string> = {
    lose: 'ירידה במשקל',
    maintain: 'חיטוב/שמירה',
    gain: 'עלייה במסת שריר',
  };

  const diets =
    profile.dietaryPreferences?.length
      ? profile.dietaryPreferences.join(', ')
      : 'ללא הגבלות מיוחדות';

  const prompt = `את מומחית תזונה. נתחי את נתוני המשתמש והחזירי JSON בלבד עם השדות:
dailyCalories (מספר — יעד קלורי יומי),
protein (גרם חלבון ליום),
carbs (גרם פחמימות ליום),
fats (גרם שומן ליום),
insight (מחרוזת בעברית — הסבר קצר ומותאם אישית למשתמש, 2-4 משפטים, למה בחרת ביעדים האלה).

נתוני המשתמש:
- גיל: ${profile.age}
- מין: ${profile.gender === 'male' ? 'זכר' : 'נקבה'}
- משקל נוכחי: ${profile.weight} ק"ג
- גובה: ${profile.height} ס"מ
- משקל יעד: ${profile.targetWeight ?? profile.weight} ק"ג
- מטרה: ${goalLabels[profile.goal] || profile.goal}
- רמת פעילות (מכפיל TDEE): ${profile.activityLevel}
- העדפות תזונה: ${diets}

חשבי יעדים ריאליים ובריאים.`;

  const raw = await callHybridJson(prompt);
  const result = normalizeUserNutrition(raw);
  if (result) return result;

  return fallbackUserNutrition(profile);
}

export async function analyzeRecipeNutrition(
  recipe: RecipeNutritionInput
): Promise<RecipeNutritionAnalysis> {
  const ingredientsList = recipe.ingredients.map((i, idx) => `${idx + 1}. ${i}`).join('\n');
  const stepsList = recipe.steps?.length
    ? `\nשלבי הכנה:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    : '';

  const prompt = `את מומחית תזונה. נתחי את המתכון הבא והעריכי את הערכים התזונתיים למנה אחת (מנה ממוצעת).
החזירי JSON בלבד עם השדות:
calories (קלוריות למנה),
protein (גרם),
carbs (גרם),
fats (גרם),
insight (מחרוזת בעברית — הסבר קצר על הערכים, 1-2 משפטים).

שם המתכון: ${recipe.title}
${recipe.servings ? `מספר מנות: ${recipe.servings}` : 'מנת הגשה: 1'}
מרכיבים:
${ingredientsList}${stepsList}

העריכי בצורה מדויקת ככל האפשר לפי המרכיבים והכמויות.`;

  const raw = await callHybridJson(prompt);
  const result = normalizeRecipeNutrition(raw);
  if (result) return result;

  return fallbackRecipeNutrition(recipe);
}