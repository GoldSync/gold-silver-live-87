import { useState, useEffect, useCallback, useRef } from 'react';

const USD_TO_QAR = 3.64;
const REFRESH_INTERVAL = 60; // seconds

// Troy ounce in grams
const TROY_OZ_GRAMS = 31.1035;

// Karat purity multipliers
const KARAT_PURITY: Record<string, number> = {
  '24K': 1.0,
  '22K': 22 / 24,
  '21K': 21 / 24,
  '18K': 18 / 24,
};

export interface PriceData {
  goldSpotUSD: number; // per troy oz
  silverSpotUSD: number; // per troy oz
  timestamp: Date;
}

export interface ProductPrice {
  name: string;
  usd: number;
  qar: number;
  change: number; // percentage change from last fetch
}

export interface PriceState {
  spot: PriceData | null;
  previousSpot: PriceData | null;
  jewelry: ProductPrice[];
  goldBars: ProductPrice[];
  goldCoins: ProductPrice[];
  silverBars: ProductPrice[];
  loading: boolean;
  error: string | null;
  countdown: number;
  lastUpdated: Date | null;
}

function addPremium(basePrice: number, premiumPercent: number): number {
  return basePrice * (1 + premiumPercent / 100);
}

function calcProducts(goldPerOz: number, silverPerOz: number, prevGold: number | null, prevSilver: number | null) {
  const goldPerGram = goldPerOz / TROY_OZ_GRAMS;
  const silverPerGram = silverPerOz / TROY_OZ_GRAMS;
  const prevGoldPerGram = prevGold ? prevGold / TROY_OZ_GRAMS : null;
  const prevSilverPerGram = prevSilver ? prevSilver / TROY_OZ_GRAMS : null;

  const pctChange = (current: number, prev: number | null) =>
    prev ? ((current - prev) / prev) * 100 : 0;

  // Jewelry (per gram, with small retail premium)
  const jewelry: ProductPrice[] = Object.entries(KARAT_PURITY).map(([karat, purity]) => {
    const pricePerGram = addPremium(goldPerGram * purity, 3);
    const prevPrice = prevGoldPerGram ? addPremium(prevGoldPerGram * purity, 3) : null;
    return {
      name: karat,
      usd: pricePerGram,
      qar: pricePerGram * USD_TO_QAR,
      change: pctChange(pricePerGram, prevPrice),
    };
  }).sort((a, b) => b.usd - a.usd);

  // Gold Bars
  const barWeights = [
    { name: '1g', grams: 1, premium: 8 },
    { name: '5g', grams: 5, premium: 5 },
    { name: '10g', grams: 10, premium: 4 },
    { name: '1 oz', grams: TROY_OZ_GRAMS, premium: 3 },
    { name: '100g', grams: 100, premium: 2 },
    { name: '1 kg', grams: 1000, premium: 1.5 },
  ];

  const goldBars: ProductPrice[] = barWeights.map(({ name, grams, premium }) => {
    const price = addPremium(goldPerGram * grams, premium);
    const prevPrice = prevGoldPerGram ? addPremium(prevGoldPerGram * grams, premium) : null;
    return {
      name,
      usd: price,
      qar: price * USD_TO_QAR,
      change: pctChange(price, prevPrice),
    };
  });

  // Gold Coins
  const coinWeights = [
    { name: '1/4 oz', oz: 0.25, premium: 6 },
    { name: '1/2 oz', oz: 0.5, premium: 5 },
    { name: '1 oz', oz: 1, premium: 4 },
  ];

  const goldCoins: ProductPrice[] = coinWeights.map(({ name, oz, premium }) => {
    const price = addPremium(goldPerOz * oz, premium);
    const prevPrice = prevGold ? addPremium(prevGold * oz, premium) : null;
    return {
      name,
      usd: price,
      qar: price * USD_TO_QAR,
      change: pctChange(price, prevPrice),
    };
  });

  // Silver Bars
  const silverWeights = [
    { name: '1 oz', grams: TROY_OZ_GRAMS, premium: 8 },
    { name: '100g', grams: 100, premium: 5 },
    { name: '1 kg', grams: 1000, premium: 3 },
  ];

  const silverBars: ProductPrice[] = silverWeights.map(({ name, grams, premium }) => {
    const price = addPremium(silverPerGram * grams, premium);
    const prevPrice = prevSilverPerGram ? addPremium(prevSilverPerGram * grams, premium) : null;
    return {
      name,
      usd: price,
      qar: price * USD_TO_QAR,
      change: pctChange(price, prevPrice),
    };
  });

  return { jewelry, goldBars, goldCoins, silverBars };
}

// Simulated price with realistic micro-variations
function simulatePrice(base: number, volatility: number = 0.002): number {
  const change = (Math.random() - 0.5) * 2 * volatility;
  return base * (1 + change);
}

export function useGoldPrices() {
  const [state, setState] = useState<PriceState>({
    spot: null,
    previousSpot: null,
    jewelry: [],
    goldBars: [],
    goldCoins: [],
    silverBars: [],
    loading: true,
    error: null,
    countdown: REFRESH_INTERVAL,
    lastUpdated: null,
  });

  const baseGoldRef = useRef(2650); // realistic base gold price per oz
  const baseSilverRef = useRef(31.5); // realistic base silver price per oz

  const fetchPrices = useCallback(() => {
    // Simulate realistic price movements
    const goldPrice = simulatePrice(baseGoldRef.current);
    const silverPrice = simulatePrice(baseSilverRef.current, 0.003);

    // Update base slightly for drift
    baseGoldRef.current = goldPrice;
    baseSilverRef.current = silverPrice;

    const newSpot: PriceData = {
      goldSpotUSD: goldPrice,
      silverSpotUSD: silverPrice,
      timestamp: new Date(),
    };

    setState(prev => {
      const prevGold = prev.spot?.goldSpotUSD ?? null;
      const prevSilver = prev.spot?.silverSpotUSD ?? null;
      const products = calcProducts(goldPrice, silverPrice, prevGold, prevSilver);

      return {
        ...prev,
        spot: newSpot,
        previousSpot: prev.spot,
        ...products,
        loading: false,
        error: null,
        countdown: REFRESH_INTERVAL,
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Countdown & auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.countdown <= 1) {
          return prev; // will be refreshed by the fetch interval
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    const fetchTimer = setInterval(fetchPrices, REFRESH_INTERVAL * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(fetchTimer);
    };
  }, [fetchPrices]);

  return state;
}
