"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from '../page.module.css';

export default function DietaryPage(){
    const router = useRouter();
    const searchParams = useSearchParams();

// שמירת העדפות במערך
  const [preferences, setPreferences] = useState<string[]>([]);

  const options = [
    { id: 'vegan', label: 'טבעוני' },
    { id: 'vegetarian', label: 'צמחוני' },
    { id: 'kosher', label: 'כשר' },
    { id: 'gluten-free', label: 'ללא גלוטן' },
    { id: 'paleo', label: 'פליאו' }
  ];

  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    // מעבירים את הנתונים הקודמים + החדשים לדף הסיכום
    const params = new URLSearchParams(searchParams.toString());
    params.set('diet', preferences.join(','));
    router.push(`/summary?${params.toString()}`);
  };

  return (
    <main className={styles.mainContainer}>
      <h2>מהם הרגלי האכילה שלך?</h2>
      <div className={styles.optionsGrid}>
        {options.map(opt => (
          <button 
            key={opt.id}
            onClick={() => togglePreference(opt.id)}
            className={preferences.includes(opt.id) ? styles.selectedOpt : styles.opt}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button onClick={handleNext} className={styles.primaryButton}>סיימתי!</button>
    </main>
  );
}