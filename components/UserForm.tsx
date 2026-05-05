"use client"; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './UserForm.module.css';

export default function UserForm() {
  const [step, setStep] = useState(1);  
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: '',
    gender: 'female',
    weight: '',
    height: '',
    goal: 'maintain',
    targetWeight:'',
    activityLevel: 1.2, 
    dietaryPreferences: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // יצירת הפרמטרים מתוך ה-formData שקיים ב-State של הטופס
  const params = new URLSearchParams({
    age: formData.age.toString(),
    gender: formData.gender,
    weight: formData.weight.toString(),
    height: formData.height.toString(),
    goal: formData.goal,
    targetWeight: formData.targetWeight.toString(),
    activityLevel: formData.activityLevel.toString(),
    diet: formData.dietaryPreferences.join(',')
  });

  // קריטי: להוסיף את סימן השאלה והפרמטרים לנתיב
  const queryString = params.toString();
  console.log("Navigating to:", `/summary?${queryString}`); // בדיקה ב-Console
  
  router.push(`/summary?${queryString}`);

  };
  

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
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

          {/* מציג את משקל היעד רק אם המטרה היא לא שמירה על המשקל */}
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
       {/* שלב 2: רמת פעילות */}
     {step === 2 && (
      <div className={styles.formContainer}> {/* הקונטיינר הלבן שעוטף הכל */}
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
            <button type="submit" className={styles.submitButton}>
      סיום והצגת סיכום
    </button>
          </div>
        </div>
      )}
    </form>
  );
}