'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import MaterialIcon from '../MaterialIcon';
import { useProgress } from '../ProgressContext';

const DAILY_GOAL_ML = 2500;
const STEP_ML = 250;

type Bubble = {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
};

export default function WaterBottle() {
  const { data, updateData } = useProgress();
  const [goalReached, setGoalReached] = useState(false);
  const [scaleClass, setScaleClass] = useState('');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const liters = data.water / 1000;
  const maxLiters = DAILY_GOAL_ML / 1000;
  const percentage = Math.min((data.water / DAILY_GOAL_ML) * 100, 100);

  const createBubbles = (hasWater: boolean) => {
    if (!hasWater) {
      setBubbles([]);
      return;
    }
    setBubbles(
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 6 + 2,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 2,
      }))
    );
  };

  useEffect(() => {
    createBubbles(data.water > 0);
  }, [data.water]);

  useEffect(() => {
    if (data.water >= DAILY_GOAL_ML && !goalReached) {
      setGoalReached(true);
      const t = setTimeout(() => setGoalReached(false), 4000);
      return () => clearTimeout(t);
    }
  }, [data.water, goalReached]);

  const bounce = (cls: string) => {
    setScaleClass(cls);
    setTimeout(() => setScaleClass(''), 200);
  };

  const addWater = () => {
    if (data.water < DAILY_GOAL_ML) {
      updateData('water', STEP_ML);
      bounce('scale-105');
    }
  };

  const removeWater = () => {
    if (data.water > 0) {
      updateData('water', -STEP_ML);
      bounce('scale-95');
    }
  };

  return (
    <div className="col-span-2 bg-surface-container-lowest rounded-xl p-gutter shadow-sm flex flex-col gap-6 items-center">
      {goalReached && <Confetti numberOfPieces={180} recycle={false} />}

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <MaterialIcon
            name="water_drop"
            filled
            className="text-primary-container"
          />
          <span className="font-headline text-headline-sm font-semibold text-on-surface">
            שתיית מים
          </span>
        </div>
        <span className="font-headline text-headline-sm font-semibold text-primary">
          {liters.toFixed(2)} / {maxLiters} ליטר
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-4 py-4 w-full">
        <button
          type="button"
          onClick={addWater}
          className={`relative cursor-pointer select-none active:scale-95 transition-transform duration-200 bg-transparent p-0 ${scaleClass}`}
          aria-label="הוסף מים"
        >
          <div className="h-5 bg-primary/90 rounded-t-lg mx-auto -mb-0.5 relative z-20 w-8 border-x-2 border-t-2 border-primary" />
          <div className="h-3 bg-primary/20 mx-auto w-6 border-x-2 border-primary/40" />
          <div className="wave-container shadow-inner">
            <div className="water-wave" style={{ height: `${percentage}%` }}>
              {bubbles.map((b) => (
                <div
                  key={b.id}
                  className="bubble"
                  style={{
                    width: b.size,
                    height: b.size,
                    left: `${b.left}%`,
                    animationDelay: `${b.delay}s`,
                    animationDuration: `${b.duration}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={removeWater}
            className="w-14 h-14 rounded-full bg-surface-container-high text-on-surface shadow-sm flex items-center justify-center active:scale-90 transition-transform"
            aria-label="הסר מים"
          >
            <MaterialIcon name="remove" className="text-2xl" />
          </button>
          <button
            type="button"
            onClick={addWater}
            className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center active:scale-90 transition-transform"
            aria-label="הוסף מים"
          >
            <MaterialIcon name="add" className="text-2xl" />
          </button>
        </div>
      </div>

      {goalReached && (
        <p className="font-label-md text-primary text-sm font-semibold">
          הגעת ליעד היומי!
        </p>
      )}
    </div>
  );
}
