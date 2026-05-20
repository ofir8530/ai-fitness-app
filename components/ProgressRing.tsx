import styles from './ProgressRing.module.css';

export default function ProgressRing({ consumed, target, color }: { consumed: number, target: number, color: string }) {
  const progress = Math.min((consumed / target) * 100, 100);
  const size = 80;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.container}>
      <svg width={size} height={size} className={styles.svg}>
        <circle className={styles.bgCircle} strokeWidth={stroke} r={radius} cx={size/2} cy={size/2} />
        <circle 
          className={styles.progressCircle}
          stroke={color} strokeWidth={stroke} 
          strokeDasharray={circumference} strokeDashoffset={offset}
          r={radius} cx={size/2} cy={size/2} 
        />
      </svg>
      <div className={styles.text}>{consumed}/{target}g</div>
    </div>
  );
}