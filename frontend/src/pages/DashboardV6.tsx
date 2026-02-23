import { useState, useMemo, useEffect } from 'react';
import { useGoldPrices, ProductPrice } from '@/hooks/useGoldPrices';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { PriceCard } from '@/components/PriceCard';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/goldsync_logo.png';
import { MarketClosedBanner } from '@/components/MarketClosedBanner';
import { DashboardLockOverlay } from '@/components/DashboardLockOverlay';
import { TrialExpiredModal } from '@/components/TrialExpiredModal';

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

const backgroundSlides = [
    { image: pampImg, title: "PAMP Suisse", subtitle: "Premium Gold Excellence" },
    { image: valcambiImg, title: "Valcambi Genève", subtitle: "Swiss Precision Refined" },
    { image: pamp1ozImg, title: "999.9 Fine Gold", subtitle: "Investment Grade Bullion" },
    { image: pampSilverImg, title: "PAMP Silver", subtitle: "Pure Luster & Value" },
    { image: valcambi2Img, title: "Valcambi Cast", subtitle: "Purest Gold Standards" },
    { image: globalCurrenciesImg, title: "Global Assets", subtitle: "Secure Your Future" }
];

const DashboardV6 = () => {
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
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    // Slideshow state
    const [slideIndex, setSlideIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setSlideIndex(s => (s + 1) % backgroundSlides.length);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    // Trial Expiration Logic
    const [trialExpired, setTrialExpired] = useState<{ type: 'INITIAL' | 'EXTENDED' } | null>(null);

    useEffect(() => {
        const handleTrialExpired = (e: any) => {
            const detail = e.detail;
            const type = detail.code === 'TRIAL_EXPIRED_EXTENDED' ? 'EXTENDED' : 'INITIAL';
            setTrialExpired({ type });
        };

        window.addEventListener('GS_TRIAL_EXPIRED', handleTrialExpired);
        return () => window.removeEventListener('GS_TRIAL_EXPIRED', handleTrialExpired);
    }, []);

    const dataMap = useMemo(() => ({
        jewelry: prices.jewelry,
        goldBars: applyMargin(prices.goldBars, margin, marginType, currencyRate),
        goldCoins: applyMargin(prices.goldCoins, margin, marginType, currencyRate),
        silverBars: applyMargin(prices.silverBars, margin, marginType, currencyRate),
    }), [prices.jewelry, prices.goldBars, prices.goldCoins, prices.silverBars, margin, marginType, currencyRate]);

    const currentProducts = dataMap[activeSection as keyof typeof dataMap];

    const gTrend = prices.lastGoldTrend;
    const sTrend = prices.lastSilverTrend;
    const gSpotDiff = prices.lastGoldDiff;
    const sSpotDiff = prices.lastSilverDiff;

    const getBlockStyle = (diff: number) => {
        if (diff > 0) return 'bg-success/15 border-success/30 backdrop-blur-2xl shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-colors duration-500';
        if (diff < 0) return 'bg-destructive/15 border-destructive/30 backdrop-blur-2xl shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-colors duration-500';
        return 'bg-white/[0.05] border-white/10 backdrop-blur-3xl shadow-2xl transition-colors duration-500';
    };

    const currentGoldDiff = prices.previousSpot && prices.spot
        ? prices.spot.goldSpotUSD - (prices.previousSpot.goldSpotUSD || prices.spot.goldSpotUSD)
        : 0;
    const currentSilverDiff = prices.previousSpot && prices.spot
        ? prices.spot.silverSpotUSD - (prices.previousSpot.silverSpotUSD || prices.spot.silverSpotUSD)
        : 0;

    const theme = {
        textMain: 'text-[#e6e2db]',
        goldText: 'text-[#ab8c56]',
        cardBg: 'bg-black/60 backdrop-blur-md',
        cardShadow: 'shadow-[0_10px_40px_-5px_rgba(0,0,0,0.8)]',
        border: 'border-[#ab8c56]/30'
    };

    return (
        <div className={`min-h-screen transition-colors duration-1000 ${isDark ? 'dark bg-[#0a0f1a] text-blue-50' : 'bg-blue-50/30 text-slate-900'} relative overflow-hidden`}>
            {isLocked && <DashboardLockOverlay />}
            {trialExpired && <TrialExpiredModal type={trialExpired.type} />}
            {/* Background elements */}
            <style>{`
                @keyframes parallax {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .slide-image {
                    animation: parallax 30s linear infinite alternate;
                }
            `}</style>

            {/* FULLSCREEN BACKGROUND SLIDESHOW */}
            <div className="absolute inset-0 z-0">
                {/* Top Gradient for Header Visibility */}
                <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-black via-black/40 to-transparent z-20 pointer-events-none"></div>

                {backgroundSlides.map((slide, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-[4000ms] ease-in-out ${slideIndex === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <div className="absolute inset-0 bg-black/50 z-10"></div>
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-60 slide-image"
                        />
                    </div>
                ))}
            </div>

            {/* MAIN CONTENT LAYER */}
            <div className="absolute inset-0 z-10 overflow-hidden flex flex-col items-center">

                {/* UNIFIED HEADER BLOCK (Single row on mobile, split on desktop) */}
                <div className="absolute top-4 left-4 right-4 sm:top-0 sm:left-0 sm:right-0 sm:contents z-50">
                    <div className="flex flex-row sm:flex-col justify-between items-center sm:items-start sm:absolute sm:top-6 sm:left-6 bg-black/20 backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border border-white/10 drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full sm:w-auto">
                        <div className="flex flex-col">
                            <div className="text-xl sm:text-2xl font-sans font-bold text-white uppercase tracking-[0.1em] sm:tracking-[0.3em] tabular-nums">
                                {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </div>
                            <div className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-[#ab8c56] font-bold">
                                Local Time
                            </div>
                        </div>

                        {/* Date part - Only visible in the shared row on mobile */}
                        <div className="flex flex-col items-end sm:hidden">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-white font-bold leading-tight">
                                {now.toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                            <div className="text-[8px] uppercase tracking-[0.1em] text-[#ab8c56] font-bold">
                                {now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Date Block (Hidden on mobile) */}
                    <div className="hidden sm:flex absolute top-6 right-6 flex-col items-end gap-1 bg-black/20 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                        <div className="text-sm uppercase tracking-[0.4em] text-white font-bold">
                            {now.toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                        <div className="text-xs uppercase tracking-[0.2em] text-[#ab8c56] font-bold">
                            {now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                <div className="absolute top-[85px] right-2 sm:top-[120px] sm:right-6 p-4 z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        className="rounded-full bg-black/20 backdrop-blur-md border border-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all shadow-lg"
                    >
                        {isDark ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-white/70" />}
                    </Button>
                </div>

                {/* CONTENT CONTAINER */}
                <div className="w-full h-full flex flex-col items-center overflow-y-auto sm:overflow-hidden">
                    <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col items-center h-full relative">

                        {/* 1. TOP LOGO SECTION */}
                        <div className="flex flex-col items-center mb-4 sm:mb-6 shrink-0 pt-32 sm:pt-4">
                            <img
                                src={logo}
                                alt="GoldSync"
                                className="h-20 sm:h-36 w-auto object-contain mb-4 sm:mb-6 drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]"
                            />
                            <h1 className="text-3xl sm:text-4xl font-serif tracking-widest text-white font-medium mb-4 uppercase drop-shadow-lg">
                                GoldSync
                            </h1>
                            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#ab8c56] to-transparent opacity-50 mb-4" />
                        </div>

                        {prices.isWeekend && (
                            <div className="flex justify-center mb-4">
                                <MarketClosedBanner closeDate={prices.closeDate} variant="cinematic" />
                            </div>
                        )}

                        {/* 2. SPOT PRICES - GLASS BOX */}
                        <div className="w-full max-w-[1100px] bg-black/40 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] border border-[#ab8c56]/30 p-4 sm:p-8 mb-6 sm:mb-8 shadow-2xl">
                            <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 sm:gap-8 md:gap-16">

                                {/* GOLD UNIT */}
                                <div className={`flex flex-col items-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl ${getBlockStyle(currentGoldDiff)} flex-1 transition-all duration-700`}>
                                    <h2 className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.4em] font-bold ${theme.goldText} mb-2 sm:mb-3`}>
                                        Gold Spot (USD/OZ)
                                    </h2>
                                    {prices.loading || !prices.spot ? <Skeleton className="h-10 sm:h-12 w-32 sm:w-48 bg-white/5" /> : (
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-baseline gap-1 sm:gap-2">
                                                <span className="text-2xl sm:text-5xl font-sans font-bold text-white tracking-tighter">$</span>
                                                <AnimatedNumber
                                                    value={prices.spot.goldSpotUSD}
                                                    decimals={2}
                                                    className="text-2xl sm:text-5xl font-sans font-bold tabular-nums text-white tracking-tighter"
                                                />
                                            </div>
                                            {gTrend !== 'flat' && (
                                                <div className={`mt-1 sm:mt-2 flex items-center gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/40 border border-white/10`}>
                                                    <span className={`text-sm sm:text-lg font-bold ${gTrend === 'up' ? 'text-success' : 'text-destructive'}`}>
                                                        {gTrend === 'up' ? '▲' : '▼'} {Math.abs(gSpotDiff).toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] sm:text-xs text-white/50 tracking-widest font-bold">
                                                        {Math.abs(prices.lastGoldPct).toFixed(2)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* SILVER UNIT */}
                                <div className={`flex flex-col items-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl ${getBlockStyle(currentSilverDiff)} flex-1 transition-all duration-700`}>
                                    <h2 className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.4em] font-bold ${theme.goldText} mb-2 sm:mb-3`}>
                                        Silver Spot (USD/OZ)
                                    </h2>
                                    {prices.loading || !prices.spot ? <Skeleton className="h-10 sm:h-12 w-32 sm:w-48 bg-white/5" /> : (
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-baseline gap-1 sm:gap-2">
                                                <span className="text-2xl sm:text-5xl font-sans font-bold text-white tracking-tighter">$</span>
                                                <AnimatedNumber
                                                    value={prices.spot.silverSpotUSD}
                                                    decimals={3}
                                                    className="text-2xl sm:text-5xl font-sans font-bold tabular-nums text-white tracking-tighter"
                                                />
                                            </div>
                                            {sTrend !== 'flat' && (
                                                <div className={`mt-1 sm:mt-2 flex items-center gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/40 border border-white/10`}>
                                                    <span className={`text-sm sm:text-lg font-bold ${sTrend === 'up' ? 'text-success' : 'text-destructive'}`}>
                                                        {sTrend === 'up' ? '▲' : '▼'} {Math.abs(sSpotDiff).toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] sm:text-xs text-white/50 tracking-widest font-bold">
                                                        {Math.abs(prices.lastSilverPct).toFixed(2)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. TABS MENU */}
                        <div className="w-full flex justify-center mb-8 shrink-0 px-4">
                            <div className="flex flex-row overflow-x-auto no-scrollbar gap-4 sm:gap-12 bg-black/20 backdrop-blur-md px-6 sm:px-10 py-3 rounded-full border border-white/5 max-w-full">
                                {sections.map(section => {
                                    const isActive = activeSection === section.key;
                                    return (
                                        <button
                                            key={section.key}
                                            onClick={() => setActiveSection(section.key)}
                                            className={`text-[10px] sm:text-sm font-sans uppercase tracking-[0.2em] sm:tracking-[0.25em] transition-all duration-500 relative pb-1 whitespace-nowrap ${isActive
                                                ? `text-white font-bold`
                                                : `${theme.goldText} hover:text-white`
                                                }`}
                                        >
                                            {section.title}
                                            {isActive && (
                                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ab8c56] rounded-full shadow-[0_0_10px_#ab8c56]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. PRODUCT GRID */}
                        <div className="w-full max-w-[1200px] flex-1 min-h-0 overflow-y-auto custom-scrollbar px-2 pb-10">
                            {prices.loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <Skeleton key={i} className="h-44 w-full rounded-2xl bg-black/40 border border-white/5" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {currentProducts.map((product) => (
                                        <PriceCard
                                            key={product.name}
                                            product={product}
                                            className="w-full bg-white/[0.03] backdrop-blur-2xl border-white/[0.08] hover:border-[#ab8c56]/40 transition-all duration-500 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.4)] h-[170px]"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>


                    </div>
                </div>

                {/* SIDE SLIDE INFO OVERLAY */}
                <div className="absolute bottom-10 left-10 z-20 pointer-events-none hidden md:block">
                    <div className="bg-black/40 backdrop-blur-xl border-l-4 border-primary p-6 rounded-tr-3xl">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-primary/80 mb-1 font-bold">Featured Asset</p>
                        <h4 className="text-xl font-serif text-white uppercase tracking-wider">{backgroundSlides[slideIndex].title}</h4>
                        <p className="text-xs text-[#ab8c56] tracking-[0.2em] uppercase mt-1 opacity-70">{backgroundSlides[slideIndex].subtitle}</p>
                    </div>
                </div>
                {/* FOOTER */}
                <div className="w-full shrink-0 flex flex-col items-center pb-6">
                    <div className="w-24 h-px bg-[#ab8c56]/30 mb-4" />
                    <p className="text-[10px] uppercase tracking-[0.5em] text-white/60 text-center">
                        © GoldSync · Security & Precision · {now.getFullYear()}
                    </p>
                </div>
            </div>


        </div>
    );
};

export default DashboardV6;
