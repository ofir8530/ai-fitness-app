'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getFoodAnalysis } from '../app/actions/aiActions';
import { addFoodLog } from '../app/actions/foodActions';
import styles from './AddFoodModal.module.css';

type FoodData = {
  description?: string;
  food_name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
};

export default function AddFoodModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [foodData, setFoodData] = useState<FoodData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);
  const [values, setValues] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roundUpValue = (value: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.ceil(parsed));
  };

  const applyAnalysis = (result: FoodData | null) => {
    if (!result) {
      setError('לא הצלחנו לנתח. נסי שוב.');
      return;
    }

    const nextValues = {
      calories: roundUpValue(Number(result.calories) || 0),
      protein: roundUpValue(Number(result.protein) || 0),
      carbs: roundUpValue(Number(result.carbs) || 0),
      fats: roundUpValue(Number(result.fats) || 0),
    };

    setFoodData({
      ...result,
      description: result.description || result.food_name || 'ארוחה',
      food_name: result.food_name || result.description || 'ארוחה',
      calories: nextValues.calories,
      protein: nextValues.protein,
      carbs: nextValues.carbs,
      fats: nextValues.fats,
    });
    setValues(nextValues);
    setError('');
  };

  const saveAnalysisChanges = () => {
    if (!foodData) return;

    const normalizedValues = {
      calories: roundUpValue(values.calories),
      protein: roundUpValue(values.protein),
      carbs: roundUpValue(values.carbs),
      fats: roundUpValue(values.fats),
    };

    const nextDescription = (foodData.description || foodData.food_name || '').replace(/\s+/g, ' ').trim();
    const safeDescription = nextDescription || 'ארוחה';

    setValues(normalizedValues);
    setFoodData((prev) =>
      prev
        ? {
            ...prev,
            description: safeDescription,
            food_name: safeDescription,
            calories: normalizedValues.calories,
            protein: normalizedValues.protein,
            carbs: normalizedValues.carbs,
            fats: normalizedValues.fats,
          }
        : prev
    );
    setIsEditingAnalysis(false);
    setError('');
  };

  const updateValue = (key: keyof typeof values, nextValue: number) => {
    const safeValue = Number.isFinite(nextValue) ? nextValue : 0;
    setValues((prev) => ({ ...prev, [key]: safeValue }));
    setFoodData((prev) =>
      prev
        ? {
            ...prev,
            [key]: safeValue,
          }
        : prev
    );
  };

  const updateDescription = (nextDescription: string) => {
    const value = nextDescription === '' ? 'ארוחה' : nextDescription;

    setFoodData((prev) =>
      prev
        ? {
            ...prev,
            description: value,
            food_name: value,
          }
        : prev
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);
    setLoading(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = await getFoodAnalysis(reader.result as string, 'image');
        applyAnalysis(result);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError('שגיאה בטעינת התמונה');
      setLoading(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await getFoodAnalysis(input.trim(), 'text');
      applyAnalysis(result);
    } catch {
      setError('שגיאה בניתוח');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodData) return;
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append(
        'food_name',
        foodData.description || foodData.food_name || input || 'ארוחה'
      );
      formData.append('calories', String(roundUpValue(values.calories)));
      formData.append('protein', String(roundUpValue(values.protein)));
      formData.append('carbs', String(roundUpValue(values.carbs)));
      formData.append('fats', String(roundUpValue(values.fats)));
      await addFoodLog(formData);
      router.refresh();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שמירה נכשלה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <form onSubmit={handleSave} className={styles.modal}>
        <h2>הוספת ארוחה</h2>

        {!foodData ? (
          <>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="תצוגה מקדימה של התמונה שנבחרה"
                className={styles.previewImage}
              />
            )}

            <textarea
              placeholder="תארי את המנה (למשל: סלט עוף עם אורז...)"
              className={styles.inputing}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div className={styles.actionRow}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.secondaryButton}
                disabled={loading}
              >
                {loading ? 'מנתח תמונה...' : 'העלאת תמונה'}
              </button>

              <button
                type="button"
                onClick={handleTextAnalysis}
                className={styles.submitButton}
                disabled={loading || !input.trim()}
              >
                {loading ? 'מנתח...' : 'נתח טקסט'}
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*"
              capture="environment"
            />
          </>
        ) : (
          <div className={styles.editSection}>
            <div className={styles.fieldWrapper}>
              <label htmlFor="meal-name">שם המנה</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {isEditingAnalysis ? (
                  <input
                    id="meal-name"
                    className={styles.input}
                    value={foodData.description || foodData.food_name || ''}
                    onChange={(e) => updateDescription(e.target.value)}
                    style={{ flex: 1 }}
                  />
                ) : (
                  <div style={{ flex: 1, fontWeight: 600, padding: '12px 0' }}>
                    {foodData.description || foodData.food_name || 'ארוחה'}
                  </div>
                )}
                {!isEditingAnalysis ? (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setIsEditingAnalysis(true)}
                  >
                    עריכה
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={saveAnalysisChanges}
                  >
                    שמור
                  </button>
                )}
              </div>
            </div>

            {(
              [
                { label: 'קלוריות', key: 'calories', unit: 'kcal' },
                { label: 'חלבון', key: 'protein', unit: 'g' },
                { label: 'פחמימות', key: 'carbs', unit: 'g' },
                { label: 'שומן', key: 'fats', unit: 'g' },
              ] as const
            ).map((item) => (
              <div key={item.key} className={styles.valueRow}>
                <span className={styles.valueLabel}>{item.label}</span>
                <div className={styles.inputGroup}>
                  <span className={styles.unitText}>{item.unit}</span>
                  {isEditingAnalysis ? (
                    <input
                      type="number"
                      step="0.1"
                      className={styles.valueInput}
                      value={values[item.key]}
                      onChange={(e) =>
                        updateValue(item.key, Number.parseFloat(e.target.value) || 0)
                      }
                      min={0}
                    />
                  ) : (
                    <span className={styles.valueInput} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {values[item.key]}
                    </span>
                  )}
                </div>
              </div>
            ))}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={saving}
            >
              {saving ? 'שומר...' : 'שמור ליומן'}
            </button>
          </div>
        )}

        {error && (
          <p style={{ color: '#ba1a1a', fontSize: 14, marginTop: 8 }}>{error}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className={styles.cancelButton}
        >
          ביטול
        </button>
      </form>
    </div>
  );
}
