import { useState, useMemo, useEffect } from 'react';
import { Gem, Box, Coins, CircleDot, LayoutGrid, TableProperties, Settings2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { PriceSection } from '@/components/PriceSection';
import { PriceTable } from '@/components/PriceTable';
import { useGoldPrices, ProductPrice } from '@/hooks/useGoldPrices';
import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MarketClosedBanner } from '@/components/MarketClosedBanner';
import { DashboardLockOverlay } from '@/components/DashboardLockOverlay';
import { useSettings } from '@/hooks/useSettings';

const TROY_OZ_GRAMS = 31.1035;

type MarginType = 'fixed' | 'percent';

const sections = [
    { key: 'jewelry' as const, title: 'Gold Jewelry', subtitle: 'Price per gram by karat', unit: 'per gram', icon: <Gem className="w-5 h-5" /> },
    { key: 'goldBars' as const, title: 'Gold Bars', subtitle: 'Investment grade bullion', unit: undefined, icon: <Box className="w-5 h-5" /> },
    { key: 'goldCoins' as const, title: 'Gold Coins', subtitle: 'Popular bullion coins', unit: undefined, icon: <Coins className="w-5 h-5" /> },
    { key: 'silverBars' as const, title: 'Silver Bars', subtitle: 'Silver bullion products', unit: undefined, icon: <CircleDot className="w-5 h-5" /> },
];

function applyMargin(products: ProductPrice[], margin: number, type: MarginType, currencyRate: number): ProductPrice[] {
    if (margin === 0) return products;
    return products.map(p => {
        let marginAmount = 0;
        if (type === 'fixed') {
            const weightInOz = p.weight / TROY_OZ_GRAMS;
            marginAmount = margin * weightInOz;
        } else {
            marginAmount = p.usd * (margin / 100);
        }
        return {
            ...p,
            usd: p.usd + marginAmount,
            qar: (p.usd + marginAmount) * currencyRate,
        };
    });
}

const PASSCODE = "1234";

function MarginSettingsContent({
    localMargin,
    setLocalMargin,
}: {
    localMargin: number;
    setLocalMargin: React.Dispatch<React.SetStateAction<number>>;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState(false);

    const handlePasscodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === PASSCODE) {
            setIsAuthenticated(true);
            setError(false);
            setPasscode("");
        } else {
            setError(true);
            setPasscode("");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium text-sm mb-1">Local Margin Settings</h4>
                    <p className="text-xs text-muted-foreground">
                        Enter passcode to unlock margin calculator.
                    </p>
                </div>
                <form onSubmit={handlePasscodeSubmit} className="space-y-2">
                    <Label htmlFor="passcode">Passcode</Label>
                    <Input
                        id="passcode"
                        type="password"
                        value={passcode}
                        onChange={(e) => {
                            setPasscode(e.target.value);
                            setError(false);
                        }}
                        placeholder="••••"
                        maxLength={4}
                        className={error ? "border-red-500" : ""}
                        // Use numeric keyboard on mobile
                        inputMode="numeric"
                    />
                    {error && <p className="text-xs text-red-500">Incorrect passcode</p>}
                    <Button type="submit" className="w-full">Unlock</Button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-medium text-sm mb-1">Percentage Margin</h4>
                <p className="text-xs text-muted-foreground">
                    Adjust display prices instantly. Changes are saved locally.
                </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                    <Label htmlFor="margin-amount">Markup Percentage (%)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                            %
                        </span>
                        <Input
                            id="margin-amount"
                            type="number"
                            step="0.1"
                            min="0"
                            value={localMargin}
                            onChange={(e) => setLocalMargin(Number(e.target.value) || 0)}
                            className="pl-7"
                        />
                    </div>
                </div>

                <Button variant="outline" className="w-full text-xs" onClick={() => setIsAuthenticated(false)}>
                    Lock Settings
                </Button>
            </div>
        </div>
    );
}

const DashboardV5 = () => {
    const { isDark, toggle } = useTheme();
    // Default realtime auto-refresh
    const prices = useGoldPrices();
    const [view, setView] = useState<'cards' | 'table'>('cards');
    const { categoryTitles, margin: globalMargin, marginType: globalType, isLocked, currencyRate } = useSettings();
    // Local margin state (Percentage only)
    const [localMargin, setLocalMargin] = useState(0);

    // Carousel state
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);

    // Auto-rotate carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSectionIndex((prev) => (prev + 1) % sections.length);
        }, 5000); // 5 seconds
        return () => clearInterval(timer);
    }, []);

    // Determine the effective margin and type to apply
    // For now, localMargin (percentage) overrides or is the primary margin for these sections
    const totalMargin = localMargin;
    const totalType: MarginType = 'percent';

    const dataMap = useMemo(() => ({
        jewelry: prices.jewelry,
        goldBars: applyMargin(prices.goldBars, totalMargin, totalType, currencyRate),
        goldCoins: applyMargin(prices.goldCoins, totalMargin, totalType, currencyRate),
        silverBars: applyMargin(prices.silverBars, totalMargin, totalType, currencyRate),
    }), [prices.jewelry, prices.goldBars, prices.goldCoins, prices.silverBars, totalMargin, totalType, currencyRate]);

    const ViewComponent = view === 'cards' ? PriceSection : PriceTable;
    const currentSection = sections[activeSectionIndex];

    return (
        <div className="min-h-screen bg-background transition-colors duration-500">
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
                {/* Controls Layer */}
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

                    {/* Local Margin Calculator */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="w-[42px] h-[42px] border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-card" aria-label="Settings">
                                <Settings2 className="w-5 h-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <MarginSettingsContent
                                localMargin={localMargin}
                                setLocalMargin={setLocalMargin}
                            />
                        </PopoverContent>
                    </Popover>
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
                                const Icon = section.icon.type;
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
                                        <span>{section.title}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Section with simple fade animation */}
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

                <footer className="mt-16 pt-8 border-t border-border/50 text-center">
                    <p className="text-sm font-sans text-muted-foreground">
                        Swiss Precious Metals. All rights reserved.
                        {localMargin > 0 && ` · Custom ${localMargin}% margin applied locally`}
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default DashboardV5;
