import { redirect } from 'next/navigation';
import { createClientServer } from '../utils/supabaseServer';
import { resolveNutritionTargets } from '@/lib/nutritionTargets';
import ProfileClient from './ProfileClient';

function asDietList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export default async function ProfilePage() {
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
    redirect('/onboarding');
  }

  const targets = await resolveNutritionTargets(profile);

  const displayName =
    profile.full_name ||
    profile.name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    '';

  return (
    <ProfileClient
      profile={{
        displayName,
        email: user.email || '',
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
        targetWeight: profile.target_weight,
        goal: profile.goal,
        activityLevel: profile.activity_level,
        dietaryPreferences: asDietList(profile.dietary_preferences),
        dailyCalories: targets.dailyCalories,
        protein: targets.protein,
        carbs: targets.carbs,
        fats: targets.fats,
        aiInsight: targets.insight,
      }}
    />
  );
}
