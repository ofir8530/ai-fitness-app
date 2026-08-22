import { redirect } from 'next/navigation';
import { createClientServer } from '../utils/supabaseServer';
import { resolveNutritionTargets } from '@/lib/nutritionTargets';
import { getTodayFoodLogs } from '../actions/foodActions';
import { sumFoodLogs } from '@/lib/nutritionDay';
import NutritionClient from './NutritionClient';

export default async function NutritionPage() {
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

  const meals = await getTodayFoodLogs();
  const consumed = sumFoodLogs(meals);

  const targets = profile
    ? await resolveNutritionTargets(profile)
    : { dailyCalories: 0, protein: 0, carbs: 0, fats: 0 };

  return (
    <NutritionClient meals={meals} consumed={consumed} targets={targets} />
  );
}
