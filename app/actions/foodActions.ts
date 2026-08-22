'use server';

import { revalidatePath } from 'next/cache';
import { createClientServer } from '../utils/supabaseServer';
import {
  FoodLog,
  sumFoodLogs,
  todayRangeISO,
  DailyTotals,
} from '@/lib/nutritionDay';

function revalidateNutritionViews() {
  revalidatePath('/dashboard');
  revalidatePath('/nutrition');
  revalidatePath('/nutrition/log');
}

export async function getTodayFoodLogs(): Promise<FoodLog[]> {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { start, end } = todayRangeISO();

  const { data, error } = await supabase
    .from('food_logs')
    .select('id, user_id, food_name, calories, protein, carbs, fats, created_at')
    .eq('user_id', user.id)
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getTodayFoodLogs:', error.message);
    return [];
  }

  return (data ?? []) as FoodLog[];
}

export async function getTodayTotals(): Promise<DailyTotals> {
  const logs = await getTodayFoodLogs();
  return sumFoodLogs(logs);
}

export async function addFoodLog(formData: FormData) {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const foodName = String(formData.get('food_name') || '').trim();
  if (!foodName) throw new Error('חסר שם מנה');

  const foodData = {
    user_id: user.id,
    food_name: foodName,
    calories: Number(formData.get('calories')) || 0,
    protein: Number(formData.get('protein')) || 0,
    carbs: Number(formData.get('carbs')) || 0,
    fats: Number(formData.get('fats')) || 0,
  };

  const { error } = await supabase.from('food_logs').insert([foodData]);
  if (error) {
    console.error('Error inserting:', error);
    throw new Error(error.message);
  }

  revalidateNutritionViews();
  return { ok: true };
}

export async function updateFoodLog(id: string, formData: FormData) {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const foodName = String(formData.get('food_name') || '').trim();
  if (!foodName) throw new Error('חסר שם מנה');

  const payload = {
    food_name: foodName,
    calories: Number(formData.get('calories')) || 0,
    protein: Number(formData.get('protein')) || 0,
    carbs: Number(formData.get('carbs')) || 0,
    fats: Number(formData.get('fats')) || 0,
  };

  const { data, error } = await supabase
    .from('food_logs')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, user_id, food_name, calories, protein, carbs, fats, created_at')
    .single();

  if (error) {
    console.error('Error updating meal:', error);
    throw new Error(error.message);
  }

  revalidateNutritionViews();
  return { ok: true, meal: data as FoodLog };
}

export async function deleteFoodLog(id: string) {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: existingMeal, error: fetchError } = await supabase
    .from('food_logs')
    .select('id, user_id, food_name, calories, protein, carbs, fats, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!existingMeal) throw new Error('Meal not found');

  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidateNutritionViews();
  return { ok: true, deleted: existingMeal as FoodLog };
}
