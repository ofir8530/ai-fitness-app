'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import MaterialIcon from '@/components/MaterialIcon';
import { RECIPES } from '@/lib/recipes';

const CATEGORIES = ['הכל', 'ארוחת בוקר', 'צהריים', 'קינוחים בריאים', 'נשנושים'];

export default function RecipesPage() {
  const [category, setCategory] = useState('הכל');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const featured = RECIPES.find((r) => r.featured);
  const filtered = RECIPES.filter((r) => {
    if (r.featured) return false;
    const matchCat = category === 'הכל' || r.category === category;
    const matchQ =
      !query || r.title.includes(query) || r.description.includes(query);
    return matchCat && matchQ;
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <AppHeader title="Recipes" />
      <div className="relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="px-container-margin py-base">
            <div className="relative flex items-center">
              <MaterialIcon
                name="search"
                className="absolute right-4 text-outline"
              />
              <input
                className="w-full h-12 pr-12 pl-4 bg-surface-container-low rounded-full text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60"
                placeholder="חפשי מתכון בריא..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto flex gap-3 px-container-margin py-4 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-6 py-2 rounded-full font-semibold text-label-md transition-transform active:scale-95 ${
                  category === cat
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {featured && category === 'הכל' && !query && (
            <Link
              href={`/recipes/${featured.id}`}
              className="px-container-margin mb-6 block"
            >
              <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-md group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={featured.image}
                  alt={featured.title}
                />
                <div className="absolute bottom-4 right-4 z-20 text-white">
                  <span className="bg-secondary-container/90 text-on-secondary-container px-3 py-1 rounded-full text-label-sm mb-2 inline-block font-medium">
                    מתכון השבוע
                  </span>
                  <h3 className="font-headline text-headline-sm font-semibold">
                    {featured.title}
                  </h3>
                  <div className="flex gap-3 mt-1 opacity-90">
                    <span className="flex items-center gap-1 text-label-sm">
                      <MaterialIcon name="schedule" className="text-[16px]" />
                      {featured.time}
                    </span>
                    <span className="flex items-center gap-1 text-label-sm">
                      <MaterialIcon name="bolt" className="text-[16px]" />
                      {featured.calories} קלוריות
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          <div className="px-container-margin mb-4">
            <Link
              href="/recipes/new"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-label-md font-semibold text-on-primary shadow-md active:scale-95 transition-transform"
            >
              <MaterialIcon name="add_circle" className="text-[20px]" />
              הוספת מתכון חדש
            </Link>
          </div>

          <div className="px-container-margin grid grid-cols-2 gap-4 pb-8">
            {filtered.map((recipe) => (
              <div
                key={recipe.id}
                className="flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              >
                <div className="relative h-32">
                  <Link href={`/recipes/${recipe.id}`}>
                    <img
                      className="w-full h-full object-cover"
                      src={recipe.image}
                      alt={recipe.title}
                    />
                  </Link>
                  <button
                    type="button"
                    className={`absolute top-2 left-2 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center text-secondary transition-colors ${
                      favorites.has(recipe.id)
                        ? 'bg-secondary/10'
                        : 'bg-white/80'
                    }`}
                    onClick={() => toggleFavorite(recipe.id)}
                    aria-label="מועדף"
                  >
                    <MaterialIcon
                      name="favorite"
                      filled={favorites.has(recipe.id)}
                      className="text-[20px]"
                    />
                  </button>
                </div>
                <Link href={`/recipes/${recipe.id}`} className="p-3 block">
                  <h4 className="text-label-md font-semibold text-on-surface truncate">
                    {recipe.title}
                  </h4>
                  <div className="flex justify-between items-center mt-2 text-on-surface-variant/70">
                    <span className="flex items-center gap-1 text-label-sm">
                      <MaterialIcon name="schedule" className="text-[14px]" />
                      {recipe.time}
                    </span>
                    <span className="text-label-sm font-bold text-primary">
                      {recipe.calories} קל׳
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center py-12 px-container-margin text-center bg-surface-container-low rounded-t-[40px]">
            <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-4">
              <MaterialIcon
                name="restaurant_menu"
                className="text-primary text-[32px]"
              />
            </div>
            <h3 className="font-headline text-headline-sm font-semibold text-on-surface mb-2">
              לא מצאת את מה שחיפשת?
            </h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              ספריית המתכונים שלנו מתעדכנת בכל יום ראשון עם השראה חדשה.
            </p>
            <Link
              href="/chat"
              className="px-8 py-3 bg-secondary text-on-secondary rounded-full text-label-md font-semibold shadow-md active:scale-95 transition-transform"
            >
              בקשי מתכון מותאם אישית
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
