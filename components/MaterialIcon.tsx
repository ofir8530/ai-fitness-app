import type { CSSProperties } from "react";

type MaterialIconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
};

export default function MaterialIcon({
  name,
  className = "",
  filled = false,
  style,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : undefined,
        ...style,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
