import { Clock } from 'lucide-react';

interface MarketClosedBannerProps {
    closeDate?: string | null;
    /** 'dark' for dark-bg dashboards (V2, V4, V6), 'light' for light-bg ones */
    variant?: 'light' | 'dark' | 'cinematic' | 'minimal';
}

export function MarketClosedBanner({ closeDate, variant = 'light' }: MarketClosedBannerProps) {
    const styles = {
        light: 'bg-amber-50 border-amber-200 text-amber-800',
        dark: 'bg-amber-900/20 border-amber-500/30 text-amber-200',
        cinematic: 'bg-black/40 backdrop-blur-xl border-[#ab8c56]/40 text-[#e6e2db]',
        minimal: 'bg-[#ffe5b4] border-[#ccc] text-[#333]',
    };

    return (
        <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] ${styles[variant]} animate-pulse-slow`}>
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span>Market Closed</span>
            {closeDate && (
                <span className="opacity-60 normal-case tracking-normal font-normal text-[10px] sm:text-xs">
                    · {closeDate}
                </span>
            )}
        </div>
    );
}
