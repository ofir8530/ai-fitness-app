import { NextResponse } from 'next/server';
import { createClientServer } from '../../../utils/supabaseServer'; // שימי לב לשינוי בשם הקובץ!


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. אתחול לקוח השרת הנכון (עם await!)
    const supabase = await createClientServer();

    // 2. הרשמת המשתמש ב-Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User registered successfully', user: data.user }, { status: 200 });

  } catch (err: any) {
    console.error('Register API Error:', err);
    return NextResponse.json({ error: 'אירעה שגיאה בשרת' }, { status: 500 });
  }
}