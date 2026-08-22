'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import MaterialIcon from '@/components/MaterialIcon';
import { useModal } from '@/components/ModalContext';
import { deleteFoodLog } from '@/app/actions/foodActions';
import {
  DailyTotals,
  FoodLog,
  NutritionTargets,
  formatMealTime,
  progressRatio,
  subtractFoodLogTotals,
} from '@/lib/nutritionDay';

export default function NutritionClient({
  meals,
  consumed,
  targets,
}: {
  meals: FoodLog[];
  consumed: DailyTotals;
  targets: NutritionTargets;
}) {
  const { openModal } = useModal();
  const router = useRouter();
  const [mealList, setMealList] = useState(meals);
  const [trackedTotals, setTrackedTotals] = useState(consumed);
  const [selectedMeal, setSelectedMeal] = useState<FoodLog | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMealList(meals);
    setTrackedTotals(consumed);
  }, [meals, consumed]);

  const remaining = Math.max(targets.dailyCalories - trackedTotals.calories, 0);
  const progress = progressRatio(trackedTotals.calories, targets.dailyCalories) * 100;

  const handleDelete = (meal: FoodLog) => {
    const previousMeals = mealList;
    const previousTotals = trackedTotals;

    setMealList((current) => current.filter((item) => item.id !== meal.id));
    setTrackedTotals((current) => subtractFoodLogTotals(current, meal));

    startTransition(async () => {
      try {
        const result = await deleteFoodLog(meal.id);
        if (!result.ok) throw new Error('Delete failed');
        router.refresh();
      } catch {
        setMealList(previousMeals);
        setTrackedTotals(previousTotals);
      }
    });
  };

  return (
    <>
      <AppHeader title="Nutrition" />
      <div className="relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-container-margin max-w-lg mx-auto">
          <div className="relative overflow-hidden bg-primary-container rounded-3xl p-6 mb-gutter shadow-sm">
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-4 gap-3">
                <div>
                  <h2 className="font-headline text-headline-md font-semibold text-on-primary-container">
                    תזונה יומית
                  </h2>
                  <p className="text-label-sm font-medium text-on-primary-container/80">
                    {trackedTotals.calories > 0
                      ? `נשארו לך עוד ${remaining.toLocaleString('he-IL')} קלוריות`
                      : 'עדיין לא תועדו ארוחות היום'}
                  </p>
                </div>
                <div className="text-left shrink-0">
                  <span className="font-headline text-headline-lg-mobile font-bold text-on-primary-container">
                    {trackedTotals.calories.toLocaleString('he-IL')}
                  </span>
                  <span className="text-label-md font-semibold text-on-primary-container/60">
                    {' '}
                    / {targets.dailyCalories.toLocaleString('he-IL')}
                  </span>
                </div>
              </div>

              <div className="h-3 w-full bg-on-primary-container/10 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-on-primary-container rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    ['חלבון', `${Math.round(trackedTotals.protein)}g / ${targets.protein}g`],
                    ['פחמימות', `${Math.round(trackedTotals.carbs)}g / ${targets.carbs}g`],
                    ['שומן', `${Math.round(trackedTotals.fats)}g / ${targets.fats}g`],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-surface-container-lowest/20 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center"
                  >
                    <span className="text-label-sm font-medium text-on-primary-container/70 mb-1">
                      {label}
                    </span>
                    <span className="text-label-md font-semibold text-on-primary-container text-center">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-headline-sm font-semibold text-on-surface">
              הארוחות של היום
            </h3>
            <MaterialIcon name="calendar_today" className="text-primary" />
          </div>

          <div className="space-y-4 mb-24">
            {mealList.length === 0 ? (
              <div className="bg-surface-container-low rounded-2xl p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary-fixed flex items-center justify-center">
                  <MaterialIcon name="restaurant" className="text-primary text-3xl" />
                </div>
                <p className="text-body-md text-on-surface-variant mb-4">
                  עדיין אין ארוחות מתועדות להיום.
                  <br />
                  לחצי על + כדי להוסיף.
                </p>
                <button
                  type="button"
                  onClick={openModal}
                  className="px-6 py-3 bg-primary text-on-primary rounded-full text-label-md font-semibold"
                >
                  תיעוד ארוחה ראשונה
                </button>
              </div>
            ) : (
              mealList.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-surface-container-low rounded-2xl p-4 flex gap-4 items-center cursor-pointer"
                  onClick={() => setSelectedMeal(meal)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedMeal(meal);
                    }
                  }}
                >
                  <div className="w-16 h-16 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0 text-primary">
                    <MaterialIcon name="restaurant" className="text-3xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-label-md font-semibold text-on-surface truncate">
                        {meal.food_name}
                      </h4>
                      <span className="text-label-sm font-bold text-primary shrink-0">
                        {meal.calories} קל׳
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      {formatMealTime(meal.created_at)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant rounded-full">
                        חלבון {meal.protein}g
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full">
                        פחמימות {meal.carbs}g
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full">
                        שומן {meal.fats}g
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(meal);
                    }}
                    disabled={pending}
                    className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0"
                    aria-label="מחק ארוחה"
                  >
                    <MaterialIcon name="delete" className="text-[20px]" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedMeal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setSelectedMeal(null)}
          >
            <div
              className="w-full max-w-md rounded-3xl bg-surface-container-low p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-headline-sm font-semibold text-on-surface">
                  {selectedMeal.food_name}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedMeal(null)}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
                  aria-label="סגור"
                >
                  <MaterialIcon name="close" className="text-[20px]" />
                </button>
              </div>

              <div className="space-y-3 text-right">
                <div className="flex items-center justify-between rounded-2xl bg-surface-container-high px-3 py-2">
                  <span className="text-label-sm text-on-surface-variant">שעת תיעוד</span>
                  <span className="text-label-md font-semibold text-on-surface">
                    {formatMealTime(selectedMeal.created_at)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-primary-fixed px-3 py-2">
                    <div className="text-label-sm text-on-primary-fixed-variant">קלוריות</div>
                    <div className="text-label-lg font-semibold text-on-primary-fixed">
                      {selectedMeal.calories} kcal
                    </div>
                  </div>
                  <div className="rounded-2xl bg-secondary-fixed px-3 py-2">
                    <div className="text-label-sm text-on-secondary-fixed-variant">חלבון</div>
                    <div className="text-label-lg font-semibold text-on-secondary-fixed">{selectedMeal.protein}g</div>
                  </div>
                  <div className="rounded-2xl bg-tertiary-fixed px-3 py-2">
                    <div className="text-label-sm text-on-tertiary-fixed-variant">פחמימות</div>
                    <div className="text-label-lg font-semibold text-on-tertiary-fixed">{selectedMeal.carbs}g</div>
                  </div>
                  <div className="rounded-2xl bg-primary-container px-3 py-2">
                    <div className="text-label-sm text-on-primary-container">שומן</div>
                    <div className="text-label-lg font-semibold text-on-primary-container">{selectedMeal.fats}g</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-surface-container px-3 py-3">
                  <p className="text-label-sm font-medium text-on-surface-variant mb-2">פירוט ארוחה</p>
                  <ul className="space-y-2 text-body-md text-on-surface">
                    <li>• שם: {selectedMeal.food_name}</li>
                    <li>• קלוריות: {selectedMeal.calories}</li>
                    <li>• חלבון: {selectedMeal.protein}g</li>
                    <li>• פחמימות: {selectedMeal.carbs}g</li>
                    <li>• שומן: {selectedMeal.fats}g</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={openModal}
          className="fixed bottom-24 left-[max(1.5rem,calc(50%-215px+1.5rem))] w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-95 z-50"
          aria-label="הוספת ארוחה"
        >
          <MaterialIcon name="add" className="text-[32px]" />
        </button>
      </div>
    </>
  );
}
