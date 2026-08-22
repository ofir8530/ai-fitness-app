'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

export default function ConditionalBottomNav() {
  const pathname = usePathname();

  const hiddenRoutes = ['/', '/login', '/onboarding', '/register', '/summary'];
  const hideOnPrefix = ['/recipes/', '/nutrition/log'];

  if (hiddenRoutes.includes(pathname)) return null;
  if (hideOnPrefix.some((p) => pathname.startsWith(p))) return null;

  return <BottomNav />;
}
