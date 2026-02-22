import { useState, useMemo, useEffect } from 'react';
import { useGoldPrices, ProductPrice } from '@/hooks/useGoldPrices';
import { useSettings } from '@/hooks/useSettings';
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

const DashboardV3 = () => {
    const prices = useGoldPrices();
    const { categoryTitles, margin, marginType, isLocked, currencyRate } = useSettings();

    const sections = [
        { key: 'jewelry' as const, title: categoryTitles.jewelry },
        { key: 'goldBars' as const, title: categoryTitles.goldBars },
        { key: 'goldCoins' as const, title: categoryTitles.goldCoins },
        { key: 'silverBars' as const, title: categoryTitles.silverBars },
    ];

    const [activeSection, setActiveSection] = useState(sections[1].key);

    const dataMap = useMemo(() => ({
        jewelry: prices.jewelry,
        goldBars: applyMargin(prices.goldBars, margin, marginType, currencyRate),
        goldCoins: applyMargin(prices.goldCoins, margin, marginType, currencyRate),
        silverBars: applyMargin(prices.silverBars, margin, marginType, currencyRate),
    }), [prices.jewelry, prices.goldBars, prices.goldCoins, prices.silverBars, margin, marginType, currencyRate]);

    const currentProducts = dataMap[activeSection as keyof typeof dataMap];

    return (
        <div className="min-h-screen bg-black text-white p-6 overflow-hidden flex flex-col font-mono relative">
            {isLocked && <DashboardLockOverlay />}
            {/* Crude Top Nav matching reference position */}
            <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black' }}>
                <div><img src={logo} alt="Logo" style={{ height: '30px' }} /></div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <a href="#">Home</a>
                    <a href="#">About</a>
                    <a href="#" style={{ fontWeight: 'bold' }}>Collections</a>
                    <a href="#">Contact</a>
                </div>
            </div>

            {/* Basic Hero area */}
            <div style={{ backgroundColor: '#eeeeee', height: '200px', textAlign: 'center', paddingTop: '80px', borderBottom: '1px solid #ccc' }}>
                <h1 style={{ margin: 0 }}>Discover the power of Gold</h1>
            </div>

            {/* Floating Spot Prices roughly matching reference overlapping hero */}
            {prices.isWeekend && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                    <MarketClosedBanner closeDate={prices.closeDate} variant="minimal" />
                </div>
            )}
            {prices.spot && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '-30px', paddingBottom: '20px' }}>
                    <div style={{ border: '2px solid black', backgroundColor: 'white', padding: '15px', width: '250px', textAlign: 'center' }}>
                        <h2>Gold Spot</h2>
                        <h3 style={{ fontSize: '2em', margin: '10px 0' }}>${prices.spot.goldSpotUSD.toFixed(2)}</h3>
                        <p style={{ background: '#ddd', padding: '5px' }}>Bid: ${prices.spot.goldBid?.toFixed(2)}</p>
                    </div>
                    <div style={{ border: '2px solid black', backgroundColor: 'white', padding: '15px', width: '250px', textAlign: 'center' }}>
                        <h2>Silver Spot</h2>
                        <h3 style={{ fontSize: '2em', margin: '10px 0' }}>${prices.spot.silverSpotUSD.toFixed(3)}</h3>
                        <p style={{ background: '#ddd', padding: '5px' }}>Bid: ${prices.spot.silverBid?.toFixed(3)}</p>
                    </div>
                </div>
            )}

            {/* Mid Section matching "Our collections" */}
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h2 style={{ fontSize: '1.5em', textDecoration: 'underline' }}>Our collections</h2>
                <p>Live Market Pricing</p>

                {/* Crude Tabs */}
                <div style={{ margin: '20px 0' }}>
                    {sections.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setActiveSection(s.key)}
                            style={{
                                padding: '10px 20px',
                                margin: '0 5px',
                                fontWeight: activeSection === s.key ? 'bold' : 'normal',
                                border: '1px solid black',
                                backgroundColor: activeSection === s.key ? '#ccc' : '#fff'
                            }}
                        >
                            {s.title}
                        </button>
                    ))}
                </div>

                {/* Grid matching 3-up reference blocks */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                    {currentProducts.map((p, i) => (
                        <div key={i} style={{ border: '1px solid #000', width: '300px', padding: '15px', textAlign: 'left', backgroundColor: '#fafafa' }}>
                            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                                {p.name} {activeSection === 'jewelry' && '(per gram)'}
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                <div>
                                    <strong style={{ fontSize: '1.2em' }}>{p.qar.toFixed(0)} QAR</strong><br />
                                    <span>${p.usd.toFixed(0)} USD</span>
                                </div>
                                <button style={{ padding: '5px 10px', border: '1px outset #555' }}>Explore</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom banner block matching "Pure Gold. Pure Guidance" */}
            <div style={{ backgroundColor: '#ffe5b4', padding: '40px', textAlign: 'center', margin: '20px 0' }}>
                <h2>Pure Gold. Pure Guidance</h2>
                <p>Integrity • Transparency • Swiss Excellence</p>
            </div>

            {/* Crude Footer matching reference */}
            <div style={{ backgroundColor: '#222', color: 'white', textAlign: 'center', padding: '30px' }}>
                <img src={logo} alt="Logo" style={{ filter: 'invert(1)', height: '40px' }} />
                <h3>Swiss Precious Metals</h3>
                <p>Social Links Area</p>
                <small>© {new Date().getFullYear()} All rights reserved. SPM.</small>
            </div>
        </div>
    );
};

export default DashboardV3;
