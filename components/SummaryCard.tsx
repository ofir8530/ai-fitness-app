"use client";
import styles from './SummaryCard.module.css'; // ניצור קובץ CSS נפרד בשבילו

interface SummaryProps {
  data: {
    age: string;
    weight: string;
    height: string;
    goal: string;
  };
}

export default function SummaryCard({ data }: SummaryProps) {
 const insightText = data.goal === 'lose' 
    ? 'הצבת יעד מאתגר! כדי לרדת במשקל בצורה בריאה נתמקד ב...' 
    : 'שמירה על הקיים דורשת איזון מדויק. התוכנית שלך תתמקד ב...';
    
  return (
    <div className={styles.card}>
      <h3>הניתוח שלנו עבורך:</h3>
      <p>גיל: <strong>{data.age}</strong></p>
      <p>משקל: <strong>{data.weight} ק"ג</strong></p>
      <p>גובה: <strong>{data.height} ס"מ</strong></p>
      
      <div className={styles.aiInsights}>
        <p>{insightText}</p>
      </div>
    </div>
  );
}