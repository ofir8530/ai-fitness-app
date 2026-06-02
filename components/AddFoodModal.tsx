'use client'
import { useState, useRef } from 'react';
import { getFoodAnalysis } from '../app/actions/aiActions';
import { addFoodLog } from '../app/actions/foodActions';
import styles from './AddFoodModal.module.css';

export default function AddFoodModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [foodData, setFoodData] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setImagePreview(base64Image);
        const result = await getFoodAnalysis(base64Image);
        setFoodData(result);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextAnalysis = async () => {
    if (!input) return;
    setLoading(true);
    const result = await getFoodAnalysis(input);
    setFoodData(result);
    setLoading(false);
  };

  return (
    <div className={styles.overlay}>
      <form action={addFoodLog} className={styles.modal}>
        <h2>הוספת ארוחה</h2>
        
        {!foodData ? (
          // כאן התיקון: תנאי אחד בלבד
          <>
            <textarea 
              placeholder="תאר את המנה (למשל: פסטה עם רוטב עגבניות...)" 
              className={styles.input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            
            <button type="button" onClick={handleTextAnalysis} className={styles.submitButton}>
              {loading ? 'מנתח...' : 'נתח טקסט'}
            </button>

            <div style={{ margin: '10px 0', textAlign: 'center' }}>או</div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.submitButton}>
              העלה תמונה
            </button>
          </>
        ) : (
          <div className={styles.editSection}>
            {imagePreview && <img src={imagePreview} alt="נאכל" className={styles.foodImage} />}
            
            <div className={styles.fieldWrapper}>
              <label>תיאור המנה:</label>
              <textarea 
                name="food_name" 
                defaultValue={foodData.description} 
                className={styles.input} 
                rows={3} 
              />
            </div>
            
            {/* שאר השדות נשארים אותו דבר */}
            <div className={styles.fieldWrapper}>
              <label>קלוריות:</label>
              <input name="calories" type="number" defaultValue={foodData.calories} className={styles.input} />
            </div>
            
            <div className={styles.fieldWrapper}>
              <label>חלבון (גרם):</label>
              <input name="protein" type="number" defaultValue={foodData.protein} className={styles.input} />
            </div>

            <div className={styles.fieldWrapper}>
              <label>פחמימות (גרם):</label>
              <input name="carbs" type="number" defaultValue={foodData.carbs} className={styles.input} />
            </div>

            <div className={styles.fieldWrapper}>
              <label>שומן (גרם):</label>
              <input name="fats" type="number" defaultValue={foodData.fats} className={styles.input} />
            </div>
            
            <button type="submit" className={styles.submitButton}>שמור סופית</button>
          </div>
        )}
        <button type="button" onClick={onClose} className={styles.cancelButton}>ביטול</button>
      </form>
    </div>
  );
}