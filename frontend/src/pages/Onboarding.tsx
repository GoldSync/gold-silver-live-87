import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';
import { User, Mail, Lock, DollarSign, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const STEPS = ['Welcome', 'Your Info', 'Spot Margin', 'Global Margin', 'Ready'];

export default function Onboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Collected data
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [spotMargin, setSpotMargin] = useState(0);
    const [globalMargin, setGlobalMargin] = useState(0);
    const [marginType, setMarginType] = useState<'fixed' | 'percent'>('fixed');

    // Check if onboarding is already done
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/onboarding/status`);
                const data = await res.json();
                if (data.completed) {
                    navigate('/login');
                }
            } catch { /* first time, no onboarding doc */ }
            setLoading(false);
        })();
    }, [navigate]);

    const handleComplete = async () => {
        if (!adminName.trim()) return toast.error('Please enter your name');
        if (!adminEmail.trim() || !adminEmail.includes('@')) return toast.error('Please enter a valid email');

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/onboarding/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminName: adminName.trim(),
                    adminEmail: adminEmail.trim(),
                    password: adminPassword,
                    spotMargin,
                    margin: globalMargin,
                    marginType
                })
            });
            if (!res.ok) throw new Error('Failed to save');
            toast.success('Setup complete! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch {
            toast.error('Failed to complete setup');
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                {/* Progress bar */}
                <div className="flex items-center gap-1 mb-8 px-2">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className={`h-1 w-full rounded-full transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-border/60'}`} />
                            <span className={`text-[9px] uppercase tracking-widest font-semibold transition-colors ${i === step ? 'text-primary' : 'text-muted-foreground/50'}`}>{s}</span>
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-2xl">
                    {/* Step 0: Welcome */}
                    {step === 0 && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                            </div>
                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                                <strong className="text-foreground">Starting from zero</strong> — All margins and markups are set to $0 by default, showing raw market data. You can adjust them during this setup or later from the admin panel.
                            </div>
                        </div>
                    )}

                    {/* Step 1: Admin Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold text-foreground">Admin Details</h2>
                                <p className="text-sm text-muted-foreground mt-1">Tell us who's managing this dashboard</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-primary" /> Full Name
                                    </label>
                                    <Input
                                        value={adminName}
                                        onChange={e => setAdminName(e.target.value)}
                                        placeholder="e.g. Abdullah Al-Thani"
                                        className="h-11"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        value={adminEmail}
                                        onChange={e => setAdminEmail(e.target.value)}
                                        placeholder="admin@company.com"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5 text-primary" /> Create Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={adminPassword}
                                        onChange={e => setAdminPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-11"
                                    />
                                    <p className="text-[10px] text-muted-foreground">This will be your master password for the Visual Manager.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Spot Price Margin */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold text-foreground">Spot Price Margin</h2>
                                <p className="text-sm text-muted-foreground mt-1">Fixed dollar amount added to the raw gold spot price per ounce</p>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setSpotMargin(v => Math.max(0, v - 0.5))}
                                    className="w-12 h-12 rounded-xl border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-xl font-bold"
                                >−</button>
                                <div className="relative w-32">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={spotMargin}
                                        onChange={e => setSpotMargin(parseFloat(e.target.value) || 0)}
                                        className="pl-8 text-center font-bold text-2xl h-12"
                                    />
                                </div>
                                <button
                                    onClick={() => setSpotMargin(v => v + 0.5)}
                                    className="w-12 h-12 rounded-xl border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-xl font-bold"
                                >+</button>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {[0, 1, 2, 3, 5].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setSpotMargin(v)}
                                        className={`py-2 rounded-lg text-sm font-semibold transition-colors border ${spotMargin === v
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-secondary text-muted-foreground hover:text-foreground border-border/40'
                                            }`}
                                    >
                                        ${v}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-muted-foreground text-center">
                                Set to <strong>$0</strong> for raw market data. This margin affects both the displayed spot price and all product calculations.
                            </p>
                        </div>
                    )}

                    {/* Step 3: Global Display Margin */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold text-foreground">Global Display Margin</h2>
                                <p className="text-sm text-muted-foreground mt-1">Additional markup applied to all non-jewelry product display prices</p>
                            </div>

                            {/* Type selector */}
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => setMarginType('fixed')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${marginType === 'fixed'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-secondary text-muted-foreground border-border/40 hover:text-foreground'
                                        }`}
                                >
                                    Fixed ($/oz)
                                </button>
                                <button
                                    onClick={() => setMarginType('percent')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${marginType === 'percent'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-secondary text-muted-foreground border-border/40 hover:text-foreground'
                                        }`}
                                >
                                    Percent (%)
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setGlobalMargin(v => Math.max(0, v - (marginType === 'fixed' ? 1 : 0.5)))}
                                    className="w-12 h-12 rounded-xl border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-xl font-bold"
                                >−</button>
                                <div className="relative w-32">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                        {marginType === 'fixed' ? '$' : '%'}
                                    </span>
                                    <Input
                                        type="number"
                                        min="0"
                                        step={marginType === 'fixed' ? "1" : "0.5"}
                                        value={globalMargin}
                                        onChange={e => setGlobalMargin(parseFloat(e.target.value) || 0)}
                                        className="pl-8 text-center font-bold text-2xl h-12"
                                    />
                                </div>
                                <button
                                    onClick={() => setGlobalMargin(v => v + (marginType === 'fixed' ? 1 : 0.5))}
                                    className="w-12 h-12 rounded-xl border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-xl font-bold"
                                >+</button>
                            </div>

                            <p className="text-[11px] text-muted-foreground text-center">
                                Set to <strong>0</strong> for no additional markup. You can change this anytime from the admin panel.
                            </p>
                        </div>
                    )}

                    {/* Step 4: Ready */}
                    {step === 4 && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-2">You're All Set!</h2>
                                <p className="text-sm text-muted-foreground">Here's a summary of your configuration:</p>
                            </div>
                            <div className="p-4 rounded-xl bg-background border border-border/40 text-left space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Admin</span>
                                    <span className="font-semibold">{adminName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-semibold">{adminEmail}</span>
                                </div>
                                <div className="border-t border-border/30 pt-2 flex justify-between">
                                    <span className="text-muted-foreground">Spot Margin</span>
                                    <span className="font-semibold font-mono">${spotMargin.toFixed(2)}/oz</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Global Margin</span>
                                    <span className="font-semibold font-mono">
                                        {marginType === 'fixed' ? `$${globalMargin.toFixed(2)}/oz` : `${globalMargin}%`}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Default login: <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground">admin</code> / <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground">admin</code>
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/30">
                        {step > 0 ? (
                            <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-1.5">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </Button>
                        ) : <div />}

                        {step < 4 ? (
                            <Button
                                onClick={() => {
                                    if (step === 1 && (!adminName.trim() || !adminEmail.includes('@') || adminPassword.length < 4)) {
                                        return toast.error('Please fill in name, email, and a password (min 4 chars)');
                                    }
                                    setStep(s => s + 1);
                                }}
                                className="gap-1.5"
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleComplete} disabled={submitting} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                                {submitting ? 'Saving...' : 'Launch Dashboard'}
                                <Sparkles className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
