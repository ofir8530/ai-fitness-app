'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MaterialIcon from './MaterialIcon';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'בית', icon: 'home', match: ['/dashboard'] },
  { href: '/training', label: 'אימונים', icon: 'fitness_center', match: ['/training'] },
  { href: '/recipes', label: 'מתכונים', icon: 'restaurant', match: ['/recipes'] },
  { href: '/nutrition', label: 'תזונה', icon: 'nutrition', match: ['/nutrition'] },
  { href: '/chat', label: 'צ׳אט', icon: 'chat', match: ['/chat'] },
  { href: '/profile', label: 'פרופיל', icon: 'person', match: ['/profile'] },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-surface/80 backdrop-blur-xl pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center h-16 px-gutter">
        {NAV_ITEMS.map((item) => {
          const active = item.match.some(
            (p) => pathname === p || pathname.startsWith(`${p}/`)
          );
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 transition-colors ${
                active
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant'
              }`}
            >
              <MaterialIcon name={item.icon} filled={active} />
              <span className="text-label-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
