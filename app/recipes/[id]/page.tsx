'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import MaterialIcon from '@/components/MaterialIcon';
import { getRecipe } from '@/lib/recipes';

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const recipe = getRecipe(id);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [added, setAdded] = useState(false);

  if (!recipe) notFound();

  const toggle = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <AppHeader title="Recipe Detail" showBack backHref="/recipes" />
      <div className="relative w-full pt-16 bg-surface min-h-screen px-container-margin">
        <div className="flex flex-col w-full pb-32">
          <div className="relative w-[calc(100%+2*24px)] -mx-container-margin h-80 rounded-b-[40px] overflow-hidden mb-8 shadow-xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${recipe.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 inset-x-6 flex justify-between items-end">
              <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-label-sm border border-white/30 font-medium">
                <MaterialIcon name="schedule" className="text-[16px] ml-1" />
                {recipe.time}
              </span>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-white">
                <MaterialIcon name="favorite" />
              </div>
            </div>
          </div>

          <div className="sticky top-2 z-40 bg-white/90 backdrop-blur-xl rounded-2xl p-4 mb-8 shadow-sm flex justify-between items-center border border-primary/10">
            <div className="grid grid-cols-4 gap-4 w-full">
              {[
                [recipe.calories, 'קלוריות', 'text-primary'],
                [`${recipe.protein}g`, 'חלבון', 'text-secondary'],
                [`${recipe.carbs}g`, 'פחמימות', 'text-on-surface-variant'],
                [`${recipe.fats}g`, 'שומן', 'text-on-surface-variant'],
              ].map(([val, label, color]) => (
                <div key={String(label)} className="flex flex-col items-center">
                  <span className={`font-headline text-headline-sm font-semibold ${color}`}>
                    {val}
                  </span>
                  <span className="text-on-surface-variant text-label-sm font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-on-surface-variant text-body-md leading-relaxed">
              {recipe.description}
            </p>
          </div>

          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-secondary rounded-full" />
              <h2 className="text-headline-md font-headline font-semibold text-on-surface">
                מרכיבים
              </h2>
            </div>
            <div className="space-y-3">
              {recipe.ingredients.map((item: string, i: number) => (
                <label
                  key={item}
                  className="flex items-center p-4 bg-surface-container-low rounded-xl cursor-pointer transition-colors active:bg-surface-container-high"
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={!!checked[i]}
                    onChange={() => toggle(i)}
                  />
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      checked[i]
                        ? 'bg-primary border-primary'
                        : 'border-primary/30'
                    }`}
                  >
                    {checked[i] && (
                      <MaterialIcon
                        name="check"
                        className="text-white text-[16px]"
                      />
                    )}
                  </div>
                  <span
                    className={`mr-3 text-body-md ${
                      checked[i]
                        ? 'text-on-surface-variant line-through'
                        : 'text-on-surface'
                    }`}
                  >
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-secondary rounded-full" />
              <h2 className="text-headline-md font-headline font-semibold text-on-surface">
                הוראות הכנה
              </h2>
            </div>
            <div className="space-y-6">
              {recipe.steps.map((step: string, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center text-label-md font-semibold">
                    {i + 1}
                  </div>
                  <p className="text-body-md text-on-surface-variant pt-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface/80 backdrop-blur-xl border-t border-primary/5 z-50">
          <button
            type="button"
            onClick={handleAdd}
            className={`w-full h-14 rounded-full text-label-md font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform ${
              added
                ? 'bg-secondary text-on-secondary'
                : 'bg-primary text-on-primary'
            }`}
          >
            <MaterialIcon name={added ? 'check_circle' : 'add_circle'} />
            {added ? 'נוסף בהצלחה!' : 'הוספה ליום שלי'}
          </button>
        </div>
      </div>
    </>
  );
}
