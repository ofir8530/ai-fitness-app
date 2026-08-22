import { NextResponse } from 'next/server';
import { createClientServer } from '../../utils/supabaseServer';
import {
  calculateNutritionTargets,
  nutritionTargetsToDbFields,
} from '@/lib/nutritionTargets';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      age,
      gender,
      weight,
      height,
      goal,
      targetWeight,
      activityLevel,
      dietaryPreferences,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'משתמש לא מזוהה' }, { status: 401 });
    }

    const supabase = await createClientServer();

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        age: age ? Number(age) : null,
        gender: gender,
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        goal: goal,
        target_weight: targetWeight ? Number(targetWeight) : null,
        activity_level: activityLevel ? Number(activityLevel) : null,
        dietary_preferences: dietaryPreferences,
      })
      .select();

    if (error) {
      console.error('❌ Supabase Error:', error.message, error.details, error.hint);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const nutrition = calculateNutritionTargets({
      age: Number(age),
      gender: gender || 'female',
      weight: Number(weight),
      height: Number(height),
      goal: goal || 'maintain',
      targetWeight: targetWeight ? Number(targetWeight) : Number(weight),
      activityLevel: activityLevel ? Number(activityLevel) : 1.2,
      dietaryPreferences: Array.isArray(dietaryPreferences) ? dietaryPreferences : [],
    });

    const dbFields = nutritionTargetsToDbFields(nutrition);

    const { error: nutritionError } = await supabase
      .from('profiles')
      .update(dbFields)
      .eq('id', userId);

    if (nutritionError) {
      console.warn('Could not save nutrition targets:', nutritionError.message);
    }

    return NextResponse.json(
      { message: 'הנתונים נשמרו בהצלחה!', data, nutrition },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'אירעה שגיאה בעיבוד הנתונים';
    console.error('❌ שגיאת מערכת כללית בשאלון:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
