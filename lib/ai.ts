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

function estimateFoodFromText(input: string): FoodAnalysis {
  const normalized = input.toLowerCase();
  const ingredientHints: string[] = [];

  if (/פסטה|pasta/.test(normalized)) ingredientHints.push('פסטה');
  if (/רוטב|sauce|pesto/.test(normalized)) ingredientHints.push('רוטב');
  if (/גבינה|cheese/.test(normalized)) ingredientHints.push('גבינה');
  if (/עוף|chicken/.test(normalized)) ingredientHints.push('עוף');
  if (/אורז|rice/.test(normalized)) ingredientHints.push('אורז');
  if (/סלט|salad|ירקות|vegetable/.test(normalized)) ingredientHints.push('ירקות');
  if (/ביצה|egg/.test(normalized)) ingredientHints.push('ביצה');
  if (/אבוקדו|avocado/.test(normalized)) ingredientHints.push('אבוקדו');
  if (/שמן|oil|חמאה|butter/.test(normalized)) ingredientHints.push('שמן');

  let calories = 220;
  if (/פיתה|לחם|toast|bagel|naan/.test(normalized)) calories += 180;
  if (/אורז|rice|פסטה|pasta|קינואה|quinoa|couscous/.test(normalized)) calories += 220;
  if (/עוף|chicken|טונה|tuna|דג|salmon|beef|steak|turkey/.test(normalized)) calories += 260;
  if (/ביצה|egg/.test(normalized)) calories += 90;
  if (/אבוקדו|avocado/.test(normalized)) calories += 140;
  if (/שמן|oil|חמאה|butter/.test(normalized)) calories += 120;
  if (/גבינה|cheese|יוגורט|yogurt|milk/.test(normalized)) calories += 110;
  if (/סלט|salad|vegetable|spinach|lettuce/.test(normalized)) calories += 80;
  if (/שקדים|nuts|almond|peanut/.test(normalized)) calories += 110;
  if (/אפונה|bean|lentil|chickpea/.test(normalized)) calories += 120;

  const protein = Math.max(10, Math.round(calories * 0.22));
  const carbs = Math.max(10, Math.round(calories * 0.38));
  const fats = Math.max(8, Math.round(calories * 0.4));
  const ingredients = ingredientHints.length
    ? ingredientHints
    : [input.trim() || 'מרכיבים'];

  return {
    description: input.trim().slice(0, 80) || 'ארוחה',
    calories: Math.round(calories),
    protein,
    carbs,
    fats,
    ingredients,
  };
}

export async function chooseBestOpenFoodFactsProduct(payload: {
  products?: OpenFoodFactsProduct[];
} | null | undefined): Promise<FoodAnalysis | null> {
  if (!payload?.products?.length) return null;

  for (const product of payload.products) {
    const nutriments = product.nutriments ?? {};
    const calories =
      toNumberFromValue(
        nutriments['energy-kcal_100g'] ??
          nutriments['energy-kcal_serving'] ??
          nutriments['energy_100g'] ??
          nutriments['energy-kj_100g']
      ) || 0;
    const protein =
      toNumberFromValue(
        nutriments.proteins_100g ?? nutriments.protein_100g ?? nutriments.proteins
      ) || 0;
    const carbs =
      toNumberFromValue(
        nutriments.carbohydrates_100g ??
          nutriments.carbohydrate_100g ??
          nutriments.carbohydrates
      ) || 0;
    const fats =
      toNumberFromValue(
        nutriments.fat_100g ?? nutriments.fats_100g ?? nutriments.fat
      ) || 0;

    if (calories <= 0 && protein <= 0 && carbs <= 0 && fats <= 0) {
      continue;
    }

    const ingredients = product.ingredients_text && product.ingredients_text.trim()
      ? product.ingredients_text
          .split(/[,:;]|\n/)
          .map((part) => part.trim())
          .filter(Boolean)
          .slice(0, 6)
      : ['מזון'];

    return {
      description: getBestProductName(product),
      calories,
      protein,
      carbs,
      fats,
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
    return chooseBestOpenFoodFactsProduct(data);
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

  const prompt = `את מומחית תזונה ומערכות ניתוח מזון. התפקיד שלך הוא לנתח את נתוני הקלט (טקסט ו/או תמונה מצורפת) ולהחזיר אובייקט JSON תקני בלבד, ללא שום טקסט נוסף לפני או אחרי.

מבנה ה-JSON הנדרש לחזרה:
{
  "description": "תיאור מפורט ומדויק של המנה",
  "calories": מספר שלם (הערכה קלורית),
  "protein": מספר (גרם חלבון),
  "carbs": מספר (גרם פחמימות),
  "fats": מספר (גרם שומנים),
  "ingredients": ["רשימת", "מרכיבים", "מרכזיים"]
}

הנחיות קריטיות למניעת שגיאות:
1. שדה ה-ingredients חייב תמיד להכיל לפחות פריט אחד (אסור שיחזור מערך ריק []). אם התמונה או הטקסט חלקיים, חלצי את המרכיבים הנראים לעין או הסיקי אותם מהתיאור הטקסטואלי.
2. אל תאפס ואל תחזיר ערכים ריקים או חלקיים שיגרמו לשגיאות ב-State של האפליקציה. שמרי על עקביות ודיוק שמרני.
3. התייחסי לכל רכיב בנפרד (למשל בפסטה: פסטה, רוטב, גבינה) ולא לקטגוריה גנרית אחת.
4. אם יש רוטב, גבינה או פסטה יחד, כתבי אותם בנפרד בתוך ingredients.
5. החזרי JSON תקני בלבד, ללא fenced code blocks, ללא Markdown, ללא הערות.
${effectiveImage ? '\nיש תמונה מצורפת של המנה - נתחי אותה ישירות (זהי את המרכיבים הנראים לעין, כמויות משוערות וכו׳).' : ''}
${textInput ? `\nתיאור טקסטואלי נוסף מהמשתמש: ${textInput}` : ''}`;

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