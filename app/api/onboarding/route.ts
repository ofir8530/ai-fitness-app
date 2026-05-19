import { NextResponse } from 'next/server';
import { createClientServer } from '../../utils/supabaseServer'; // שימוש בלקוח השרת המופרד והנכון!

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // חילוץ השדות שמגיעים מה-formData של השאלון
    const { 
      userId, 
      age, 
      gender, 
      weight, 
      height, 
      goal, 
      targetWeight, 
      activityLevel, 
      dietaryPreferences 
    } = body;

    // הגנה בסיסית - אם אין מזהה משתמש, אי אפשר לשמור בטבלה
    if (!userId) {
      return NextResponse.json({ error: 'משתמש לא מזוהה' }, { status: 401 });
    }

    // אתחול לקוח השרת (עם await!) שמטפל נכון בעוגיות וסשנים
    const supabase = await createClientServer();

    // שמירה או עדכון בטבלת profiles ב-Supabase
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        age: age ? Number(age) : null,
        gender: gender,                         // עמודת gender ב-DB
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        goal: goal,
        target_weight: targetWeight ? Number(targetWeight) : null, // ודאי שזה תואם בול ל-DB
        activity_level: activityLevel ? Number(activityLevel) : null, // ודאי שזה תואם בול ל-DB
        dietary_preferences: dietaryPreferences // ודאי שזה תואם בול ל-DB
      })
      .select();

    if (error) {
      console.error("❌ Supabase Error:", error.message, error.details, error.hint);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'הנתונים נשמרו בהצלחה!', data }, { status: 200 });

  } 
  catch (err: any) {
    console.error("❌ שגיאת מערכת כללית בשאלון:", err.message || err);
    return NextResponse.json({ error: err.message || 'אירעה שגיאה בעיבוד הנתונים' }, { status: 500 });
  }
}