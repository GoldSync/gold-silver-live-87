import { useState, useCallback, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';

export interface CategoryTitles {
    goldBars: string;
    goldCoins: string;
    silverBars: string;
    jewelry: string;
}


export const EVENT_SETTINGS_CHANGED = 'EVENT_SETTINGS_CHANGED';

export function useSettings() {
    const { token } = useAdminAuth();
    const [categoryTitles, setCategoryTitles] = useState<CategoryTitles>({
        goldBars: 'Gold Bars',
        goldCoins: 'Gold Coins',
        silverBars: 'Silver Bars',
        jewelry: 'Jewelry'
    });
    const [margin, setMargin] = useState<number>(0);
    const [marginType, setMarginType] = useState<'fixed' | 'percent'>('fixed');
    const [spotMargin, setSpotMargin] = useState<number>(2);
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [currencyRate, setCurrencyRate] = useState<number>(3.65);
    const [marketCloseUTC, setMarketCloseUTC] = useState<string>('20:58');
    const [marketOpenUTC, setMarketOpenUTC] = useState<string>('23:01');
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await fetch(`${API_BASE_URL}/settings`);
            if (res.ok) {
                const data = await res.json();
                if (data.categoryTitles) setCategoryTitles(data.categoryTitles);
                if (data.margin !== undefined) setMargin(data.margin);
                if (data.marginType !== undefined) setMarginType(data.marginType);
                if (data.spotMargin !== undefined) setSpotMargin(data.spotMargin);
                if (data.isLocked !== undefined) setIsLocked(data.isLocked);
                if (data.currencyRate !== undefined) setCurrencyRate(data.currencyRate);
                if (data.marketCloseUTC !== undefined) setMarketCloseUTC(data.marketCloseUTC);
                if (data.marketOpenUTC !== undefined) setMarketOpenUTC(data.marketOpenUTC);
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();

        const handleGlobalChange = () => fetchSettings(true);
        window.addEventListener(EVENT_SETTINGS_CHANGED, handleGlobalChange);

        const mode = import.meta.env.VITE_REFRESH_MODE || 'MANUAL';
        const intervalMs = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '2000', 10);

        if (mode === 'AUTO' && intervalMs > 0) {
            const intervalId = setInterval(() => {
                fetchSettings(true);
            }, intervalMs);
            return () => {
                clearInterval(intervalId);
                window.removeEventListener(EVENT_SETTINGS_CHANGED, handleGlobalChange);
            };
        }

        return () => window.removeEventListener(EVENT_SETTINGS_CHANGED, handleGlobalChange);
    }, [fetchSettings]);

    const updateSettings = async (updates: {
        categoryTitles?: Partial<CategoryTitles>,
        margin?: number,
        marginType?: 'fixed' | 'percent',
        spotMargin?: number,
        isLocked?: boolean,
        currencyRate?: number,
        marketCloseUTC?: string,
        marketOpenUTC?: string
    }) => {
        try {
            const res = await fetch(`${API_BASE_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update settings');
            await fetchSettings(true); // silent fetch on update
            window.dispatchEvent(new Event(EVENT_SETTINGS_CHANGED));
            toast.success('Settings updated');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Failed to update settings');
            return false;
        }
    };

    return { categoryTitles, margin, marginType, spotMargin, isLocked, currencyRate, marketCloseUTC, marketOpenUTC, loading, updateSettings };
}
