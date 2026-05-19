"use client"; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../app/utils/supabase'; // ודאי שהנתיב ליוטילס תואם למבנה שלך
import styles from './UserForm.module.css';

export default function UserForm() {
  const [step, setStep] = useState(1);  
  const router = useRouter();
  
  // הוספת ה-States החסרים
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: '',
    gender: 'female',
    weight: '',
    height: '',
    goal: 'maintain',
    targetWeight: '',
    activityLevel: 1.2, 
    dietaryPreferences: [] as string[]
  });

  // שליפת המשתמש המחובר מ-Supabase ברגע שהדף עולה
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
      } else {
        console.error("No user found in session", error);
        setError('משתמש לא מחובר. אנא בצע הרשמה או התחברות.');
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!userId) {
      setError('משתמש לא מזוהה. אנא הרשם מחדש.');
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending data to API for userId:", userId);
      
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          age: formData.age,
          gender: formData.gender,
          weight: formData.weight,
          height: formData.height,
          goal: formData.goal,
          targetWeight: formData.goal === 'maintain' ? formData.weight : formData.targetWeight, // אם שומרים על המשקל, היעד הוא המשקל הנוכחי
          activityLevel: formData.activityLevel,
          dietaryPreferences: formData.dietaryPreferences,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'אירעה שגיאה בשמירת הנתונים בשרת');
      }

      // 2. רק אם השמירה בשרת הצליחה - עוברים לעמוד הסיכום
      const params = new URLSearchParams({
        age: formData.age.toString(),
        gender: formData.gender,
        weight: formData.weight.toString(),
        height: formData.height.toString(),
        goal: formData.goal,
        targetWeight: formData.goal === 'maintain' ? formData.weight.toString() : formData.targetWeight.toString(),
        activityLevel: formData.activityLevel.toString(),
        diet: formData.dietaryPreferences.join(',')
      });

      router.push(`/summary?${params.toString()}`);

    } catch (err: any) {
      console.error("Client submit error:", err);
      setError(err.message || 'שגיאה בתהליך השמירה. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {/* הצגת שגיאות במידה ויש */}
      {error && <div className={styles.errorAlert} style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

      {step === 1 && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>בוא נכיר אותך</h2>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>גיל</label>
            <input 
              type="number" 
              className={styles.inputField} 
              value={formData.age} 
              onChange={(e) => setFormData({...formData, age: e.target.value})} 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>מין</label>
            <select 
              className={styles.selectField} 
              value={formData.gender} 
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="female">אישה</option>
              <option value="male">גבר</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>משקל (ק"ג)</label>
            <input 
              type="number" 
              className={styles.inputField} 
              value={formData.weight} 
              onChange={(e) => setFormData({...formData, weight: e.target.value})} 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>גובה (ס"מ)</label>
            <input 
              type="number" 
              className={styles.inputField} 
              value={formData.height} 
              onChange={(e) => setFormData({...formData, height: e.target.value})} 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>מטרה</label>
            <select 
              className={styles.selectField} 
              value={formData.goal} 
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
            >
              <option value="lose">ירידה במשקל</option>
              <option value="maintain">שמירה על המשקל</option>
              <option value="gain">עליה במסה</option>
            </select>
          </div>

          {formData.goal !== 'maintain' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>משקל יעד (ק"ג)</label>
              <input 
                type="number" 
                className={styles.inputField} 
                placeholder="לדוגמה: 65"
                value={formData.targetWeight} 
                onChange={(e) => setFormData({...formData, targetWeight: e.target.value})} 
              />
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button type="button" onClick={() => setStep(2)} className={styles.submitButton}>המשך</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>איך נראה היום שלך?</h2>
          <p className={styles.formDescription}>זה יעזור לנו לדייק את כמות הקלוריות שאת שורפת</p>
          
          <div className={styles.optionsGrid}>
            {[
              { val: 1.2, label: 'יושבני', desc: 'עבודה משרדית, מעט תנועה' },
              { val: 1.375, label: 'פעילות קלה', desc: 'הליכות, עמידה, עבודה פיזית קלה' },
              { val: 1.55, label: 'פעילות מתונה', desc: 'מתאמנת 3-5 פעמים בשבוע (פילאטיס וכו\')' },
              { val: 1.725, label: 'פעילות גבוהה', desc: 'אימונים עצימים כמעט כל יום' }
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={formData.activityLevel === opt.val ? styles.selectedCard : styles.cardOption}
                onClick={() => setFormData({...formData, activityLevel: opt.val})}
              >
                <span className={styles.cardTitle}>{opt.label}</span>
                <span className={styles.cardDesc}>{opt.desc}</span>
              </button>
            ))}
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={() => setStep(1)} className={styles.secondaryButton}>חזור</button>
            <button type="button" onClick={() => setStep(3)} className={styles.submitButton}>המשך</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>העדפות תזונה</h2>
          <p className={styles.formDescription}>סמני את מה שרלוונטי אלייך (ניתן לבחור כמה)</p>
          
          <div className={styles.optionsGrid}>
            {['כשר', 'טבעוני', 'צמחוני', 'ללא גלוטן', 'דל פחמימה'].map((diet) => (
              <button
                key={diet}
                type="button"
                className={formData.dietaryPreferences.includes(diet) ? styles.selectedCard : styles.cardOption}
                onClick={() => {
                  const current = formData.dietaryPreferences;
                  const next = current.includes(diet) 
                    ? current.filter(i => i !== diet) 
                    : [...current, diet];
                  setFormData({...formData, dietaryPreferences: next});
                }}
              >
                <span className={styles.cardTitle}>{diet}</span>
              </button>
            ))}
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={() => setStep(2)} className={styles.secondaryButton}>חזור</button>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'שומר נתונים...' : 'סיום והצגת סיכום'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}