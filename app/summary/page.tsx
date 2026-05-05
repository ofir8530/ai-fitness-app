"use client";
import { useSearchParams } from 'next/navigation';
import SummaryCard from '../../components/SummaryCard';
import Link from 'next/link';
import styles from '../page.module.css';

export default function SummaryPage() {
  const searchParams = useSearchParams();

  const userData = {
  age: searchParams.get('age') || '26',
  weight: searchParams.get('weight') || '',
  height: searchParams.get('height') || '',
  goal: searchParams.get('goal') || '',
  targetWeight: searchParams.get('targetWeight') || '',
  diet: searchParams.get('diet') || '' 
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