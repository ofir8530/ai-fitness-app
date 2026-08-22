import { createClientServer } from '../utils/supabaseServer';
import { redirect } from 'next/navigation';
import { resolveNutritionTargets } from '@/lib/nutritionTargets';
import DashboardClient from './DashboardClient';
import { getTodayTotals } from '../actions/foodActions';

export default async function DashboardPage() {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return (
      <div className="p-8 text-center">
        נא למלא שאלון כדי לצפות בלוח הבקרה.
      </div>
    );
  }

  const nutrition = await resolveNutritionTargets(profile);

  const consumed = await getTodayTotals();
  const displayName =
    profile.full_name ||
    profile.name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    '';

  return (
    <DashboardClient
      nutrition={nutrition}
      consumed={consumed}
      displayName={displayName}
    />
  );
}
