"use client";
import styles from './SummaryCard.module.css'; // ניצור קובץ CSS נפרד בשבילו

interface SummaryProps {
  data: {
    age: string;
    weight: string;
    height: string;
    goal: string;
    targetWeight?: string; // הוספנו משקל יעד
    diet?: string; // הוספנו את העדפות התזונה כמחרוזת
  };
}

export default function SummaryCard({ data }: SummaryProps) {
  // לוגיקה קטנה להצגת הדיאטה בצורה יפה
  const dietList = data.diet ? data.diet.split(',') : [];

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
        <h4>תובנות AI:</h4>
        <p>מכיוון שבחרת ב-{data.goal === 'lose' ? 'ירידה במשקל' : 'מטרה אחרת'}, נתאים לך תפריט {data.diet?.includes('kosher') ? 'כשר' : ''}...</p>
      </div>
    </div>
  );
}