'use server'
import { analyzeFood } from '../../lib/ai';

// זו פונקציה שרצה בשרת בלבד
export async function getFoodAnalysis(input: string) {
  try {
    return await analyzeFood(input);
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("נכשלנו בניתוח האוכל");
  }
}