import { useState, useCallback, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';
import { getFingerprint } from '@/lib/fingerprint';

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
    const [forceLiveMarketPricing, setForceLiveMarketPricing] = useState<boolean>(false);
    const [lockedAdminId, setLockedAdminId] = useState<string>('');
    const [currencyRate, setCurrencyRate] = useState<number>(3.65);
    const [marketCloseUTC, setMarketCloseUTC] = useState<string>('20:58');
    const [marketOpenUTC, setMarketOpenUTC] = useState<string>('23:01');
    const [trialEnabled, setTrialEnabled] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const fingerprint = getFingerprint();
            const res = await fetch(`${API_BASE_URL}/settings`, {
                headers: {
                    'X-Fingerprint': fingerprint
                }
            });

            if (res.status === 402) {
                const errorData = await res.json();
                window.dispatchEvent(new CustomEvent('GS_TRIAL_EXPIRED', { detail: errorData }));
                return;
            }

            if (res.ok) {
                const data = await res.json();
                if (data.categoryTitles) setCategoryTitles(data.categoryTitles);
                if (data.margin !== undefined) setMargin(data.margin);
                if (data.marginType !== undefined) setMarginType(data.marginType);
                if (data.spotMargin !== undefined) setSpotMargin(data.spotMargin);
                if (data.isLocked !== undefined) setIsLocked(data.isLocked);
                if (data.forceLiveMarketPricing !== undefined) setForceLiveMarketPricing(Boolean(data.forceLiveMarketPricing));
                if (data.lockedAdminId !== undefined) setLockedAdminId(data.lockedAdminId || '');
                if (data.currencyRate !== undefined) setCurrencyRate(data.currencyRate);
                if (data.marketCloseUTC !== undefined) setMarketCloseUTC(data.marketCloseUTC);
                if (data.marketOpenUTC !== undefined) setMarketOpenUTC(data.marketOpenUTC);
                if (data.trialEnabled !== undefined) setTrialEnabled(Boolean(data.trialEnabled));
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
        forceLiveMarketPricing?: boolean,
        lockedAdminId?: string,
        currencyRate?: number,
        marketCloseUTC?: string,
        marketOpenUTC?: string,
        trialEnabled?: boolean
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

    return { 
        categoryTitles, margin, marginType, spotMargin, isLocked, 
        forceLiveMarketPricing, lockedAdminId, currencyRate, 
        marketCloseUTC, marketOpenUTC, trialEnabled, loading, 
        updateSettings, refreshSettings: fetchSettings 
    };
}
