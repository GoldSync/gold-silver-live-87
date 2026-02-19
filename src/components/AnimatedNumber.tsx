import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  className?: string;
}

export function AnimatedNumber({ value, decimals, prefix = '', className }: AnimatedNumberProps) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  const d = decimals ?? (value >= 10000 ? 0 : 2);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlash(true);
      prevRef.current = value;
      const timeout = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [value]);

  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

  return (
    <span
      className={`${className} transition-all duration-500 ease-out ${
        flash ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {prefix}{formatted}
    </span>
  );
}
