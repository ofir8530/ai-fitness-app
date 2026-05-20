'use client'
import { useState, useRef } from 'react';
import { analyzeFood } from '../lib/ai';
import { addFoodLog } from '../app/actions/foodActions';
import { getFoodAnalysis } from '../app/actions/aiActions';
import styles from './AddFoodModal.module.css';

export default function AddFoodModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [foodData, setFoodData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // פונקציה לטיפול בהעלאת תמונה
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLoading(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
            const base64Image = reader.result as string;
            const result = await getFoodAnalysis(base64Image); // כאן הקריאה החדשה
            setFoodData(result);
            setLoading(false);
            };
        reader.readAsDataURL(file);

    }
  };

  // פונקציה לניתוח טקסט
    const handleAnalyzeText = async () => {
        setLoading(true);
        const result = await getFoodAnalysis(input); // כאן הקריאה החדשה
        setFoodData(result);
        setLoading(false);
    };

  return (
    <div className={styles.overlay}>
      <form action={addFoodLog} className={styles.modal}>
        <h2>הוספת ארוחה</h2>
        
        {!foodData ? (
          // שלב א': בחירה בין טקסט לתמונה
          <>
            <textarea 
              placeholder="תאר את המנה (או העלה תמונה)" 
              className={styles.input}
              onChange={(e) => setInput(e.target.value)}
            />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/*"
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={handleAnalyzeText} className={styles.submitButton}>
                {loading ? 'מנתח...' : 'נתח טקסט'}
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.submitButton}>
                צלם/העלה תמונה
              </button>
            </div>
          </>
        ) : (
          // שלב ב': עריכת הנתונים שה-AI החזיר
          <>
            <input name="food_name" defaultValue={foodData.name} className={styles.input} />
            <input name="calories" type="number" defaultValue={foodData.calories} className={styles.input} />
            <input name="protein" type="number" defaultValue={foodData.protein} className={styles.input} />
            <input name="carbs" type="number" defaultValue={foodData.carbs} className={styles.input} />
            <input name="fats" type="number" defaultValue={foodData.fats} className={styles.input} />
            
            <button type="submit" className={styles.submitButton}>שמור סופית</button>
          </>
        )}
        
        <button type="button" onClick={onClose} className={styles.cancelButton}>ביטול</button>
      </form>
    </div>
  );
}