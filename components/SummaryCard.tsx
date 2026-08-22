"use client";
import styles from './SummaryCard.module.css';

interface SummaryProps {
  data: {
    age: string;
    gender: string;
    weight: string;
    height: string;
    goal: string;
    targetWeight?: string;
    diet?: string | string[];
    activityLevel: number;
  };
  nutrition: {
    dailyCalories: number;
    protein: number;
    carbs: number;
    fats: number;
    insight?: string;
  };
}

export default function SummaryCard({ data, nutrition }: SummaryProps) {
  const dietList = Array.isArray(data.diet)
    ? data.diet
    : typeof data.diet === 'string'
      ? data.diet.split(',').filter((item) => item.trim() !== '')
      : [];

  const numWeight = Number(data.weight) || 0;
  const numHeight = Number(data.height) || 0;

  return (
    <div className={styles.card}>
      <h3>הניתוח שלנו עבורך:</h3>
      <p>
        גיל: <strong>{data.age || '—'}</strong>
      </p>
      <p>
        משקל נוכחי:{' '}
        <strong>{data.weight ? `${data.weight} ק"ג` : 'לא הוזן'}</strong>
      </p>
      {data.targetWeight && (
        <p>
          משקל יעד: <strong>{data.targetWeight} ק"ג</strong>
        </p>
      )}

      {dietList.length > 0 && (
        <div className={styles.dietTags}>
          <p>העדפות תזונה:</p>
          <div className={styles.tagsContainer}>
            {dietList.map((item) => (
              <span key={item} className={styles.tag}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.aiInsights}>
        <h4>היעדים היומיים שלך (AI):</h4>
        {numWeight > 0 && numHeight > 0 && nutrition.dailyCalories > 0 ? (
          <>
            <p>
              קלוריות למטרה שלך:{' '}
              <strong>{nutrition.dailyCalories} קק"ל</strong>
            </p>
            <p>
              חלבון מומלץ: <strong>{nutrition.protein} גרם</strong>
            </p>
            <p>
              שומן: <strong>{nutrition.fats} גרם</strong> | פחמימות:{' '}
              <strong>{nutrition.carbs} גרם</strong>
            </p>
            {nutrition.insight && (
              <p className={styles.aiInsightText}>{nutrition.insight}</p>
            )}
          </>
        ) : (
          <p>מחשב נתונים או שחסרים נתוני גוף בסיסיים...</p>
        )}
      </div>
    </div>
  );
}
