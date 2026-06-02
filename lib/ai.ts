'use server'
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeFood(input: string) {
  const isImage = input.startsWith('data:image');

  const messages: any = [{
    role: 'user',
    content: [
      { type: "text", text: `נתחי את הקלט הבא ותחזירי JSON בלבד (ללא טקסט נוסף) עם השדות: description, calories, protein, carbs, fats. הקלט: ${isImage ? "[התמונה מצורפת]" : input}` },
    ]
  }];

  if (isImage) {
    messages[0].content.push({ type: "image_url", image_url: { url: input } });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content!;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
}