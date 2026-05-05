"use client";
import { useSearchParams } from 'next/navigation';
import SummaryCard from '../../components/SummaryCard';
import Link from 'next/link';
import styles from '../page.module.css';

export default function SummaryPage() {
  const searchParams = useSearchParams();
  console.log("Current URL Params:", searchParams.toString());

  // אנחנו שולחים מחרוזות כדי להתאים ל-Type של SummaryCard
  const userData = {
    age: searchParams.get('age') || '26',
    gender: searchParams.get('gender') || 'female',
    weight: searchParams.get('weight') || '',
    height: searchParams.get('height') || '',
    goal: searchParams.get('goal') || '',
    targetWeight: searchParams.get('targetWeight') || '',
    activityLevel: Number(searchParams.get('activityLevel')) || 1.2,
    diet: searchParams.get('diet') || ''
  };
  console.log("Parsed userData:", userData);

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.title}>התוכנית שלך מוכנה!</h1>
      
      {/* עכשיו ה-Types תואמים והשגיאה תיעלם */}
      <SummaryCard data={userData} />

      <Link href="/dashboard" className={styles.primaryButton}>
        המשך ללוח הבקרה
      </Link>
    </main>
  );
}