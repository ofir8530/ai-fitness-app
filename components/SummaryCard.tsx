"use client";
import styles from './SummaryCard.module.css'; 
import { calculateNutritionTargets } from '../utils/calculations';

interface SummaryProps {
  data: {
    age: string;
    gender: string;
    weight: string;
    height: string;
    goal: string;
    targetWeight?: string;
    diet?: string;
    activityLevel: number;
  };
}

export default function SummaryCard({ data }: SummaryProps) {
  // לוגיקה להצגת הדיאטה בצורה יפה ומניעת אינדקסים ריקים
  const dietList = data.diet ? data.diet.split(',').filter(item => item.trim() !== '') : [];

  // המרת נתונים למספרים בצורה בטוחה כדי למנוע NaN או ערכים שליליים בחישוב
  const numWeight = Number(data.weight) || 0;
  const numHeight = Number(data.height) || 0;
  const numAge = Number(data.age) || 26;

  // הרצת החישוב עם כל הנתונים הדינמיים האמיתיים
  const targets = calculateNutritionTargets({
    age: numAge, 
    weight: numWeight,
    height: numHeight,
    goal: data.goal,
    gender: data.gender || 'female',
    activityLevel: data.activityLevel || 1.2
  });

  return (
    <div className={styles.card}>
      <h3>הניתוח שלנו עבורך:</h3>
      <p>גיל: <strong>{data.age || '26'}</strong></p>
      <p>משקל נוכחי: <strong>{data.weight ? `${data.weight} ק"ג` : 'לא הוזן'}</strong></p>
      {data.targetWeight && <p>משקל יעד: <strong>{data.targetWeight} ק"ג</strong></p>}
      
      {dietList.length > 0 && (
        <div className={styles.dietTags}>
          <p>העדפות תזונה:</p>
          <div className={styles.tagsContainer}>
            {dietList.map(item => (
              <span key={item} className={styles.tag}>{item}</span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.aiInsights}>
          <h4>היעדים היומיים שלך:</h4>
          {/* מציג את החישוב רק אם יש משקל וגובה תקינים, אחרת מונע הצגת מספרים שליליים */}
          {numWeight > 0 && numHeight > 0 ? (
            <>
              <p>קלוריות למטרה שלך: <strong>{targets.dailyCalories} קק"ל</strong></p>
              <p>חלבון מומלץ: <strong>{targets.protein} גרם</strong></p>
              <p>שומן: <strong>{targets.fats} גרם</strong> | פחמימות: <strong>{targets.carbs} גרם</strong></p>
            </>
          ) : (
            <p>מחשב נתונים או שחסרים נתוני גוף בסיסיים...</p>
          )}
      </div>
    </div>
  );
}