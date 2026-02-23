import { useState, useMemo, useEffect } from 'react';
import { Gem, Box, Coins, CircleDot, LayoutGrid, TableProperties } from 'lucide-react';
import { Header } from '@/components/Header';
import { PriceSection } from '@/components/PriceSection';
import { PriceTable } from '@/components/PriceTable';
import { useSettings } from '@/hooks/useSettings';
import { useGoldPrices, ProductPrice } from '@/hooks/useGoldPrices';
import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from '@/components/ui/skeleton';
import { MarketClosedBanner } from '@/components/MarketClosedBanner';
import { DashboardLockOverlay } from '@/components/DashboardLockOverlay';



const sections = [
  { key: 'jewelry' as const, title: 'Gold Jewelry', subtitle: 'Price per gram by karat', unit: 'per gram', icon: <Gem className="w-5 h-5" /> },
  { key: 'goldBars' as const, title: 'Gold Bars', subtitle: 'Investment grade bullion', unit: undefined, icon: <Box className="w-5 h-5" /> },
  { key: 'goldCoins' as const, title: 'Gold Coins', subtitle: 'Popular bullion coins', unit: undefined, icon: <Coins className="w-5 h-5" /> },
  { key: 'silverBars' as const, title: 'Silver Bars', subtitle: 'Silver bullion products', unit: undefined, icon: <CircleDot className="w-5 h-5" /> },
];


type MarginType = 'fixed' | 'percent';

const TROY_OZ_GRAMS = 31.1035;

function applyMargin(products: ProductPrice[], margin: number, type: MarginType, currencyRate: number): ProductPrice[] {
  if (margin === 0) return products;
  return products.map(p => {
    let marginAmount = 0;
    if (type === 'fixed') {
      // Fixed Margin is now treated as "Amount per Ounce"
      // So we scale it by the product's weight in ounces
      const weightInOz = p.weight / TROY_OZ_GRAMS;
      marginAmount = margin * weightInOz;
    } else {
      // Percentage margin
      marginAmount = p.usd * (margin / 100);
    }

    return {
      ...p,
      usd: p.usd + marginAmount,
      qar: (p.usd + marginAmount) * currencyRate,
    };
  });
}

const Index = () => {
  const { isDark, toggle } = useTheme();
  const prices = useGoldPrices();
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const { categoryTitles, margin, marginType, isLocked, currencyRate } = useSettings();

  // Carousel state
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSectionIndex((prev) => (prev + 1) % sections.length);
    }, 10000); // 10 seconds

    return () => clearInterval(timer);
  }, []);

  const dataMap = useMemo(() => ({
    // Jewelry: Logic A (Spot + $2 + 3% premium) - NO Custom Margin
    jewelry: prices.jewelry,
    // Others: Logic B (Spot + $2 + Custom Margin)
    goldBars: applyMargin(prices.goldBars, margin, marginType, currencyRate),
    goldCoins: applyMargin(prices.goldCoins, margin, marginType, currencyRate),
    silverBars: applyMargin(prices.silverBars, margin, marginType, currencyRate),
  }), [prices.jewelry, prices.goldBars, prices.goldCoins, prices.silverBars, margin, marginType, currencyRate]);


  const ViewComponent = view === 'cards' ? PriceSection : PriceTable;
  const currentSection = sections[activeSectionIndex];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isLocked && <DashboardLockOverlay />}
      <Header
        isDark={isDark}
        onToggleTheme={toggle}
        spot={prices.spot}
        previousSpot={prices.previousSpot}
        onRefresh={prices.refresh}
        isRefreshing={prices.refreshing}
        lastUpdated={prices.lastUpdated}
        lastGoldTrend={prices.lastGoldTrend}
        lastSilverTrend={prices.lastSilverTrend}
        lastGoldDiff={prices.lastGoldDiff}
        lastSilverDiff={prices.lastSilverDiff}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {prices.isWeekend && (
          <div className="flex justify-center mb-6">
            <MarketClosedBanner closeDate={prices.closeDate} variant="light" />
          </div>
        )}
        {/* Controls */}
        <div className="flex items-center justify-end gap-2 mb-8">
          <div className="inline-flex items-center rounded-lg border border-border/60 bg-card p-1 gap-0.5">
            <button
              onClick={() => setView('cards')}
              className={`p-2.5 rounded-md transition-colors ${view === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Card view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-2.5 rounded-md transition-colors ${view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Table view"
            >
              <TableProperties className="w-5 h-5" />
            </button>
          </div>
        </div>

        {prices.loading ? (
          <div className="space-y-12">
            <div className="space-y-4">
              <Skeleton className="h-10 w-56" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(j => (
                  <Skeleton key={j} className="h-44 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Carousel Navigation */}
            <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2 sm:pb-0">
              {sections.map((section, index) => {
                const isActive = index === activeSectionIndex;
                const Icon = section.icon.type; // Extract icon component
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSectionIndex(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${isActive
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-card border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                  >
                    <span className={isActive ? "" : "opacity-70"}>{section.icon}</span>
                    <span>{categoryTitles[section.key] || section.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Section with simple fade animation key to force re-render/anim */}
            <div key={currentSection.key} className="animate-fade-in">
              <ViewComponent
                title={currentSection.title}
                subtitle={currentSection.subtitle}
                products={dataMap[currentSection.key]}
                unit={currentSection.unit}
                icon={currentSection.icon}
              />
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-4 py-8 border-t border-border/30">
          <a href="/v0" className="text-xs font-sans uppercase tracking-[0.2em] text-primary font-bold shadow-sm px-3 py-1 bg-primary/5 rounded-full border border-primary/20">V0 Global</a>
          <a href="/dashboard" className="text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">V1 Classic</a>
          <a href="/dashboard-v2" className="text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">V2 Modern</a>
          <a href="/dashboard-v3" className="text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">V3 Dark</a>
          <a href="/dashboard-v4" className="text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">V4 Premium</a>
          <a href="/dashboard-v5" className="text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">V5 Interactive</a>
          <a href="/" className="text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">V6 Cinematic</a>
        </div>

        <footer className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-sm font-sans text-muted-foreground">
            {margin > 0 && ` · $${margin} margin applied`}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
