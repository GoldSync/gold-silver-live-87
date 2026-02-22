import { useState, useMemo, useEffect } from 'react';
import { useGoldPrices, ProductPrice } from '@/hooks/useGoldPrices';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { PriceCard } from '@/components/PriceCard';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/goldsync.png';
import { MarketClosedBanner } from '@/components/MarketClosedBanner';
import { DashboardLockOverlay } from '@/components/DashboardLockOverlay';

import globalCurrenciesImg from '@/assets/images/Global currencies.png';
import pamp1ozImg from '@/assets/images/pamp 1oz.png';
import pampSilverImg from '@/assets/images/pamp-silver.png';
import pampImg from '@/assets/images/pamp.png';
import valcambiImg from '@/assets/images/Valcambi.png';
import valcambi2Img from '@/assets/images/valcambi-2.png';

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

const leftSlides = [
    {
        image: pampImg,
        title: "PAMP",
        subtitle: "Suisse"
    },
    {
        image: pamp1ozImg,
        title: "Pure",
        subtitle: "Gold"
    },
    {
        image: pampSilverImg,
        title: "Fine",
        subtitle: "Silver"
    }
];

const rightSlides = [
    {
        image: valcambiImg,
        title: "Valcambi",
        subtitle: "Genève"
    },
    {
        image: globalCurrenciesImg,
        title: "Global",
        subtitle: "Assets"
    },
    {
        image: valcambi2Img,
        title: "Valcambi",
        subtitle: "Gold"

    }
];

const DashboardV4 = () => {
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
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(timer);
    }, []);

    // Slideshow state
    const [slideIndex, setSlideIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setSlideIndex(s => (s + 1) % leftSlides.length);
        }, 8000); // 8 second slide transitions
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
    // Instead of raw numbers, we use the sticky trends and diffs from useGoldPrices
    const gTrend = prices.lastGoldTrend;
    const sTrend = prices.lastSilverTrend;
    const gSpotDiff = prices.lastGoldDiff;
    const sSpotDiff = prices.lastSilverDiff;

    const getBlockStyle = (diff: number) => {
        if (diff > 0) return 'bg-success/10 border-success/40 transition-colors duration-500';
        if (diff < 0) return 'bg-destructive/10 border-destructive/40 transition-colors duration-500';
        return 'bg-transparent border-[#ab8c56]/30 transition-colors duration-500';
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
        <div className={`h-screen w-screen overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-[#f8f6f0]'} font-sans selection:bg-[#ab8c56]/30 flex relative`}>
            {isLocked && <DashboardLockOverlay />}
            <style>{`
                @keyframes parallax {
                    0% { transform: scale(1.05); }
                    100% { transform: scale(1.25); }
                }
                .slide-image {
                    animation: parallax 20s linear infinite alternate;
                }
            `}</style>

            {/* Left Image Panel Slideshow */}
            <div className="hidden xl:flex w-[18vw] h-full relative border-r border-[#ab8c56]/20 bg-black overflow-hidden items-center justify-center shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20 group">
                {leftSlides.map((slide, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${slideIndex === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#1a1815]/90 z-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-40"></div>
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity grayscale-[30%] group-hover:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 slide-image"
                            style={{ animationDelay: `-${i * 5}s` }}
                        />
                        <div className={`absolute bottom-12 left-0 w-full text-center z-30 transition-all duration-1000 ${slideIndex === i ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <h3 className="text-[#ab8c56] font-serif uppercase tracking-[0.4em] text-sm md:text-base font-bold drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">
                                {slide.title}<br />{slide.subtitle}
                            </h3>
                            <div className="w-12 h-px bg-[#ab8c56] mx-auto mt-4 opacity-50"></div>
                        </div>
                    </div>
                ))}
                <div className="absolute inset-0 border-[6px] border-[#ab8c56]/10 z-20 pointer-events-none m-4"></div>
            </div>

            {/* MAIN CONTENT (V2 REPLICA) */}
            <div className="flex-1 h-full relative flex flex-col items-center">
                {/* Reflective Molten Gold Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    {/* Shadow Layer - deep bronze to provide depth */}
                    <div className="absolute -inset-[50%] mix-blend-multiply opacity-10 dark:opacity-15 z-0">
                        <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-[#8B6B23] filter blur-[60px] sm:blur-[80px] rounded-full animate-molten-1"></div>
                        <div className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] bg-[#8B6B23] filter blur-[60px] sm:blur-[80px] rounded-full animate-molten-2"></div>
                    </div>

                    {/* Base Gold Layer - warm ochre */}
                    <div className="absolute -inset-[50%] mix-blend-screen opacity-5 dark:opacity-10 z-10">
                        <div className="absolute top-[30%] left-[30%] w-[50vw] h-[50vw] bg-[#D4AF37] filter blur-[50px] sm:blur-[70px] rounded-full animate-molten-3"></div>
                        <div className="absolute bottom-[20%] right-[20%] w-[45vw] h-[45vw] bg-[#D4AF37] filter blur-[50px] sm:blur-[70px] rounded-full animate-molten-4"></div>
                    </div>

                    {/* Highlight Layer - bright champagne streaks simulating light */}
                    <div className="absolute -inset-[50%] mix-blend-screen opacity-10 dark:opacity-15 z-20">
                        <div className="absolute top-[10%] right-[20%] w-[35vw] h-[35vw] bg-[#F9E076] filter blur-[40px] sm:blur-[60px] rounded-full animate-molten-5"></div>
                    </div>

                    {/* Grain Overlay - brushed metal texture */}
                    <div className="absolute inset-0 mix-blend-overlay opacity-[0.03] z-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                </div>

                <style>{`
                    @keyframes molten1 {
                        0%   { transform: translate(0px, 0px) scale(1) skew(0deg); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                        33%  { transform: translate(6vw, 8vh) scale(1.05) skew(2deg); border-radius: 50% 50% 60% 40% / 50% 60% 40% 50%; }
                        66%  { transform: translate(-4vw, 5vh) scale(0.95) skew(-2deg); border-radius: 30% 70% 50% 50% / 40% 40% 70% 60%; }
                        100% { transform: translate(0px, 0px) scale(1) skew(0deg); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                    }
                    @keyframes molten2 {
                        0%   { transform: translate(0px, 0px) scale(1) skew(0deg); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                        33%  { transform: translate(-8vw, 6vh) scale(1.02) skew(-2deg); border-radius: 50% 50% 40% 60% / 50% 40% 60% 50%; }
                        66%  { transform: translate(4vw, -5vh) scale(0.98) skew(2deg); border-radius: 70% 30% 50% 50% / 60% 50% 50% 40%; }
                        100% { transform: translate(0px, 0px) scale(1) skew(0deg); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    }
                    @keyframes molten3 {
                        0%   { transform: translate(0px, 0px) scale(1); border-radius: 50% 50% 60% 40% / 50% 60% 40% 50%; }
                        33%  { transform: translate(5vw, -8vh) scale(1.08); border-radius: 40% 60% 50% 50% / 60% 40% 50% 50%; }
                        66%  { transform: translate(-6vw, -4vh) scale(0.92); border-radius: 60% 40% 70% 30% / 40% 70% 30% 60%; }
                        100% { transform: translate(0px, 0px) scale(1); border-radius: 50% 50% 60% 40% / 50% 60% 40% 50%; }
                    }
                    @keyframes molten4 {
                        0%   { transform: translate(0px, 0px) scale(1); border-radius: 40% 50% 40% 60% / 50% 50% 60% 60%; }
                        33%  { transform: translate(-5vw, -6vh) scale(0.95); border-radius: 50% 40% 50% 50% / 60% 60% 40% 40%; }
                        66%  { transform: translate(8vw, -8vh) scale(1.05); border-radius: 30% 70% 60% 40% / 40% 30% 70% 60%; }
                        100% { transform: translate(0px, 0px) scale(1); border-radius: 40% 50% 40% 60% / 50% 50% 60% 60%; }
                    }
                    @keyframes molten5 {
                        0%   { transform: translate(0px, 0px) scale(1); }
                        25%  { transform: translate(-10vw, 5vh) scale(1.2); }
                        50%  { transform: translate(-25vw, 15vh) scale(0.9); }
                        75%  { transform: translate(-10vw, -5vh) scale(1.1); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }

                    .animate-molten-1 { animation: molten1 28s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
                    .animate-molten-2 { animation: molten2 32s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
                    .animate-molten-3 { animation: molten3 36s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
                    .animate-molten-4 { animation: molten4 30s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
                    .animate-molten-5 { animation: molten5 40s infinite alternate cubic-bezier(0.25, 0.1, 0.25, 1); }
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
                            alt="GoldSync"
                            className="h-20 sm:h-24 md:h-28 w-auto object-contain mb-3 drop-shadow-sm"
                        />
                        <h1 className={`text-xl sm:text-2xl font-serif tracking-wide ${theme.textMain} font-medium mb-1`}>
                            GoldSync
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
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full">

                                {/* GOLD HEADLINE */}
                                <div className={`flex flex-col items-center py-4 px-8 rounded-3xl ${getBlockStyle(currentGoldDiff)} flex-1 max-w-[360px]`}>
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
                                                {gTrend === 'up' ? '▲' : '▼'} {Math.abs(gSpotDiff).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-6 text-xs mt-1">
                                        {prices.spot.goldBid && (
                                            <div className="flex flex-col items-center">
                                                <span className={`text-[9px] uppercase tracking-widest ${theme.goldText} opacity-80 mb-0.5`}>Bid</span>
                                                <AnimatedNumber value={prices.spot.goldBid} prefix="$" decimals={2} className={`text-[14px] font-sans font-semibold tabular-nums ${theme.textMain}`} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SEPARATOR */}
                                <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-[#ab8c56]/30 to-transparent mx-2" />

                                {/* SILVER HEADLINE */}
                                <div className={`flex flex-col items-center py-4 px-8 rounded-3xl  ${getBlockStyle(currentSilverDiff)} flex-1 max-w-[360px]`}>
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
                                                {sTrend === 'up' ? '▲' : '▼'} {Math.abs(sSpotDiff).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-6 text-xs mt-1">
                                        {prices.spot.silverBid && (
                                            <div className="flex flex-col items-center">
                                                <span className={`text-[9px] uppercase tracking-widest ${theme.goldText} opacity-80 mb-0.5`}>Bid</span>
                                                <AnimatedNumber value={prices.spot.silverBid} prefix="$" decimals={3} className={`text-[14px] font-sans font-semibold tabular-nums ${theme.textMain}`} />
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
                    <div className="w-full max-w-[1000px] flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-2 pb-2">
                        {prices.loading ? (
                            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-stretch">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className={`h-40 w-[calc(50%-0.5rem)] lg:w-[calc(33%-1rem)] min-w-[200px] max-w-[300px] rounded-3xl flex-none ${theme.cardBg} border ${theme.border}`} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 items-stretch">
                                {currentProducts.map((product) => {
                                    return (
                                        <PriceCard
                                            key={product.name}
                                            product={product}
                                            className={`w-[calc(50%-0.5rem)] lg:w-[calc(33%-1rem)] min-w-[200px] max-w-[310px] flex-none h-[160px] xl:h-[180px]`}
                                        />
                                    )
                                })}
                            </div>

                        )}

                    </div>
                    <footer className="mt-2 pt-2 border-t border-border/50 text-center">
                        <p className="text-sm font-sans text-muted-foreground">
                            © GoldSync. All rights reserved.
                        </p>
                    </footer>
                </div>
            </div>

            {/* Right Image Panel Slideshow */}
            <div className="hidden xl:flex w-[18vw] h-full relative border-l border-[#ab8c56]/20 bg-black overflow-hidden items-center justify-center shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20 group">
                {rightSlides.map((slide, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${slideIndex === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#1a1815]/90 z-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-40"></div>
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity grayscale-[30%] group-hover:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 slide-image"
                            style={{ animationDelay: `-${i * 5 + 3}s` }} /* offset animation for variety */
                        />
                        <div className={`absolute bottom-12 left-0 w-full text-center z-30 transition-all duration-1000 ${slideIndex === i ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <h3 className="text-[#dfd7cc] font-serif uppercase tracking-[0.4em] text-sm md:text-base font-bold drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">
                                {slide.title}<br />{slide.subtitle}
                            </h3>
                            <div className="w-12 h-px bg-[#dfd7cc] mx-auto mt-4 opacity-50"></div>
                        </div>
                    </div>
                ))}
                <div className="absolute inset-0 border-[6px] border-[#ab8c56]/10 z-20 pointer-events-none m-4"></div>
            </div>

        </div>
    );
};

export default DashboardV4;
