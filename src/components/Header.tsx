import { Moon, Sun, Activity } from 'lucide-react';
import { PriceData } from '@/hooks/useGoldPrices';
import { AnimatedNumber } from './AnimatedNumber';
import { useState, useEffect } from 'react';

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
      <span className="text-sm font-sans uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <AnimatedNumber
          value={price}
          prefix="$"
          decimals={2}
          className="text-xl md:text-2xl font-semibold font-sans tabular-nums text-foreground"
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

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const day = now.toLocaleDateString('en-US', { weekday: 'long' });
  const date = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex flex-col items-end text-right">
      <span className="text-sm font-sans font-semibold text-foreground">{day}</span>
      <span className="text-xs font-sans text-muted-foreground">{date}</span>
      <span className="text-sm font-sans tabular-nums text-primary font-medium">{time}</span>
    </div>
  );
}

export function Header({ isDark, onToggleTheme, spot, previousSpot }: HeaderProps) {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gold-shimmer" />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight leading-tight">
                SISS Precious Metals
              </h1>
              <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
                <Activity className="w-3 h-3 text-success pulse-live" />
                <span>Live Prices</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:block">
              <LiveClock />
            </div>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {spot && (
          <div className="flex items-center justify-center gap-8 sm:gap-12 pb-5 animate-fade-in-up">
            <SpotBadge label="Gold / oz" price={spot.goldSpotUSD} prevPrice={previousSpot?.goldSpotUSD} />
            <div className="w-px h-10 bg-border" />
            <SpotBadge label="Silver / oz" price={spot.silverSpotUSD} prevPrice={previousSpot?.silverSpotUSD} />
          </div>
        )}
      </div>
    </header>
  );
}
