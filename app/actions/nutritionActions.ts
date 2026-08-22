'use server';

import {
  calculateNutritionTargets,
  type UserProfileInput,
  nutritionTargetsToDbFields,
} from '@/lib/nutritionTargets';
import { createClientServer } from '../utils/supabaseServer';

export async function analyzeAndSaveUserNutrition(profile: UserProfileInput) {
  const analysis = calculateNutritionTargets(profile);

  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const dbFields = nutritionTargetsToDbFields(analysis);

    const { error } = await supabase
      .from('profiles')
      .update(dbFields)
      .eq('id', user.id);

    if (error) {
      console.warn('Could not save nutrition targets to profile:', error.message);
    }
  }

  return analysis;
}
