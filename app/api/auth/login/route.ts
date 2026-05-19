import { NextResponse } from 'next/server';
import { createClientServer } from '../../../utils/supabaseServer';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // אתחול לקוח השרת לטיפול בעוגיות
    const supabase = await createClientServer();

    // התחברות המשתמש בעזרת Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'התחברות הצליחה!', 
      user: data.user 
    }, { status: 200 });

  } catch (err: any) {
    console.error('Login API Error:', err);
    return NextResponse.json({ error: 'אירעה שגיאה בשרת' }, { status: 500 });
  }
}