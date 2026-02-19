import { Gem, Box, Coins, CircleDot } from 'lucide-react';
import { Header } from '@/components/Header';
import { PriceSection } from '@/components/PriceSection';
import { useGoldPrices } from '@/hooks/useGoldPrices';
import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { isDark, toggle } = useTheme();
  const prices = useGoldPrices();

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
            <PriceSection
              title="Gold Jewelry"
              subtitle="Price per gram by karat"
              products={prices.jewelry}
              unit="per gram"
              icon={<Gem className="w-5 h-5" />}
            />

            <PriceSection
              title="Gold Bars"
              subtitle="Investment grade bullion"
              products={prices.goldBars}
              icon={<Box className="w-5 h-5" />}
            />

            <PriceSection
              title="Gold Coins"
              subtitle="Popular bullion coins"
              products={prices.goldCoins}
              icon={<Coins className="w-5 h-5" />}
            />

            <PriceSection
              title="Silver Bars"
              subtitle="Silver bullion products"
              products={prices.silverBars}
              icon={<CircleDot className="w-5 h-5" />}
            />
          </div>
        )}

        {/* Footer */}
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
