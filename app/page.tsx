"use client"; // חייב להוסיף כי יש לנו אינטראקציה של משתמש

import { useState } from 'react'; // מייבאים את היכולת לזכור מצב
import styles from './page.module.css';
import UserForm from '../components/UserForm'; 

export default function Home() {
  // 1. יוצרים מצב חדש: האם להציג את הטופס? (בהתחלה לא - false)
  const [showForm, setShowForm] = useState(false);

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.title}>AI Fitness App</h1>
      
      {/* 2. כאן קורה הרינדור המותנה */}
      {!showForm ? (
        // אם showForm הוא false (סימן הקריאה אומר "לא") - נציג את הכפתורים
        <div className={styles.buttonGroup}>
          <button 
            className={styles.primaryButton} 
            onClick={() => alert('דף התחברות יבנה בהמשך...')}
          >
            התחברי
          </button>
          
          <button 
            className={styles.secondaryButton} 
            onClick={() => setShowForm(true)} // כשלוחצים, משנים את המצב ל-true
          >
            צרי פרופיל
          </button>
        </div>
      ) : (
        // אם showForm הוא true - נציג את הטופס וגם כפתור חזרה
        <div className={styles.formWrapper}>
          <UserForm />
          <button 
            className={styles.backButton} 
            onClick={() => setShowForm(false)}
          >
            חזרה
          </button>
        </div>
      )}
      
    </main>
  );
}