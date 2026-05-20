import styles from './MainCalorieRing.module.css';

interface Props {
  consumed: number;
  target: number;
}

export default function MainCalorieRing({ consumed, target }: Props) {
  const progress = Math.min((consumed / target) * 100, 100);
  const size = 220; // גדולה יותר
  const stroke = 15; // עבה יותר
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.container}>
      <svg width={size} height={size} className={styles.svg}>
        <circle className={styles.bgCircle} strokeWidth={stroke} r={radius} cx={size/2} cy={size/2} />
        <circle 
          className={styles.progressCircle}
          stroke="#0070f3" 
          strokeWidth={stroke} 
          strokeDasharray={circumference} 
          strokeDashoffset={offset}
          r={radius} cx={size/2} cy={size/2} 
        />
      </svg>
      
      <div className={styles.content}>
        <span className={styles.label}>נאכלו</span>
        <span className={styles.mainNumber}>{consumed}</span>
        <span className={styles.divider}>מתוך {target}קלוריות</span>
      </div>
    </div>
  );
}