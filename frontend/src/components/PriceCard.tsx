import { ProductPrice } from '@/hooks/useGoldPrices';
import { AnimatedNumber } from './AnimatedNumber';

interface PriceCardProps {
  product: ProductPrice;
  unit?: string;
  className?: string;
}

export function PriceCard({ product, unit, className = '' }: PriceCardProps) {
  const { name, usd, qar, change } = product;
  const isUp = change > 0;

  return (
    <div className={`group relative rounded-xl border border-border/60 bg-card p-6 sm:p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-sans font-semibold text-foreground">{name}</h3>
        {product.trend !== 'flat' && (
          <span
            className={`text-sm font-sans font-medium px-2.5 py-1 rounded-full ${product.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              }`}
          >
            {product.trend === 'up' ? '▲' : '▼'}{Math.abs(product.stickyPct).toFixed(2)}%
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-sans uppercase tracking-wider text-muted-foreground">QAR</span>
          <AnimatedNumber value={qar} decimals={1} className="text-2xl font-sans font-bold tabular-nums text-foreground" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-sans uppercase tracking-wider text-muted-foreground">USD</span>
          <AnimatedNumber value={usd} decimals={1} prefix="$" className="text-xl font-sans font-semibold tabular-nums text-primary" />
        </div>
      </div>

      {unit && (
        <p className="mt-4 text-sm font-sans text-muted-foreground text-right">{unit}</p>
      )}
    </div>
  );
}
