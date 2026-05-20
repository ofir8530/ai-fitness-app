'use server'
import { createClientServer } from '../utils/supabaseServer';

export async function addFoodLog(formData: FormData) {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const foodData = {
    user_id: user.id,
    food_name: formData.get('food_name'),
    calories: parseInt(formData.get('calories') as string),
    protein: parseInt(formData.get('protein') as string),
    carbs: parseInt(formData.get('carbs') as string),
    fats: parseInt(formData.get('fats') as string),
  };

  const { error } = await supabase.from('food_logs').insert([foodData]);
  if (error) console.error("Error inserting:", error);
}