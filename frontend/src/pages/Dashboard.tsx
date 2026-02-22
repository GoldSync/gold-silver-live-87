import { useState, useMemo, useEffect } from 'react';
import { useGoldPrices, ProductPrice } from '@/hooks/useGoldPrices';
import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { PriceCard } from '@/components/PriceCard';
import { useSettings } from '@/hooks/useSettings';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { MarketClosedBanner } from '@/components/MarketClosedBanner';
import { DashboardLockOverlay } from '@/components/DashboardLockOverlay';

const TROY_OZ_GRAMS = 31.1035;

type MarginType = 'fixed' | 'percent';

const sections = [
    { key: 'jewelry' as const, title: 'Gold Jewelry' },
    { key: 'goldBars' as const, title: 'Gold Bars' },
    { key: 'goldCoins' as const, title: 'Gold Coins' },
    { key: 'silverBars' as const, title: 'Silver Bars' },
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

function LiveClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col items-center">
            <span className="text-[2rem] leading-none font-serif font-bold tabular-nums text-foreground/90 tracking-tight">{time}</span>
            <span className="text-[10px] sm:text-xs font-sans font-semibold text-muted-foreground uppercase tracking-[0.3em] mt-2 opacity-80">{date}</span>
        </div>
    );
}

const Dashboard = () => {
    const { isDark, toggle } = useTheme();
    const prices = useGoldPrices();
    const { categoryTitles, margin, marginType, isLocked, currencyRate } = useSettings();

    const [activeSection, setActiveSection] = useState(sections[0].key);

    const dataMap = useMemo(() => ({
        jewelry: prices.jewelry,
        goldBars: applyMargin(prices.goldBars, margin, marginType, currencyRate),
        goldCoins: applyMargin(prices.goldCoins, margin, marginType, currencyRate),
        silverBars: applyMargin(prices.silverBars, margin, marginType, currencyRate),
    }), [prices.jewelry, prices.goldBars, prices.goldCoins, prices.silverBars, margin, marginType, currencyRate]);

    // Optional: Auto-rotate categories every 15 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSection(prev => {
                const idx = sections.findIndex(s => s.key === prev);
                return sections[(idx + 1) % sections.length].key;
            });
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    const currentProducts = dataMap[activeSection as keyof typeof dataMap];

    // Determine Global Spot direction for the dramatic block colors
    const gTrend = prices.lastGoldTrend;
    const sTrend = prices.lastSilverTrend;
    const gStickyDiff = prices.lastGoldDiff;
    const sStickyDiff = prices.lastSilverDiff;

    // Current poll movement for highlights
    const currentGoldDiff = prices.previousSpot && prices.spot
        ? prices.spot.goldSpotUSD - (prices.previousSpot.goldSpotUSD || prices.spot.goldSpotUSD)
        : 0;
    const currentSilverDiff = prices.previousSpot && prices.spot
        ? prices.spot.silverSpotUSD - (prices.previousSpot.silverSpotUSD || prices.spot.silverSpotUSD)
        : 0;

    const getBlockStyle = (dir: number) => {
        if (dir > 0) return 'bg-success/15 border-success/30 shadow-[inset_0_0_80px_rgba(34,197,94,0.1)]'; // Green pulse
        if (dir < 0) return 'bg-destructive/15 border-destructive/30 shadow-[inset_0_0_80px_rgba(239,68,68,0.1)]'; // Red pulse
        return 'bg-gradient-to-b from-black/5 dark:from-white/5 to-transparent border-border/50 shadow-inner'; // Neutral premium
    };

    return (
        // Ultra-Premium Background: Deep, rich, layered
        <div className="h-screen w-screen overflow-hidden bg-background p-4 sm:p-6 lg:p-8 flex gap-6 relative font-sans selection:bg-primary/30">

            {/* Elegant Background Lighting */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/[0.03] blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-foreground/[0.02] blur-[150px]" />

                {/* Subtle rich noise texture (implies luxury material) */}
                <div
                    className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            {/* LEFT SIDEBAR (Controls, Logo + Spot Prices) */}
            <div className="w-[320px] xl:w-[420px] flex flex-col gap-5 shrink-0 h-full relative z-10">

                {/* UTILITY BAR (Theme) */}
                <div className="flex justify-end items-center px-4 py-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        className="rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all duration-300"
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-foreground/80" />}
                    </Button>
                </div>

                {/* LOGO BLOCK - Ultimate Luxury Glass */}
                <div className="bg-card/40 backdrop-blur-2xl rounded-[2rem] border border-white/20 dark:border-white/5 p-8 flex flex-col items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-black/5 dark:to-white/5 pointer-events-none opacity-40" />

                    <img src={logo} alt="Logo" className="h-28 xl:h-32 w-auto object-contain relative z-10 drop-shadow-2xl mb-8 transition-transform duration-700 ease-out group-hover:scale-105" />

                    <h1 className="text-xl xl:text-2xl font-serif text-center font-bold tracking-tight text-foreground relative z-10 leading-snug">
                        Swiss Precious Metals
                    </h1>
                </div>

                {prices.isWeekend && (
                    <div className="flex justify-center mt-2">
                        <MarketClosedBanner closeDate={prices.closeDate} variant="light" />
                    </div>
                )}

                {/* SPOT PRICE BLOCK - Dynamic Luxury */}
                <div className="bg-card/50 backdrop-blur-2xl rounded-[2rem] border border-white/20 dark:border-white/5 p-2 flex flex-col flex-1 shadow-2xl relative overflow-hidden">


                    <div className="mt-2 mb-6 text-center pt-2 relative z-10">
                        <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-foreground/50 font-semibold border-b border-border/50 pb-2 mx-6">Global Exchange</h2>
                    </div>

                    {prices.loading || !prices.spot ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                            <Skeleton className="h-32 w-[90%] rounded-2xl bg-foreground/5" />
                            <Skeleton className="h-32 w-[90%] rounded-2xl bg-foreground/5" />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center gap-4 px-2 relative z-10">

                            {/* Gold Spot Block - Dynamic Red/Green */}
                            <div className={`flex flex-col items-center justify-center text-center p-4 xl:p-6 rounded-[1.5rem] border backdrop-blur-md transition-all duration-700 ${getBlockStyle(currentGoldDiff)} min-h-[160px]`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-px bg-foreground/20" />
                                    <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-foreground/60 font-bold">Gold / oz</span>
                                    <div className="w-8 h-px bg-foreground/20" />
                                </div>

                                <div className="flex items-baseline gap-1 mb-4">
                                    <AnimatedNumber
                                        value={prices.spot.goldSpotUSD}
                                        prefix="$"
                                        decimals={2}
                                        className="text-3xl xl:text-4xl font-sans font-bold tabular-nums text-foreground tracking-tighter drop-shadow-md"
                                    />
                                    {gTrend !== 'flat' && (
                                        <span className={`text-xs sm:text-sm font-sans font-medium ml-1 ${gTrend === 'up' ? 'text-success' : 'text-destructive'}`}>
                                            {gTrend === 'up' ? '▲' : '▼'} {Math.abs(gStickyDiff).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-4 sm:gap-6 text-sm w-full justify-center mt-1">
                                    {prices.spot.goldBid && (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold mb-1.5">Bid</span>
                                            <AnimatedNumber value={prices.spot.goldBid} prefix="$" decimals={2} className="font-sans font-semibold text-lg tabular-nums text-foreground/90 tracking-tight" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Silver Spot Block - Dynamic Red/Green */}
                            <div className={`flex flex-col items-center justify-center text-center p-4 xl:p-6 rounded-[1.5rem] border backdrop-blur-md transition-all duration-700 ${getBlockStyle(currentSilverDiff)} min-h-[160px]`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-px bg-foreground/20" />
                                    <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-foreground/60 font-bold">Silver / oz</span>
                                    <div className="w-8 h-px bg-foreground/20" />
                                </div>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <AnimatedNumber
                                        value={prices.spot.silverSpotUSD}
                                        prefix="$"
                                        decimals={3}
                                        className="text-3xl xl:text-4xl font-sans font-bold tabular-nums text-foreground tracking-tighter drop-shadow-md"
                                    />
                                    {sTrend !== 'flat' && (
                                        <span className={`text-xs sm:text-sm font-sans font-medium ml-1 ${sTrend === 'up' ? 'text-success' : 'text-destructive'}`}>
                                            {sTrend === 'up' ? '▲' : '▼'} {Math.abs(sStickyDiff).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-4 sm:gap-6 text-sm w-full justify-center mt-1">
                                    {prices.spot.silverBid && (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold mb-1.5">Bid</span>
                                            <AnimatedNumber value={prices.spot.silverBid} prefix="$" decimals={3} className="font-sans font-semibold text-lg tabular-nums text-foreground/90 tracking-tight" />
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    <div className="mt-auto pt-6 px-4">
                        <div className="pt-6 border-t border-border/30">
                            <LiveClock />
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT MAIN AREA (Categories & Grid) */}
            <div className="flex-1 flex flex-col gap-6 h-full min-w-0 relative z-10 pb-2">

                {/* TABS (Category selectors) - Minimalist Luxury */}
                <div className="bg-card/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-white/5 p-1.5 shrink-0 flex gap-1 relative overflow-hidden">
                    {/* Highlight Pill (would require complex positioning for true sliding, using simple solid state for now, but keeping code clean) */}

                    {sections.map(section => {
                        const isActive = activeSection === section.key;
                        return (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={`flex-1 flex items-center justify-center py-4 px-3 rounded-xl text-[10px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden ${isActive
                                    ? 'text-background shadow-lg'
                                    : 'bg-transparent text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
                                    }`}
                            >
                                {isActive && (
                                    <span className="absolute inset-0 bg-foreground" />
                                )}
                                <span className={`relative z-10 ${isActive ? 'text-background' : ''}`}>
                                    {section.title}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* GRID OF ITEMS */}
                <div className="flex-1 min-h-0 relative">
                    {prices.loading ? (
                        <div className="absolute inset-0 grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} className="rounded-[2rem] h-full w-full bg-card/40 backdrop-blur-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="absolute inset-0 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 auto-rows-max gap-6 pr-2 overflow-y-auto custom-scrollbar content-start h-full">
                            {currentProducts.map(product => (
                                <PriceCard
                                    key={product.name}
                                    product={product}
                                    unit={activeSection === 'jewelry' ? 'per gram' : undefined}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Global style to customize the inner scrollbar for absolute extreme luxury */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: hsl(var(--foreground) / 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: hsl(var(--primary) / 0.3);
                }
            `}</style>

        </div>

    );
};

export default Dashboard;
