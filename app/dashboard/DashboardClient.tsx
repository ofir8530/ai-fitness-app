'use client';

import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import WaterBottle from '@/components/WaterTracker/WaterBottle';
import MaterialIcon from '@/components/MaterialIcon';
import { useModal } from '@/components/ModalContext';
import {
  DailyTotals,
  NutritionTargets,
  progressRatio,
} from '@/lib/nutritionDay';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'בוקר טוב';
  if (hour < 17) return 'צהריים טובים';
  if (hour < 21) return 'ערב טוב';
  return 'לילה טוב';
}

export default function DashboardClient({
  nutrition,
  consumed,
  displayName,
}: {
  nutrition: NutritionTargets;
  consumed: DailyTotals;
  displayName: string;
}) {
  const { openModal } = useModal();
  const remaining = Math.max(nutrition.dailyCalories - consumed.calories, 0);
  const calorieProgress = progressRatio(
    consumed.calories,
    nutrition.dailyCalories
  );
  const proteinProgress = progressRatio(consumed.protein, nutrition.protein);
  const carbsProgress = progressRatio(consumed.carbs, nutrition.carbs);
  const fatsProgress = progressRatio(consumed.fats, nutrition.fats);

  const circumference = (r: number) => 2 * Math.PI * r;
  const outerR = 40;
  const midR = 30;
  const innerR = 22;
  const outerC = circumference(outerR);
  const midC = circumference(midR);
  const innerC = circumference(innerR);

  return (
    <>
      <AppHeader title="Home" />
      <div className="relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full gap-gutter px-container-margin max-w-lg mx-auto">
          <section className="flex flex-col gap-1 py-4">
            <span className="font-headline text-headline-lg-mobile font-bold text-on-surface">
              {getGreeting()}
              {displayName ? `, ${displayName}` : ''}
            </span>
            <span className="text-body-md text-on-surface-variant">
              {consumed.calories > 0
                ? 'סיכום לפי הארוחות שתיעדת היום'
                : 'עדיין לא תועדו ארוחות היום — הוסיפי מתזונה'}
            </span>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-surface-container-lowest rounded-xl p-gutter shadow-sm flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">
                  קלוריות שנותרו
                </span>
                <span className="font-headline text-headline-md font-semibold text-primary">
                  {remaining.toLocaleString('he-IL')}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary-container" />
                  <span className="text-label-sm font-medium text-on-surface-variant">
                    נצרך {consumed.calories.toLocaleString('he-IL')} /{' '}
                    {nutrition.dailyCalories.toLocaleString('he-IL')}
                  </span>
                </div>
              </div>

              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-surface-container-high"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r={outerR}
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-primary transition-all duration-1000 ease-out"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r={outerR}
                    stroke="currentColor"
                    strokeDasharray={outerC}
                    strokeDashoffset={outerC * (1 - calorieProgress)}
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-secondary-container"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r={midR}
                    stroke="currentColor"
                    strokeDasharray={midC}
                    strokeDashoffset={midC * (1 - proteinProgress)}
                    strokeLinecap="round"
                    strokeWidth="6"
                  />
                  <circle
                    className="text-primary-container"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r={innerR}
                    stroke="currentColor"
                    strokeDasharray={innerC}
                    strokeDashoffset={innerC * (1 - carbsProgress)}
                    strokeLinecap="round"
                    strokeWidth="6"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MaterialIcon name="spa" className="text-primary text-body-lg" />
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-surface-container-low rounded-xl p-4 flex justify-around items-center gap-2">
              {(
                [
                  ['חלבון', consumed.protein, nutrition.protein, 'bg-primary-container', proteinProgress],
                  ['פחמימות', consumed.carbs, nutrition.carbs, 'bg-secondary-container', carbsProgress],
                  ['שומן', consumed.fats, nutrition.fats, 'bg-primary', fatsProgress],
                ] as const
              ).map(([label, value, target, barClass, ratio]) => (
                <div key={label} className="flex flex-col items-center gap-1 min-w-0">
                  <span className="text-label-sm font-medium text-on-surface-variant">
                    {label}
                  </span>
                  <span className="text-label-md font-semibold text-on-surface">
                    {Math.round(value)}/{target}g
                  </span>
                  <div className="w-12 h-1 bg-surface-container-high rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barClass}`}
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={openModal}
              className="col-span-2 bg-primary text-on-primary rounded-xl p-gutter shadow-md flex items-center justify-between gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <MaterialIcon name="restaurant" className="text-2xl" />
                </div>
                <div className="flex flex-col min-w-0 text-right">
                  <span className="font-headline text-headline-sm font-semibold">
                    הוספת ארוחה מהירה
                  </span>
                  <span className="text-label-sm text-on-primary/80 truncate">
                    תיעוד ארוחה בלי לעבור לעמוד נפרד
                  </span>
                </div>
              </div>
              <MaterialIcon name="add" className="shrink-0 opacity-80" />
            </button>

            <Link
              href="/chat"
              className="col-span-2 bg-primary text-on-primary rounded-xl p-gutter shadow-md flex items-center justify-between gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <MaterialIcon name="chat" className="text-2xl" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline text-headline-sm font-semibold">
                    ייעוץ תזונה ב-AI
                  </span>
                  <span className="text-label-sm text-on-primary/80 truncate">
                    שאלי על ארוחות, מתכונים או התאמות ליום שלך
                  </span>
                </div>
              </div>
              <MaterialIcon name="arrow_back" className="shrink-0 opacity-80" />
            </Link>

            <WaterBottle />
          </div>

          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
