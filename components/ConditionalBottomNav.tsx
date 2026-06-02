'use client'; 
import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

export default function ConditionalBottomNav() {
  const pathname = usePathname();
  
  // הגדירי כאן את כל הנתיבים שבהם הבר אמור להיות מוסתר
  const hiddenRoutes = ['/', '/login','/onboarding' , '/register', '/summary'];
  
  // אם הנתיב הנוכחי נמצא ברשימה, אל תציגי כלום
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return <BottomNav />;
}