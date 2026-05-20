import { createClientServer } from '../utils/supabaseServer';
import { redirect } from 'next/navigation';
import { calculateNutritionTargets } from '../../utils/calculations';
import DashboardClient from './DashboardClient'; // הייבוא החדש

export default async function DashboardPage() {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile) return <div>נא למלא שאלון כדי לצפות בלוח הבקרה.</div>;

  const nutrition = calculateNutritionTargets({
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    goal: profile.goal,
    gender: profile.gender,
    activityLevel: profile.activity_level
  });

  return <DashboardClient nutrition={nutrition} />;
}