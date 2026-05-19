import Link from 'next/link'; // ייבוא רכיב הקישור
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.title}>AI Fitness App</h1>
      <p className={styles.description}>ברוכה הבאה! בואי נבנה את תוכנית האימונים שלך.</p>
      
      <div className={styles.buttonGroup}>
        {/* כפתור התחברות */}
        <button className={styles.primaryButton}>התחברות</button>
        
        {/* שימוש ב-Link למעבר דף אמיתי */}
        <Link href="/register" className={styles.secondaryButton}>
          יצירת פרופיל
        </Link>
      </div>
    </main>
  );
}