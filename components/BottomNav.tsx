'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { Home, BarChart2, Plus, User, Utensils } from 'lucide-react';
import { useModal } from './ModalContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { openModal } = useModal();

  return (
    <nav className={styles.navbar}>
      <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}>
        <Home size={20} /> <span>בית</span>
      </Link>
      
      <Link href="/progress" className={`${styles.navItem} ${pathname === '/progress' ? styles.active : ''}`}>
        <BarChart2 size={20} /> <span>מעקב</span>
      </Link>
      
      {/* כאן נפעיל את המודל */}
    <button className={styles.addButton} onClick={openModal}>
    <Plus size={28} />
    </button>
      
      <Link href="/meals" className={`${styles.navItem} ${pathname === '/meals' ? styles.active : ''}`}>
        <Utensils size={20} /> <span>ארוחות</span>
      </Link>
      
      <Link href="/profile" className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`}>
        <User size={20} /> <span>פרופיל</span>
      </Link>
    </nav>
  );
}