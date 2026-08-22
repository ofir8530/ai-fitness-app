'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NutritionLogPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/nutrition');
  }, [router]);

  return null;
}