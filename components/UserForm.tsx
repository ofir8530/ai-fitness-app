"use client"; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './UserForm.module.css';

export default function UserForm() {
  const router = useRouter(); 
  
  const [formData, setFormData] = useState({
    age: '',
    gender: 'female',
    weight: '',
    height: '',
    goal: 'maintain',
    targetWeight:'',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // בניית כתובת עם כל הנתונים שאספנו עד כה
    const params = new URLSearchParams({
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        goal: formData.goal,
        targetWeight: formData.targetWeight
    });

    // מעבר לדף העדפות התזונה במקום לדף הסיכום
    router.push(`/dietary-preferences?${params.toString()}`);
    };
  

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h2 style={{color: '#333', marginBottom: '1rem'}}>פרופיל אישי</h2>
      
      <div className={styles.inputGroup}>
        <label>גיל</label>
        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="26" />
      </div>

      <div className={styles.formGroup}>
        <label>מין:</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="female">אישה</option>
          <option value="male">גבר</option>
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label>משקל (ק"ג)</label>
        <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="70" />
      </div>

      <div className={styles.inputGroup}>
        <label>גובה (ס"מ)</label>
        <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="165" />
      </div>

      <div className={styles.inputGroup}>
        <label>מטרה</label>
        <select name="goal" value={formData.goal} onChange={handleChange}>
          <option value="lose">ירידה במשקל</option>
          <option value="maintain">שמירה על הקיים</option>
          <option value="gain">עלייה במסה</option>
        </select>
      </div>

    {/* יוצג רק אם המטרה היא לא שמירה */}
       {formData.goal !=='maintain'&&(
            <div className={styles.formGroup}>
                <label>משקל יעד (ק"ג):</label>
                <input
                type="number"
                name="targetWeight"
                value={formData.targetWeight}
                onChange={handleChange}
                required
                />
            </div>
        )}

      <button type="submit" className={styles.submitButton}>שמור והמשך</button>
    </form>
  );
}