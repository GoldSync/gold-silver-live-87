import { ProductPrice } from '@/hooks/useGoldPrices';

interface PriceCardProps {
  product: ProductPrice;
  unit?: string;
}

function formatPrice(n: number): string {
  if (n >= 10000) return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (n >= 100) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PriceCard({ product, unit }: PriceCardProps) {
  const { name, usd, qar, change } = product;
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <div className="group relative rounded-xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-sans font-semibold text-foreground">{name}</h3>
        {change !== 0 && (
          <span
            className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ${
              isUp
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {isUp ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>

      {/* Prices */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-sans uppercase tracking-wider text-muted-foreground">USD</span>
          <span className="text-xl font-sans font-bold tabular-nums text-foreground">
            ${formatPrice(usd)}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-sans uppercase tracking-wider text-muted-foreground">QAR</span>
          <span className="text-lg font-sans font-semibold tabular-nums text-primary">
            {formatPrice(qar)}
          </span>
        </div>
      </div>

      {unit && (
        <p className="mt-3 text-xs font-sans text-muted-foreground text-right">{unit}</p>
      )}
    </div>
  );
}
