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
    <div className={`group relative rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-500 hover:border-[#ab8c56]/40 hover:bg-white/10 ${className}`}>
      <div className="flex flex-row items-center justify-between h-full gap-4">

        {/* LEFT SIDE: NAME & TREND */}
        <div className="flex flex-col justify-between h-full py-1 min-w-0">
          <h3 className="text-sm font-sans font-bold text-white uppercase tracking-[0.2em] truncate">{name}</h3>
          {product.trend !== 'flat' && (
            <div
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${product.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}
            >
              <span className="text-[8px]">{product.trend === 'up' ? '▲' : '▼'}</span>
              <span>{Math.abs(product.stickyPct).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: PRICES */}
        <div className="flex flex-col items-end justify-center gap-1 border-l border-white/10 pl-4 h-full">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#ab8c56] font-bold leading-none mb-1">QAR</span>
            <AnimatedNumber value={qar} decimals={1} className="text-xl font-sans font-bold tabular-nums text-white" />
          </div>
          <div className="flex flex-col items-end opacity-60">
            <span className="text-[8px] uppercase tracking-widest text-white/60 font-medium leading-none">USD</span>
            <AnimatedNumber value={usd} decimals={1} prefix="$" className="text-sm font-sans font-semibold tabular-nums text-white" />
          </div>
        </div>

      </div>

      {unit && (
        <p className="absolute -bottom-2 right-4 px-2 bg-[#0e1420] text-[9px] uppercase tracking-[0.2em] text-[#ab8c56] font-bold">{unit}</p>
      )}
    </div>
  );
}
