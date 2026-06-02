'use client'
import { useState, useRef, useEffect } from 'react'; // הוספנו useEffect
import { getFoodAnalysis } from '../app/actions/aiActions';
import { addFoodLog } from '../app/actions/foodActions';
import styles from './AddFoodModal.module.css';

export default function AddFoodModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [foodData, setFoodData] = useState<any>(null); 

 // const [foodData, setFoodData] = useState<any>({
   // description: "ארוחת צהריים עשירה: אורז, קובה, ואגרול",
   // calories: 650,
   // protein: 25,
   // carbs: 85,
   // fats: 20
  //});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [ingredients, setIngredients] = useState<any[]>([]); // התחלה עם מערך ריק
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ה-useEffect הזה יעדכן את הרשימה ברגע שיש נתונים מה-AI
  useEffect(() => {
    if (foodData?.ingredients) {
      setIngredients(foodData.ingredients);
    }
  }, [foodData]);

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

  const updateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

return (
    <div className={styles.overlay}>
      <form action={addFoodLog} className={styles.modal}>
        <h2>הוספת ארוחה</h2>
        
        {!foodData ? (
          <>
            <div className={styles.toggleContainer}>
              <div className={`${styles.switch} ${mode === 'image' ? styles.active : ''}`} onClick={() => setMode(mode === 'text' ? 'image' : 'text')}>
                <span className={styles.labelRight}>כתיבה</span>
                <span className={styles.labelLeft}>תמונה</span>
                <div className={styles.slider} />
              </div>
            </div>

            {mode === 'text' ? (
              <>
                <textarea placeholder="תאר את המנה (למשל: פסטה...)" className={styles.inputing} onChange={(e) => setInput(e.target.value)} />
                <button type="button" onClick={handleTextAnalysis} className={styles.submitButton}>{loading ? 'מנתח...' : 'נתח טקסט'}</button>
              </>
            ) : (
              <div className={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                <p>גרור לכאן תמונה או לחץ לבחירה</p>
              </div>
            )}
          </>
        ) : (
          <div className={styles.editSection}>
            <h3>{foodData.description}</h3>

            {[
              { label: 'קלוריות', key: 'calories', unit: 'kcal' },
              { label: 'חלבון', key: 'protein', unit: 'g' },
              { label: 'פחמימות', key: 'carbs', unit: 'g' },
              { label: 'שומן', key: 'fats', unit: 'g' }
            ].map((item) => (
              <div key={item.key} className={styles.valueRow}>
                <span className={styles.valueLabel}>{item.label}</span>
                
                <div className={styles.inputGroup}>
                  <span className={styles.unitText}>{item.unit}</span>
                  <input 
                    type="number" 
                    className={styles.valueInput} 
                    defaultValue={foodData.calories} 
                  />
                  
                </div>
              </div>
            ))}

            <button type="submit" className={styles.submitButton}>שמור</button>
          </div>
        )}

        <button type="button" onClick={onClose} className={styles.cancelButton}>ביטול</button>
      </form>
    </div>
  );
}