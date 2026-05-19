import { createClientServer } from '../utils/supabaseServer';
import { redirect } from 'next/navigation';
import SummaryCard from '../../components/SummaryCard';
import Link from 'next/link';
import styles from '../page.module.css';

export default async function SummaryPage() {
  const supabase = await createClientServer();

  // 1. מי המשתמש?
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. שליפת הנתונים מה-DB
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return <div>לא נמצאו נתונים, אולי כדאי למלא שאלון?</div>;
  }

  // 3. סידור הנתונים לפורמט שה-SummaryCard מצפה לו
  const userData = {
    age: profile.age?.toString() || '',
    gender: profile.gender || '',
    weight: profile.weight?.toString() || '',
    height: profile.height?.toString() || '',
    goal: profile.goal || '',
    targetWeight: profile.target_weight?.toString() || '',
    activityLevel: profile.activity_level || 1.2,
    diet: profile.dietary_preferences || ''
  };

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.title}>התוכנית שלך מוכנה!</h1>
      
      <SummaryCard data={userData} />

      <Link href="/dashboard" className={styles.primaryButton}>
        המשך ללוח הבקרה
      </Link>
    </main>
  );
}