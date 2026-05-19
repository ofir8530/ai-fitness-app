"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. ולדידציה בסיסית ב-Client
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setIsLoading(true);

    try {
      // 2. שליחת הנתונים ל-API הראשי שלנו ב-Next.js
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 3. אם השרת או Supabase החזירו שגיאה
      if (!response.ok) {
        throw new Error(data.error || 'אירעה שגיאה בתהליך ההרשמה');
      }
      setTimeout(() => {
        router.push('/onboarding');
      }, 600);

      // 4. הצלחה! המשתמש נוצר ב-Supabase. מעבירים אותו לשאלון
      router.push('/onboarding'); 
      
    } catch (err: any) {
      // הצגת השגיאה האמיתית למשתמש (למשל: "Email already registered")
      setError(err.message || 'אירעה שגיאה בתהליך ההרשמה. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>יצירת חשבון חדש</h1>
      <p className={styles.subtitle}>הירשם כדי להתחיל את תוכנית הכושר והתזונה שלך</p>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">כתובת אימייל</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">סיסמה</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">אימות סיסמה</label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={styles.input}
          />
        </div>

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'יוצר חשבון...' : 'המשך לשאלון התזונה'}
        </button>
      </form>

      <p className={styles.footerText}>
        כבר יש לך חשבון? <Link href="/login" className={styles.link}>התחבר כאן</Link>
      </p>
    </div>
  );
}