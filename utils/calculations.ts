interface UserData {
  age: number;
  weight: number;
  height: number;
  goal: string;
  gender: string; 
  activityLevel: number;
}

export const calculateNutritionTargets = (data: UserData) => {
  // 1. חישוב בסיסי (לפי Mifflin-St Jeor)
  const baseBmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
  
  // 2. תיקון מגדרי - משתנה אחד בלבד!
  const finalBmr = data.gender === 'male' ? baseBmr + 5 : baseBmr - 161;
    
  // 3. חישוב הוצאה אנרגטית יומית (TDEE)
  const tdee = Math.round(finalBmr * data.activityLevel);

  // 4. קביעת יעד קלורי וחלבון לפי המטרה
  let targetCalories = tdee;
  let proteinMultiplier = 1.8;

  if (data.goal === 'lose') {
    targetCalories = tdee - 500;
  } else if (data.goal === 'gain') {
    targetCalories = tdee + 300;
    proteinMultiplier = 2.0;
  }

  return {
    dailyCalories: targetCalories,
    protein: Math.round(data.weight * proteinMultiplier),
    carbs: Math.round((targetCalories * 0.45) / 4),
    fats: Math.round((targetCalories * 0.25) / 9),
  };
};