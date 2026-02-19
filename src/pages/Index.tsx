import { useState } from 'react';
import { Gem, Box, Coins, CircleDot, LayoutGrid, TableProperties } from 'lucide-react';
import { Header } from '@/components/Header';
import { PriceSection } from '@/components/PriceSection';
import { PriceTable } from '@/components/PriceTable';
import { useGoldPrices } from '@/hooks/useGoldPrices';
import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from '@/components/ui/skeleton';

const sections = [
  { key: 'jewelry' as const, title: 'Gold Jewelry', subtitle: 'Price per gram by karat', unit: 'per gram', icon: <Gem className="w-5 h-5" /> },
  { key: 'goldBars' as const, title: 'Gold Bars', subtitle: 'Investment grade bullion', unit: undefined, icon: <Box className="w-5 h-5" /> },
  { key: 'goldCoins' as const, title: 'Gold Coins', subtitle: 'Popular bullion coins', unit: undefined, icon: <Coins className="w-5 h-5" /> },
  { key: 'silverBars' as const, title: 'Silver Bars', subtitle: 'Silver bullion products', unit: undefined, icon: <CircleDot className="w-5 h-5" /> },
];

const Index = () => {
  const { isDark, toggle } = useTheme();
  const prices = useGoldPrices();
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const dataMap = {
    jewelry: prices.jewelry,
    goldBars: prices.goldBars,
    goldCoins: prices.goldCoins,
    silverBars: prices.silverBars,
  };

  const ViewComponent = view === 'cards' ? PriceSection : PriceTable;

  return (
    <div className="min-h-screen bg-background">
      <Header
        isDark={isDark}
        onToggleTheme={toggle}
        spot={prices.spot}
        previousSpot={prices.previousSpot}
        countdown={prices.countdown}
        lastUpdated={prices.lastUpdated}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* View toggle */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center rounded-lg border border-border/60 bg-card p-1 gap-0.5">
            <button
              onClick={() => setView('cards')}
              className={`p-2 rounded-md transition-colors ${view === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-2 rounded-md transition-colors ${view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Table view"
            >
              <TableProperties className="w-4 h-4" />
            </button>
          </div>
        </div>

        {prices.loading ? (
          <div className="space-y-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(j => (
                    <Skeleton key={j} className="h-36 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {sections.map(s => (
              <ViewComponent
                key={s.key}
                title={s.title}
                subtitle={s.subtitle}
                products={dataMap[s.key]}
                unit={s.unit}
                icon={s.icon}
              />
            ))}
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-border/50 text-center">
          <p className="text-xs font-sans text-muted-foreground">
            Prices are simulated for demo purposes · USD → QAR fixed at 3.64 · Auto-refreshes every 60s
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
