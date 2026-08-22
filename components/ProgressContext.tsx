'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// הגדרת מבנה הנתונים
const ProgressContext = createContext({
  data: { water: 0, calories: 0, protein: 0, lastUpdated: '' },
  updateData: (key: string, value: number) => {},
});

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState({
    water: 0,
    calories: 0,
    protein: 0,
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const saved = localStorage.getItem('fitnessData');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      
      // בדיקה האם עבר יום
      if (parsed.lastUpdated !== today) {
        setData({ water: 0, calories: 0, protein: 0, lastUpdated: today });
      } else {
        setData(parsed);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fitnessData', JSON.stringify(data));
  }, [data]);

    const updateData = (key: string, value: number) => {
    setData(prev => {
        const currentValue = Number(prev[key as keyof typeof prev] || 0);
        const newValue = currentValue + value;
        
        return { 
        ...prev, 
        [key]: Math.max(0, newValue) 
        };
    });
    };

  return (
    <ProgressContext.Provider value={{ data, updateData }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);