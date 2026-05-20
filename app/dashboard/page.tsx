import { createClientServer } from '../utils/supabaseServer';
import { redirect } from 'next/navigation';
import { calculateNutritionTargets } from '../../utils/calculations';
import styles from './dashboard.module.css';
import ProgressRing from '../../components/ProgressRing';
import MainCalorieRing from '../../components/MainCalorieRing';

export default async function DashboardPage() {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return <div>נא למלא שאלון כדי לצפות בלוח הבקרה.</div>;

    const nutrition = calculateNutritionTargets({
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    goal: profile.goal,
    gender: profile.gender,
    activityLevel: profile.activity_level
    });

  return (
    <main className={styles.dashboardContainer}>
        <section className={styles.topSection}>
            {/* הטבעת המרכזית הגדולה */}
            <div className={styles.mainCard}>
            <MainCalorieRing consumed={1250} target={nutrition.dailyCalories} />
            </div>
        </section>

        <section className={styles.macroGrid}>
            <div className={styles.card}>
            <ProgressRing consumed={45} target={nutrition.protein} color="#ff6b6b" />
            <h3 className={styles.macroTitle}>חלבון</h3>
            </div>
            
            <div className={styles.card}>
            <ProgressRing consumed={110} target={nutrition.carbs} color="#fca311" />
            <h3 className={styles.macroTitle}>פחמימות</h3>
            </div>

            <div className={styles.card}>
            <ProgressRing consumed={30} target={nutrition.fats} color="#4cc9f0" />
            <h3 className={styles.macroTitle}>שומן</h3>
            </div>
        </section>
    </main>
  );
}