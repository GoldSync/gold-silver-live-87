import { useState, useEffect, useCallback, useRef } from 'react';
import { useProducts, CustomProduct } from './useProducts';
import { useSettings } from './useSettings';
import { getApiBaseUrl } from '@/lib/api';
import { getFingerprint } from '@/lib/fingerprint';

// Troy ounce in grams
const TROY_OZ_GRAMS = 31.1035;

export interface PriceData {
  goldSpotUSD: number; // per troy oz
  goldBid?: number;
  goldAsk?: number;
  silverSpotUSD: number; // per troy oz
  silverBid?: number;
  silverAsk?: number;
  timestamp: Date;
}

export interface ProductPrice {
  name: string;
  usd: number;
  qar: number;
  change: number; // percentage change from last fetch
  stickyPct: number; // last non-zero percentage change
  trend: 'up' | 'down' | 'flat';
  weight: number; // weight in grams
  marginOverride?: number | null;
}

export interface PriceState {
  spot: PriceData | null;
  previousSpot: PriceData | null;
  jewelry: ProductPrice[];
  goldBars: ProductPrice[];
  goldCoins: ProductPrice[];
  silverBars: ProductPrice[];
  lastGoldTrend: 'up' | 'down' | 'flat';
  lastSilverTrend: 'up' | 'down' | 'flat';
  lastGoldDiff: number;
  lastSilverDiff: number;
  lastGoldPct: number;
  lastSilverPct: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isWeekend: boolean;
  closeDate: string | null;
}

function calcProducts(
  goldPerOz: number,
  silverPerOz: number,
  prevGold: number | null,
  prevSilver: number | null,
  goldTrend: 'up' | 'down' | 'flat' = 'flat',
  silverTrend: 'up' | 'down' | 'flat' = 'flat',
  goldStickyPct: number = 0,
  silverStickyPct: number = 0,
  customProducts: CustomProduct[] = [],
  currencyRate: number = 3.65,
  includePremium: boolean = true
) {
  const goldPerGram = goldPerOz / TROY_OZ_GRAMS;
  const silverPerGram = silverPerOz / TROY_OZ_GRAMS;
  const prevGoldPerGram = prevGold ? prevGold / TROY_OZ_GRAMS : null;
  const prevSilverPerGram = prevSilver ? prevSilver / TROY_OZ_GRAMS : null;

  const pctChange = (current: number, prev: number | null) =>
    prev ? ((current - prev) / prev) * 100 : 0;

  const jewelry: ProductPrice[] = [];
  const goldBars: ProductPrice[] = [];
  const goldCoins: ProductPrice[] = [];
  const silverBars: ProductPrice[] = [];

  customProducts.forEach((custom) => {
    let priceUSD = 0;
    let prevPriceUSD = null;

    const baseWeight = custom.weight;
    const purity = custom.purity ?? 1.0;
    const premium = includePremium ? custom.premium : 0;

    if (custom.category === 'goldBars' || custom.category === 'jewelry') {
      const grams = custom.weightUnit === 'oz' ? baseWeight * TROY_OZ_GRAMS : baseWeight;
      priceUSD = (goldPerGram * purity * grams) + premium;
      prevPriceUSD = prevGoldPerGram ? (prevGoldPerGram * purity * grams) + premium : null;
    }
    else if (custom.category === 'goldCoins') {
      const oz = custom.weightUnit === 'g' ? baseWeight / TROY_OZ_GRAMS : baseWeight;
      priceUSD = (goldPerOz * purity * oz) + premium;
      prevPriceUSD = prevGold ? (prevGold * purity * oz) + premium : null;
    }
    else if (custom.category === 'silverBars') {
      const grams = custom.weightUnit === 'oz' ? baseWeight * TROY_OZ_GRAMS : baseWeight;
      priceUSD = (silverPerGram * purity * grams) + premium;
      prevPriceUSD = prevSilverPerGram ? (prevSilverPerGram * purity * grams) + premium : null;
    }

    const calculatedCustom: ProductPrice = {
      name: custom.name,
      usd: priceUSD,
      qar: priceUSD * currencyRate,
      change: pctChange(priceUSD, prevPriceUSD),
      stickyPct: (custom.category === 'silverBars') ? silverStickyPct : goldStickyPct,
      trend: (custom.category === 'silverBars') ? silverTrend : goldTrend,
      weight: custom.weightUnit === 'oz' ? baseWeight * TROY_OZ_GRAMS : baseWeight,
      marginOverride: custom.marginOverride ?? null,
    };

    if (custom.category === 'goldBars') goldBars.push(calculatedCustom);
    if (custom.category === 'goldCoins') goldCoins.push(calculatedCustom);
    if (custom.category === 'silverBars') silverBars.push(calculatedCustom);
    if (custom.category === 'jewelry') jewelry.push(calculatedCustom);
  });

  jewelry.sort((a, b) => b.usd - a.usd);
  goldBars.sort((a, b) => b.usd - a.usd);
  goldCoins.sort((a, b) => b.usd - a.usd);
  silverBars.sort((a, b) => b.usd - a.usd);

  return { jewelry, goldBars, goldCoins, silverBars };
}

export function useGoldPrices(options?: { manualOnly?: boolean }) {
  const [state, setState] = useState<PriceState>({
    spot: null,
    previousSpot: null,
    jewelry: [],
    goldBars: [],
    goldCoins: [],
    silverBars: [],
    lastGoldTrend: 'flat',
    lastSilverTrend: 'flat',
    lastGoldDiff: 0,
    lastSilverDiff: 0,
    lastGoldPct: 0,
    lastSilverPct: 0,
    loading: true,
    refreshing: false,
    error: null,
    lastUpdated: null,
    isWeekend: false,
    closeDate: null,
  });

  const { products: customProducts } = useProducts();
  const { spotMargin, currencyRate, forceLiveMarketPricing } = useSettings();
  const customProductsRef = useRef(customProducts);

  useEffect(() => {
    customProductsRef.current = customProducts;
  }, [customProducts]);

  const fetchPrices = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setState(prev => ({ ...prev, refreshing: true, error: null }));
    } else {
      setState(prev => {
        if (!prev.spot) return { ...prev, loading: true, error: null };
        return { ...prev, error: null };
      });
    }

    try {
      // Force Proxy Scraper Mode (Strip any direct API logic)
      const proxyUrl = `${getApiBaseUrl()}/prices?t=${Date.now()}`;
      const fingerprint = getFingerprint();

      const res = await fetch(proxyUrl, {
        headers: {
          'X-Fingerprint': fingerprint
        }
      });

      if (res.status === 402) {
        const errorData = await res.json();
        // Trigger global event for Trial Expiration
        window.dispatchEvent(new CustomEvent('GS_TRIAL_EXPIRED', { detail: errorData }));
        throw new Error("Trial expired");
      }

      if (!res.ok) throw new Error("Failed to fetch from proxy");
      const data = await res.json();

      if (!data.price) throw new Error("Invalid data from proxy");

      const rawGoldPrice = data.price;
      const silverPrice = data.silver_price || 0;
      const goldBid = data.bid;
      const goldAsk = data.ask;
      const silverBid = data.silver_bid;
      const silverAsk = data.silver_ask;
      const _isWeekend = data.isWeekend || false;
      const _closeDate = data.closeDate || null;

      const FIXED_SPOT_MARGIN = forceLiveMarketPricing ? 0 : spotMargin;
      const displayGoldPrice = rawGoldPrice + FIXED_SPOT_MARGIN;

      const newSpot: PriceData = {
        goldSpotUSD: displayGoldPrice,
        goldBid,
        goldAsk,
        silverSpotUSD: silverPrice,
        silverBid,
        silverAsk,
        timestamp: new Date(),
      };

      setState(prev => {
        const prevGold = prev.spot?.goldSpotUSD ?? null;
        const prevSilver = prev.spot?.silverSpotUSD ?? null;

        let newGoldTrend = prev.lastGoldTrend;
        let newGoldDiff = prev.lastGoldDiff;
        let newGoldPct = prev.lastGoldPct;
        if (prevGold !== null && displayGoldPrice !== prevGold) {
          newGoldTrend = displayGoldPrice > prevGold ? 'up' : 'down';
          newGoldDiff = displayGoldPrice - prevGold;
          newGoldPct = ((displayGoldPrice - prevGold) / prevGold) * 100;
        }

        let newSilverTrend = prev.lastSilverTrend;
        let newSilverDiff = prev.lastSilverDiff;
        let newSilverPct = prev.lastSilverPct;
        if (prevSilver !== null && silverPrice !== prevSilver) {
          newSilverTrend = silverPrice > prevSilver ? 'up' : 'down';
          newSilverDiff = silverPrice - prevSilver;
          newSilverPct = ((silverPrice - prevSilver) / prevSilver) * 100;
        }

        const products = calcProducts(
          displayGoldPrice,
          silverPrice,
          prevGold,
          prevSilver,
          newGoldTrend,
          newSilverTrend,
          newGoldPct,
          newSilverPct,
          customProductsRef.current,
          currencyRate,
          !forceLiveMarketPricing
        );

        return {
          ...prev,
          spot: newSpot,
          previousSpot: prev.spot,
          lastGoldTrend: newGoldTrend,
          lastSilverTrend: newSilverTrend,
          lastGoldDiff: newGoldDiff,
          lastSilverDiff: newSilverDiff,
          lastGoldPct: newGoldPct,
          lastSilverPct: newSilverPct,
          ...products,
          loading: false,
          refreshing: false,
          error: null,
          lastUpdated: new Date(),
          isWeekend: _isWeekend,
          closeDate: _closeDate,
        };
      });
    } catch (err) {
      console.error("Error fetching prices:", err);
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: "Failed to load prices"
      }));
    }
  }, [spotMargin, currencyRate, forceLiveMarketPricing]);

  useEffect(() => {
    fetchPrices();

    if (options?.manualOnly) {
      return;
    }

    const mode = import.meta.env.VITE_REFRESH_MODE || 'AUTO';
    const intervalMs = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '2000', 10);

    if (mode === 'AUTO' && intervalMs > 0) {
      const intervalId = setInterval(() => {
        fetchPrices();
      }, intervalMs);
      return () => clearInterval(intervalId);
    }
  }, [fetchPrices, options?.manualOnly]);

  return {
    ...state,
    refresh: () => fetchPrices(true)
  };
}
