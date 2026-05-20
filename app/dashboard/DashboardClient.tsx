'use client'
import { useState } from 'react';
import AddFoodModal from '../../components/AddFoodModal';
import ProgressRing from '../../components/ProgressRing';
import MainCalorieRing from '../../components/MainCalorieRing';
import styles from './dashboard.module.css';

export default function DashboardClient({ nutrition }: { nutrition: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className={styles.dashboardContainer}>
      <section className={styles.topSection}>
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

      <button onClick={() => setIsModalOpen(true)} className={styles.addFoodButton}>
        + הוסף ארוחה
      </button>

      {isModalOpen && <AddFoodModal onClose={() => setIsModalOpen(false)} />}
    </main>
  );
}