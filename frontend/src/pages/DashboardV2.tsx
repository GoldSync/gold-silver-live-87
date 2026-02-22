import { useState, useMemo, useEffect } from 'react';
import { useGoldPrices, ProductPrice } from '@/hooks/useGoldPrices';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { PriceCard } from '@/components/PriceCard';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { MarketClosedBanner } from '@/components/MarketClosedBanner';
import { DashboardLockOverlay } from '@/components/DashboardLockOverlay';

const TROY_OZ_GRAMS = 31.1035;

type MarginType = 'fixed' | 'percent';

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

const DashboardV2 = () => {
    const { isDark, toggle } = useTheme();
    const prices = useGoldPrices();
    const { categoryTitles, margin, marginType, isLocked, currencyRate } = useSettings();

    const sections = [
        { key: 'jewelry' as const, title: categoryTitles.jewelry },
        { key: 'goldBars' as const, title: categoryTitles.goldBars },
        { key: 'goldCoins' as const, title: categoryTitles.goldCoins },
        { key: 'silverBars' as const, title: categoryTitles.silverBars },
    ];

    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const [activeSection, setActiveSection] = useState(sections[1].key);

    // Auto-scroll sections
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSection(current => {
                const currentIndex = sections.findIndex(s => s.key === current);
                const nextIndex = (currentIndex + 1) % sections.length;
                return sections[nextIndex].key;
            });
        }, 10000); // Rotate every 10 seconds
        return () => clearInterval(timer);
    }, []);

    const dataMap = useMemo(() => ({
        jewelry: prices.jewelry,
        goldBars: applyMargin(prices.goldBars, margin, marginType, currencyRate),
        goldCoins: applyMargin(prices.goldCoins, margin, marginType, currencyRate),
        silverBars: applyMargin(prices.silverBars, margin, marginType, currencyRate),
    }), [prices.jewelry, prices.goldBars, prices.goldCoins, prices.silverBars, margin, marginType, currencyRate]);

    const currentProducts = dataMap[activeSection as keyof typeof dataMap];

    // Determine Global Spot direction
    const gSpotDir = prices.lastGoldDiff;
    const sSpotDir = prices.lastSilverDiff;
    const gTrend = prices.lastGoldTrend;
    const sTrend = prices.lastSilverTrend;

    const getBlockStyle = (diff: number) => {
        if (diff > 0) return 'bg-success/10 border-success/20 transition-colors duration-500';
        if (diff < 0) return 'bg-destructive/10 border-destructive/20 transition-colors duration-500';
        return 'bg-transparent border-transparent transition-colors duration-500';
    };

    // Current poll movement for highlights
    const currentGoldDiff = prices.previousSpot && prices.spot
        ? prices.spot.goldSpotUSD - (prices.previousSpot.goldSpotUSD || prices.spot.goldSpotUSD)
        : 0;
    const currentSilverDiff = prices.previousSpot && prices.spot
        ? prices.spot.silverSpotUSD - (prices.previousSpot.silverSpotUSD || prices.spot.silverSpotUSD)
        : 0;

    const theme = {
        textMain: isDark ? 'text-[#e6e2db]' : 'text-[#332e29]',
        goldText: 'text-[#ab8c56]',
        cardBg: isDark ? 'bg-[#1a1815]/30' : 'bg-white/30',
        cardShadow: isDark ? 'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]' : 'shadow-[0_10px_40px_-10px_rgba(180,165,145,0.4)]',
        border: isDark ? 'border-[#ab8c56]/20' : 'border-[#dfd7cc]'
    };

    return (
        <div className={`h-screen w-screen overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-[#f8f6f0]'} font-sans selection:bg-[#ab8c56]/30 flex flex-col relative`}>
            {isLocked && <DashboardLockOverlay />}

            {/* Liquid Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] mix-blend-multiply dark:mix-blend-screen filter blur-[160px] opacity-30 animate-mist-1 ${isDark ? 'bg-[#3b3226]' : 'bg-[#e8decb]'}`}></div>
                <div className={`absolute top-[20%] -right-[20%] w-[80vw] h-[80vw] mix-blend-multiply dark:mix-blend-screen filter blur-[180px] opacity-20 animate-mist-2 ${isDark ? 'bg-[#2a241c]' : 'bg-[#dfd7cc]'}`}></div>
                <div className={`absolute -bottom-[20%] left-[20%] w-[75vw] h-[75vw] mix-blend-multiply dark:mix-blend-screen filter blur-[160px] opacity-30 animate-mist-3 ${isDark ? 'bg-[#4a3f31]' : 'bg-[#f5f1eb]'}`}></div>
            </div>

            <style>{`
                @keyframes mist1 {
                    0%   { transform: translate(0px, 0px) scale(1); }
                    33%  { transform: translate(8vw, -10vh) scale(1.1); }
                    66%  { transform: translate(-5vw, 5vh) scale(0.95); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes mist2 {
                    0%   { transform: translate(0px, 0px) scale(1); }
                    33%  { transform: translate(-10vw, 8vh) scale(1.05); }
                    66%  { transform: translate(6vw, -6vh) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes mist3 {
                    0%   { transform: translate(0px, 0px) scale(1); }
                    33%  { transform: translate(6vw, 10vh) scale(1.1); }
                    66%  { transform: translate(-8vw, -8vh) scale(0.95); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }

                .animate-mist-1 { animation: mist1 45s infinite alternate ease-in-out; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                .animate-mist-2 { animation: mist2 55s infinite alternate ease-in-out; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                .animate-mist-3 { animation: mist3 65s infinite alternate ease-in-out; border-radius: 50% 50% 60% 40% / 50% 60% 40% 50%; }
            `}</style>

            <div className="absolute top-0 right-0 p-4 z-50 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-foreground/70" />}
                </Button>
            </div>

            <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-4 xl:py-6 flex flex-col items-center relative z-10 flex-1 min-h-0 mt-2">

                {/* 1. TOP LOGO & TITLE SECTION */}
                <div className="flex flex-col items-center mb-4 shrink-0">
                    <img
                        src={logo}
                        alt="Swiss Precious Metals"
                        className="h-20 sm:h-24 md:h-28 w-auto object-contain mb-3 drop-shadow-sm"
                    />
                    <h1 className={`text-xl sm:text-2xl font-serif tracking-wide ${theme.textMain} font-medium mb-1`}>
                        Swiss Precious Metals
                    </h1>
                    <div className={`flex items-center gap-2 text-[10px] sm:text-xs xl:text-sm tracking-[0.2em] uppercase font-semibold ${theme.goldText} whitespace-nowrap`}>
                        <span className="relative flex h-2 w-2 shrink-0">
                            {prices.refreshing ? (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ab8c56] opacity-60"></span>
                            ) : null}
                        </span>
                        <span>
                            {now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} | {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} | {now.toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                    </div>
                </div>

                {prices.isWeekend && (
                    <div className="flex justify-center mb-2">
                        <MarketClosedBanner closeDate={prices.closeDate} variant="dark" />
                    </div>
                )}

                {/* 2. PRIMARY SPOT PRICES (GOLD & SILVER / USD) */}
                <div className="w-full relative flex flex-col items-center mb-4 shrink-0">
                    <div className="w-[60%] h-px bg-gradient-to-r from-transparent via-[#ab8c56]/40 to-transparent mb-4" />

                    {prices.loading || !prices.spot ? (
                        <div className="flex gap-10">
                            <Skeleton className="h-24 w-56 bg-[#dfd7cc]/30 dark:bg-white/5 rounded-3xl" />
                            <Skeleton className="h-24 w-56 bg-[#dfd7cc]/30 dark:bg-white/5 rounded-3xl hidden md:block" />
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full">

                            {/* GOLD HEADLINE */}
                            <div className={`flex flex-col items-center py-4 px-8 rounded-3xl border ${getBlockStyle(currentGoldDiff)} flex-1 max-w-[360px]`}>
                                <h2 className={`text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold ${theme.goldText} mb-2`}>
                                    Gold / Oz
                                </h2>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className={`text-2xl sm:text-3xl font-sans font-medium ${theme.textMain} opacity-80`}>$</span>
                                    <AnimatedNumber
                                        value={prices.spot.goldSpotUSD}
                                        decimals={2}
                                        className={`text-2xl sm:text-3xl font-sans font-bold tabular-nums ${theme.textMain} tracking-tighter`}
                                    />
                                    {gTrend !== 'flat' && (
                                        <span className={`text-sm sm:text-base font-sans font-medium ml-2 ${gTrend === 'up' ? 'text-success' : 'text-destructive'}`}>
                                            {gTrend === 'up' ? '▲' : '▼'} {Math.abs(gSpotDir).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-6 text-xs mt-1">
                                    {prices.spot.goldBid && (
                                        <div className="flex flex-col items-center">
                                            <span className={`text-[9px] uppercase tracking-widest ${theme.goldText} opacity-80 mb-0.5`}>Bid</span>
                                            <AnimatedNumber value={prices.spot.goldBid} prefix="$" decimals={2} className={`font-sans font-semibold tabular-nums ${theme.textMain}`} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SILVER HEADLINE */}
                            <div className={`flex flex-col items-center py-4 px-8 rounded-3xl border ${getBlockStyle(currentSilverDiff)} flex-1 max-w-[360px]`}>
                                <h2 className={`text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold ${theme.goldText} mb-2`}>
                                    Silver / Oz
                                </h2>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className={`text-2xl sm:text-3xl font-sans font-medium ${theme.textMain} opacity-80`}>$</span>
                                    <AnimatedNumber
                                        value={prices.spot.silverSpotUSD}
                                        decimals={3}
                                        className={`text-2xl sm:text-3xl font-sans font-bold tabular-nums ${theme.textMain} tracking-tighter`}
                                    />
                                    {sTrend !== 'flat' && (
                                        <span className={`text-sm sm:text-base font-sans font-medium ml-2 ${sTrend === 'up' ? 'text-success' : 'text-destructive'}`}>
                                            {sTrend === 'up' ? '▲' : '▼'} {Math.abs(sSpotDir).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-6 text-xs mt-1">
                                    {prices.spot.silverBid && (
                                        <div className="flex flex-col items-center">
                                            <span className={`text-[9px] uppercase tracking-widest ${theme.goldText} opacity-80 mb-0.5`}>Bid</span>
                                            <AnimatedNumber value={prices.spot.silverBid} prefix="$" decimals={3} className={`font-sans font-semibold tabular-nums ${theme.textMain}`} />
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    <div className="w-[60%] h-px bg-gradient-to-r from-transparent via-[#ab8c56]/30 to-transparent mt-6 mb-2" />
                </div>

                {/* 3. TABS MENU */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-4 shrink-0">
                    {sections.map(section => {
                        const isActive = activeSection === section.key;
                        return (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={`text-xs sm:text-sm font-sans uppercase tracking-widest transition-all duration-300 relative pb-1 ${isActive
                                    ? `${theme.textMain} font-bold`
                                    : `${theme.goldText} hover:${theme.textMain}`
                                    }`}
                            >
                                {section.title}
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-[#ab8c56] rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 4. PRODUCT CARDS GRID (Scrollable area) */}
                <div className="w-full max-w-[1240px] flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-2 pb-2">
                    {prices.loading ? (
                        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-stretch">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className={`h-40 w-[calc(50%-0.5rem)] lg:w-[calc(25%-1.125rem)] min-w-[200px] max-w-[300px] rounded-3xl flex-none ${theme.cardBg} border ${theme.border}`} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-stretch">
                            {currentProducts.map((product) => {
                                return (
                                    <PriceCard
                                        key={product.name}
                                        product={product}
                                        className="w-[calc(50%-0.5rem)] lg:w-[calc(25%-1.125rem)] min-w-[200px] max-w-[310px] flex-none h-[160px] xl:h-[180px]"
                                    />
                                )
                            })}
                        </div>

                    )}

                </div>
                <footer className="mt-2 pt-2 border-t border-border/50 text-center">
                    <p className="text-sm font-sans text-muted-foreground">
                        © Swiss Precious Metals. All rights reserved.
                        {margin > 0 && ` · $${margin} margin applied`}
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default DashboardV2;
