import { createClientServer } from '../utils/supabaseServer';
import { redirect } from 'next/navigation';
import SummaryCard from '../../components/SummaryCard';
import Link from 'next/link';
import { LOGO_URL } from '@/lib/brand';
import { resolveNutritionTargets } from '@/lib/nutritionTargets';

export default async function SummaryPage() {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-container-margin text-center">
        לא נמצאו נתונים — אולי כדאי למלא שאלון?
        <Link href="/onboarding" className="text-primary font-semibold mr-2">
          חזרה לשאלון
        </Link>
      </div>
    );
  }

  const nutrition = await resolveNutritionTargets(profile);

  const userData = {
    age: profile.age?.toString() || '',
    gender: profile.gender || '',
    weight: profile.weight?.toString() || '',
    height: profile.height?.toString() || '',
    goal: profile.goal || '',
    targetWeight: profile.target_weight?.toString() || '',
    activityLevel: profile.activity_level || 1.2,
    diet: profile.dietary_preferences || '',
  };

  return (
    <main className="min-h-screen bg-background text-on-surface px-container-margin py-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <img alt="Calceat" src={LOGO_URL} className="h-8 w-auto" />
        <span className="font-headline text-headline-sm font-semibold text-primary">
          Calceat
        </span>
      </div>

      <h1 className="font-headline text-headline-lg-mobile font-bold text-on-surface mb-2">
        התוכנית שלך מוכנה!
      </h1>
      <p className="text-body-md text-on-surface-variant mb-8">
        ה-AI ניתח את הנתונים שלך והגדיר יעדים יומיים מותאמים אישית.
      </p>

      <SummaryCard data={userData} nutrition={nutrition} />

      <Link
        href="/dashboard"
        className="mt-8 w-full py-4 rounded-full bg-primary text-on-primary font-headline text-headline-sm font-semibold shadow-md flex items-center justify-center active:scale-95 transition-transform"
      >
        המשך ללוח הבקרה
      </Link>
    </main>
  );
}
