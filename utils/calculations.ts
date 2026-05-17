interface UserData {
  age: number;
  weight: number;
  height: number;
  goal: string;
  gender: string; 
  activityLevel: number;
}

export const calculateNutritionTargets = (data: UserData) => {
  // הגנה ראשונית: אם הנתונים עדיין לא הגיעו מה-URL (מצב של 0), נחזיר ערכים מאופסים ולא נשבור את האפליקציה
  if (!data.weight || !data.height || !data.age) {
    return { dailyCalories: 0, protein: 0, carbs: 0, fats: 0 };
  }

  // 1. חישוב בסיסי (לפי Mifflin-St Jeor)
  const baseBmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
  
  // 2. תיקון מגדרי
  const finalBmr = data.gender === 'male' ? baseBmr + 5 : baseBmr - 161;
    
  // 3. חישוב הוצאה אנרגטית יומית (TDEE)
  const tdee = finalBmr * data.activityLevel;

  // 4. קביעת יעד קלורי וחלבון לפי המטרה
  let targetCalories = tdee;
  let proteinMultiplier = 1.8;

  if (data.goal === 'lose') {
    targetCalories = tdee - 500;
  } else if (data.goal === 'gain') {
    targetCalories = tdee + 300;
    proteinMultiplier = 2.0;
  }

  // חסם בטיחות תזונתי: מונע מהקלוריות לרדת מתחת ל-1200 קלוריות בטעות או בגלל רינדור חלקי
  const finalCalories = Math.max(1200, Math.round(targetCalories));

  // 5. חישוב אחוזי מאקרו מדויקים מתוך הקלוריות הסופיות
  return {
    dailyCalories: finalCalories,
    protein: Math.round(data.weight * proteinMultiplier),
    carbs: Math.round((finalCalories * 0.45) / 4), // 45% מהקלוריות לפחמימות
    fats: Math.round((finalCalories * 0.25) / 9),  /* 25% מהקלוריות לשומנים */
  };
};