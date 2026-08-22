import Link from "next/link";
import { LOGO_URL, PROFILE_AVATAR_URL } from "@/lib/brand";
import MaterialIcon from "./MaterialIcon";

type AppHeaderProps = {
  title: string;
  showBack?: boolean;
  backHref?: string;
};

export default function AppHeader({
  title,
  showBack = false,
  backHref,
}: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-container-margin flex items-center justify-between">
        <div className="flex items-center gap-base">
          {showBack ? (
            <Link
              href={backHref ?? ".."}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant"
              aria-label="חזרה"
            >
              <MaterialIcon name="arrow_back" />
            </Link>
          ) : (
            <img
              alt="Logo"
              className="h-8 w-auto object-contain"
              src={LOGO_URL}
            />
          )}
          <span className="font-headline text-headline-sm text-primary font-semibold">
            {title}
          </span>
        </div>
        {!showBack && (
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full overflow-hidden"
            aria-label="פרופיל"
          >
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src={PROFILE_AVATAR_URL}
            />
          </Link>
        )}
      </div>
    </header>
  );
}
