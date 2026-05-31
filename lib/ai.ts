import OpenAI from 'openai';

// שימוש במפתח החדש של Groq
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function analyzeFood(input: string) {
const prompt = `
אתה עוזר תזונתי. נתח את התמונה הבאה בצורה אובייקטיבית לחלוטין.
אל תנסה לנחש שם של מנה (כמו "פיצה" או "המבורגר"). במקום זה, ציין את המרכיבים הפיזיים שאתה רואה בתמונה.

החזר JSON בלבד עם השדות הבאים:
- description: תיאור קצר של המרכיבים (למשל: "פרוסת לחם עם ממרח ועשבי תיבול", "סלט ירקות").
- calories: מספר קלוריות מוערך.
- protein: כמות חלבון בגרמים.
- carbs: כמות פחמימות בגרמים.
- fats: כמות שומן בגרמים.

אם אינך בטוח לגבי מרכיב מסוים, תאר את המראה שלו (למשל: "ממרח בהיר עם עשבי תיבול").
`;
  const content = input.startsWith('data:image') 
    ? `${prompt} נתח את התמונה הבאה (בפורמט Base64): ${input}`
    : `${prompt} המנה היא: ${input}`;

  const completion = await client.chat.completions.create({
    messages: [{ role: 'user', content: content }],
    model: 'llama-3.3-70b-versatile', // מודל מצוין ומהיר
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0].message.content!;
  return JSON.parse(text);
}

// פונקציה ריקה כדי שלא תקבלי שגיאה ב-aiActions
export async function testGeminiConnection() {
  return true;
}