import React, { useEffect, useState, useRef } from 'react';
import { formatGbp } from '../../lib/format';

interface RollingNumberProps {
  value: number;
  formatAsCurrency?: boolean;
  className?: string;
  prefix?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  formatAsCurrency = true,
  className = '',
  prefix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        prevValueRef.current = value;
        setIsAnimating(false);
      }, 140);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const formatted = formatAsCurrency ? formatGbp(displayValue) : displayValue.toLocaleString();

  return (
    <span
      className={`inline-block font-mono-data tabular-nums transition-all duration-200 ${
        isAnimating ? '-translate-y-1 opacity-70' : 'translate-y-0 opacity-100'
      } ${className}`}
    >
      {prefix}
      {formatted}
    </span>
  );
};
