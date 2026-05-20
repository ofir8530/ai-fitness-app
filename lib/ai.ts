import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

export async function analyzeFood(input: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = "נתח את המנה הבאה והחזר JSON בלבד (בלי הסברים נוספים) עם השדות: name, calories, protein, carbs, fats. הכל במספרים.";

  let content: any[] = [];

  // בדיקה: האם זה תמונה (base64) או טקסט?
  if (input.startsWith('data:image')) {
    // אם זה תמונה, נשלח אותה למודל
    const base64Data = input.replace(/^data:image\/\w+;base64,/, "");
    content = [
      {
        inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
      },
      prompt
    ];
  } else {
    // אם זה טקסט, פשוט נשלח את הפרומפט + הטקסט של המשתמש
    content = [`${prompt} המנה היא: ${input}`];
  }

  const result = await model.generateContent(content);
  const text = result.response.text();
  
  // ניקוי התשובה
  const jsonString = text.replace(/```json|```/g, "").trim();
  return JSON.parse(jsonString);
}