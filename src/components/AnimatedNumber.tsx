interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  className?: string;
}

export function AnimatedNumber({ value, decimals, prefix = '', className }: AnimatedNumberProps) {
  const d = decimals ?? (value >= 10000 ? 0 : 2);

  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

  return <span className={className}>{prefix}{formatted}</span>;
}
