// 1. מייבאים את האובייקט styles מהקובץ שיצרנו
import styles from './page.module.css';
import UserForm from '../components/UserForm';

export default function Home() {
  return (
    // 2. משתמשים בשם המחלקה מתוך האובייקט (styles.name)
    <main className={styles.mainContainer}>
      
      <h1 className={styles.title}>
        AI Fitness App
      </h1>

      <p className={styles.description}>
        ברוכה הבאה! כאן נבנה את אפליקציית החיטוב החכמה שלך.
      </p>

      <div className={styles.buttonGroup}>
        <button className={styles.primaryButton}>
          התחברי
        </button>
        <button className={styles.primaryButton} style={{backgroundColor: '#10b981'}}>
          צרי פרופיל
        </button>
      </div>

    </main>
  );
}