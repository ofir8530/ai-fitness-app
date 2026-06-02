"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { animate } from "framer-motion";
import styles from "./WaterBottle.module.css";

const DAILY_GOAL = 2000;
const STEP = 250;

type Bubble = {
  id: number;
  left: number;
  size: number;
  duration: number;
};

export default function WaterBottle() {
  const [water, setWater] = useState(750);
  const [displayWater, setDisplayWater] = useState(750);
  const [sloshing, setSloshing] = useState(false);
  const [goalReached, setGoalReached] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const percentage = Math.min((water / DAILY_GOAL) * 100, 100);

  const triggerSlosh = () => {
    setSloshing(true);
    setTimeout(() => setSloshing(false), 900);
  };

  const addWater = () => {
    triggerSlosh();
    setWater((prev) => Math.min(prev + STEP, DAILY_GOAL));
  };

  const removeWater = () => {
    triggerSlosh();
    setWater((prev) => Math.max(prev - STEP, 0));
  };

  /* Counter animation */
  useEffect(() => {
    const controls = animate(displayWater, water, {
      duration: 0.5,
      onUpdate(value) {
        setDisplayWater(Math.round(value));
      },
    });

    return () => controls.stop();
  }, [water]);

  /* Goal reached */
  useEffect(() => {
    if (water >= DAILY_GOAL) {
      setGoalReached(true);
      const t = setTimeout(() => setGoalReached(false), 4000);
      return () => clearTimeout(t);
    }
  }, [water]);

  /* Random bubbles */
  useEffect(() => {
    const interval = setInterval(() => {
      const bubble: Bubble = {
        id: Date.now() + Math.random(),
        left: Math.random() * 90,
        size: 6 + Math.random() * 14,
        duration: 3 + Math.random() * 4,
      };

      setBubbles((prev) => [...prev, bubble]);

      setTimeout(() => {
        setBubbles((prev) =>
          prev.filter((b) => b.id !== bubble.id)
        );
      }, bubble.duration * 1000);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.card}>

      {goalReached && (
        <Confetti numberOfPieces={200} recycle={false} />
      )}

      <div className={styles.header}>
        <h3>מים</h3>
        <span>
          {displayWater} / {DAILY_GOAL} מ"ל
        </span>
      </div>

      {/* BOTTLE */}
     {/* BOTTLE */}
<div className={styles.bottle}>
  <div
    className={styles.water}
    style={{ height: `${percentage}%` }}
  >
    {/* הגלים בתוך המים - הם יזוזו איתם טבעית */}
    <svg
      className={styles.wave}
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <path className={styles.waveBack} d="M0,40 C200,0 400,80 600,40 C800,0 1000,80 1200,40 L1200,120 L0,120 Z" />
      <path className={styles.waveFront} d="M0,50 C200,100 400,0 600,50 C800,100 1000,0 1200,50 L1200,120 L0,120 Z" />
    </svg>

    {/* הבועות בתוך המים - הן ייראו רק בתוך השטח הכחול */}
    {bubbles.map((b) => (
      <span
        key={b.id}
        className={styles.bubble}
        style={{
          left: `${b.left}%`,
          width: b.size,
          height: b.size,
          animationDuration: `${b.duration}s`,
        }}
      />
    ))}
  </div>
</div>
      <div className={styles.goal}>
        יעד יומי: 2 ליטר
      </div>

      <div className={styles.actions}>
        <button className={styles.plus} onClick={addWater}>+</button>
        <button className={styles.minus} onClick={removeWater}>−</button>
      </div>

      {goalReached && (
        <div className={styles.message}>
          🎉 יי! הגעת ליעד היומי
        </div>
      )}
    </div>
  );
}