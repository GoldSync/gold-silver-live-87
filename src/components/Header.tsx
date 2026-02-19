import { Moon, Sun, Activity } from 'lucide-react';
import { PriceData } from '@/hooks/useGoldPrices';
import { AnimatedNumber } from './AnimatedNumber';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  spot: PriceData | null;
  previousSpot: PriceData | null;
  countdown: number;
  lastUpdated: Date | null;
}

function SpotBadge({ label, price, prevPrice }: { label: string; price: number; prevPrice?: number }) {
  const diff = prevPrice ? price - prevPrice : 0;
  const isUp = diff > 0;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs font-sans uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <AnimatedNumber
          value={price}
          prefix="$"
          decimals={2}
          className="text-lg md:text-xl font-semibold font-sans tabular-nums text-foreground"
        />
        {diff !== 0 && (
          <span className={`text-xs font-sans font-medium ${isUp ? 'text-success' : 'text-destructive'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(diff).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}

export function Header({ isDark, onToggleTheme, spot, previousSpot, countdown, lastUpdated }: HeaderProps) {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-shimmer" />
            <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground tracking-tight">
              Gold Pulse
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-sans text-muted-foreground">
              <Activity className="w-3 h-3 text-success pulse-live" />
              <span>
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString()}`
                  : 'Connecting...'}
              </span>
            </div>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-primary" />
              ) : (
                <Moon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {spot && (
          <div className="flex items-center justify-center gap-8 sm:gap-12 pb-4 animate-fade-in-up">
            <SpotBadge label="Gold / oz" price={spot.goldSpotUSD} prevPrice={previousSpot?.goldSpotUSD} />
            <div className="w-px h-8 bg-border" />
            <SpotBadge label="Silver / oz" price={spot.silverSpotUSD} prevPrice={previousSpot?.silverSpotUSD} />
          </div>
        )}
      </div>
    </header>
  );
}
