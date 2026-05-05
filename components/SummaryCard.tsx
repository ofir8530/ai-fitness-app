"use client";
import styles from './SummaryCard.module.css'; 
import { calculateNutritionTargets } from '../utils/calculations';

interface SummaryProps {
  data: {
    age: string;
    gender:string;
    weight: string;
    height: string;
    goal: string;
    targetWeight?: string;
    diet?: string;
    activityLevel: number;
  };
}

export default function SummaryCard({ data }: SummaryProps) {
  // לוגיקה קטנה להצגת הדיאטה בצורה יפה
  const dietList = data.diet ? data.diet.split(',') : [];
  const targets = calculateNutritionTargets({
    age: 26, 
    weight: Number(data.weight),
    height: Number(data.height),
    goal: data.goal,
    gender: data.gender || 'female',
    activityLevel: 1.4 // הוספת הנתון שחסר ל-TypeScript

  });

  return (
    <div className={styles.card}>
      <h3>הניתוח שלנו עבורך:</h3>
      <p>גיל: <strong>{data.age}</strong></p>
      <p>משקל נוכחי: <strong>{data.weight} ק"ג</strong></p>
      {data.targetWeight && <p>משקל יעד: <strong>{data.targetWeight} ק"ג</strong></p>}
      
      {dietList.length > 0 && (
        <div className={styles.dietTags}>
          <p>העדפות תזונה:</p>
          {dietList.map(item => (
            <span key={item} className={styles.tag}>{item}</span>
          ))}
        </div>
      )}

      <div className={styles.aiInsights}>
          <h4>היעדים היומיים שלך:</h4>
          <p>קלוריות למטרה שלך: <strong>{targets.dailyCalories} קק"ל</strong></p>
          <p>חלבון מומלץ: <strong>{targets.protein} גרם</strong></p>
          <p>שומן: <strong>{targets.fats} גרם</strong> | פחמימות: <strong>{targets.carbs} גרם</strong></p>
      </div>

    </div>
  );
}