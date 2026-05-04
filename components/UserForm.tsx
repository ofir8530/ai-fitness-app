"use client"; 

import { useState } from 'react';
import styles from './UserForm.module.css';

export default function UserForm() {
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height:'',
    goal: 'maintain'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("נתונים שנשמרו:", formData);
    alert("הנתונים נשמרו בהצלחה!");
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h2 style={{color: '#333', marginBottom: '1rem'}}>פרופיל אישי</h2>
      
      <div className={styles.inputGroup}>
        <label>גיל</label>
        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="26" />
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

      <button type="submit" className={styles.submitButton}>שמור והמשך</button>
    </form>
  );
}