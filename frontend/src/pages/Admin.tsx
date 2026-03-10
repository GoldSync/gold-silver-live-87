import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useProducts } from '@/hooks/useProducts';
import { useGoldPrices } from '@/hooks/useGoldPrices';
import { useSettings } from '@/hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
    Trash2, Plus, LogOut,
    Pencil,
    Package,
    User,
    ChevronRight,
    Settings2,
    Lock,
    Unlock,
    Globe,
    Clock,
    Bell,
    Check,
    Settings as SettingsIcon,
    DollarSign,
    ShieldAlert,
    RefreshCw
} from 'lucide-react';
import { PriceCard } from '@/components/PriceCard';
import { MarginSettings } from '@/components/MarginSettings';

function SpotMarginControl({ spotMargin, currentGoldSpot, updateSettings }: { spotMargin: number, currentGoldSpot: number | null, updateSettings: (u: any) => Promise<boolean> }) {
    const [value, setValue] = useState(spotMargin.toString());
    const [saving, setSaving] = useState(false);

    useEffect(() => { setValue(spotMargin.toString()); }, [spotMargin]);

    const numValue = parseFloat(value) || 0;
    const rawPrice = currentGoldSpot ? currentGoldSpot - spotMargin : null;
    const previewPrice = rawPrice !== null ? rawPrice + numValue : null;
    const hasChanged = numValue !== spotMargin;

    const handleSave = async () => {
        if (isNaN(numValue) || numValue < 0) return;
        setSaving(true);
        await updateSettings({ spotMargin: numValue });
        setSaving(false);
    };

    return (
        <div className="space-y-4">
            {/* Controls Row */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <button
                        onClick={() => setValue(v => Math.max(0, parseFloat(v || '0') - 0.5).toString())}
                        className="w-9 h-9 shrink-0 rounded-lg border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-lg font-bold"
                    >−</button>
                    <div className="relative flex-1 max-w-[140px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                        <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="pl-7 text-center font-bold text-lg h-9"
                        />
                    </div>
                    <button
                        onClick={() => setValue(v => (parseFloat(v || '0') + 0.5).toString())}
                        className="w-9 h-9 shrink-0 rounded-lg border border-border/60 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-lg font-bold"
                    >+</button>
                </div>
                <Button onClick={handleSave} disabled={saving || !hasChanged} size="sm" className="font-bold uppercase tracking-wider px-6">
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </div>

            {/* Live Price Preview */}
            {previewPrice !== null && rawPrice !== null && (
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-card border border-border/40">
                    <div className="flex-1 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Raw Market</div>
                        <div className="text-lg font-bold tabular-nums text-muted-foreground">${rawPrice.toFixed(2)}</div>
                    </div>
                    <div className="text-muted-foreground/50 text-lg">+</div>
                    <div className="flex-1 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Margin</div>
                        <div className={`text-lg font-bold tabular-nums ${hasChanged ? 'text-primary' : 'text-muted-foreground'}`}>${numValue.toFixed(2)}</div>
                    </div>
                    <div className="text-muted-foreground/50 text-lg">=</div>
                    <div className="flex-1 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Display Price</div>
                        <div className={`text-xl font-bold tabular-nums ${hasChanged ? 'text-primary' : 'text-foreground'}`}>${previewPrice.toFixed(2)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BusinessSettings({ currencyRate, marketOpenUTC, marketCloseUTC, updateSettings, token }: { currencyRate: number, marketOpenUTC: string, marketCloseUTC: string, updateSettings: (u: any) => Promise<boolean>, token: string | null }) {
    const [rate, setRate] = useState(currencyRate.toString());
    const [open, setOpen] = useState(marketOpenUTC);
    const [close, setClose] = useState(marketCloseUTC);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setRate(currencyRate.toString());
        setOpen(marketOpenUTC);
        setClose(marketCloseUTC);
    }, [currencyRate, marketOpenUTC, marketCloseUTC]);

    const handleSave = async () => {
        setSaving(true);
        await updateSettings({
            currencyRate: parseFloat(rate),
            marketOpenUTC: open,
            marketCloseUTC: close
        });
        setSaving(false);
    };

    const handleTestAlert = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/system/test-alert`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                toast.success('Test alert sent! Check your email.');
            } else {
                throw new Error('Failed to send');
            }
        } catch (err) {
            toast.error('Failed to send test alert');
        }
    };

    const hasChanged = parseFloat(rate) !== currencyRate || open !== marketOpenUTC || close !== marketCloseUTC;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 block">USD/QAR</label>
                    <Input
                        type="number"
                        step="0.01"
                        value={rate}
                        onChange={e => setRate(e.target.value)}
                        className="h-8 font-bold text-center text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 block">Open (UTC)</label>
                    <Input
                        type="text"
                        placeholder="HH:mm"
                        value={open}
                        onChange={e => setOpen(e.target.value)}
                        className="h-8 font-bold text-center text-xs"
                    />
                    <div className="text-[8px] text-muted-foreground/40 text-center">Mon 02:01 AST = 23:01 UTC</div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 block">Close (UTC)</label>
                    <Input
                        type="text"
                        placeholder="HH:mm"
                        value={close}
                        onChange={e => setClose(e.target.value)}
                        className="h-8 font-bold text-center text-xs"
                    />
                    <div className="text-[8px] text-muted-foreground/40 text-center">Fri 11:58 PM AST = 20:58 UTC</div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    onClick={handleSave}
                    disabled={!hasChanged || saving}
                    className="flex-1 h-10 font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>

                <Button
                    variant="outline"
                    onClick={handleTestAlert}
                    className="h-10 px-3 hover:bg-primary/5 hover:text-primary transition-colors border-primary/20"
                    title="Send Test Alert"
                >
                    <Bell className="w-4 h-4" />
                </Button>
                <RefreshClosingPricesButton token={token} />
            </div>
        </div>
    );
}

function RefreshClosingPricesButton({ token }: { token: string | null }) {
    const [loading, setLoading] = useState(false);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/system/refresh-closing-prices`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Closing prices updated: Gold=$${data.gold?.toFixed(2)}, Silver=$${data.silver?.toFixed(2)}`);
            } else {
                throw new Error(data.error || 'Failed');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to refresh closing prices');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="h-10 px-3 hover:bg-primary/5 hover:text-primary transition-colors border-primary/20"
            title="Refresh Closing Prices"
        >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
    );
}

type AdminUser = {
    _id: string;
    username: string;
    adminName: string;
    adminEmail: string;
    role: 'admin' | 'super_admin';
    isActive: boolean;
    createdAt: string;
};

export default function Admin() {
    const { logout, isAuthenticated, adminName, adminEmail, token, updateProfile, role } = useAdminAuth();
    const { products, addProduct, editProduct, deleteProduct } = useProducts();
    const { categoryTitles, margin, marginType, spotMargin, isLocked, currencyRate, marketOpenUTC, marketCloseUTC, updateSettings } = useSettings();
    const standardPrices = useGoldPrices();
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState<string>('goldBars');
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState<string>('g');
    const [premium, setPremium] = useState('');
    const [marginOverride, setMarginOverride] = useState('');
    const [purity, setPurity] = useState<string>('1.0');
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

    // Category Editing State
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingCategoryTempName, setEditingCategoryTempName] = useState('');

    // Profile/System State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isFactoryResetConfirm, setIsFactoryResetConfirm] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (adminName) setProfileForm(f => ({ ...f, name: adminName }));
        if (adminEmail) setProfileForm(f => ({ ...f, email: adminEmail }));
    }, [adminName, adminEmail]);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 5) return 'Good Night';
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        if (hour < 22) return 'Good Evening';
        return 'Good Night';
    };

    const scrollToCategory = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 140;
            const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmittingProduct) return;
        if (!name || !weight) return toast.error('Name and Weight required');

        const payload = {
            name,
            category,
            weight: parseFloat(weight),
            weightUnit,
            premium: parseFloat(premium) || 0,
            marginOverride: marginOverride.trim() === '' ? null : (parseFloat(marginOverride) || 0),
            purity: parseFloat(purity) || 1.0
        };

        setIsSubmittingProduct(true);
        try {
            let success;
            if (modalMode === 'edit' && editingId) {
                success = await editProduct(editingId, payload);
            } else {
                success = await addProduct(payload);
            }

            if (success) {
                setIsModalOpen(false);
                setName('');
                setWeight('');
                setPremium('');
                setMarginOverride('');
            }
        } finally {
            setIsSubmittingProduct(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    adminName: profileForm.name,
                    adminEmail: profileForm.email,
                    password: profileForm.password || undefined
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update profile');
            }

            const data = await res.json();
            updateProfile(data.adminName, data.adminEmail);
            toast.success('Profile updated successfully');
            setIsProfileModalOpen(false);
            setProfileForm(f => ({ ...f, password: '' })); // clear password field
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleFactoryReset = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/system/factory-reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Reset failed');

            toast.success('System has been reset. Logging out...');
            setTimeout(() => {
                logout();
                navigate('/setup');
            }, 2000);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const openAddModal = (cat: string) => {
        setModalMode('add');
        setEditingId(null);
        setCategory(cat);
        setName('');
        setWeight('');
        setPremium('');
        setMarginOverride('');
        setWeightUnit(cat === 'goldCoins' || cat === 'silverBars' ? 'oz' : 'g');
        setPurity('1.0');
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setModalMode('edit');
        setEditingId(product._id!);
        setCategory(product.category);
        setName(product.name);
        setWeight(product.weight.toString());
        setWeightUnit(product.weightUnit);
        setPremium(product.premium?.toString() || '0');
        setMarginOverride(product.marginOverride !== undefined && product.marginOverride !== null ? String(product.marginOverride) : '');
        setPurity((product.purity || 1.0).toString());
        setIsModalOpen(true);
    };

    const handleSaveCategoryName = async (catKey: keyof typeof categoryTitles) => {
        if (!editingCategoryTempName.trim()) return;

        const success = await updateSettings({ categoryTitles: { [catKey]: editingCategoryTempName } });
        if (success) {
            setEditingCategory(null);
        }
    };

    if (!isAuthenticated) return null;

    // Helper to render a category grid
    const renderCategoryGrid = (catKey: keyof typeof categoryTitles) => {
        const allCalculatedItems = (standardPrices[catKey as keyof typeof standardPrices] || []) as any[];
        const currentTitle = categoryTitles[catKey];
        const isEditingThisTitle = editingCategory === catKey;

        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-3 group w-max peer">
                    <Package className="w-5 h-5 text-primary" />

                    {isEditingThisTitle ? (
                        <div className="flex items-center gap-2">
                            <Input
                                autoFocus
                                value={editingCategoryTempName}
                                onChange={e => setEditingCategoryTempName(e.target.value)}
                                className="h-8 max-w-[200px]"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveCategoryName(catKey);
                                    if (e.key === 'Escape') setEditingCategory(null);
                                }}
                            />
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleSaveCategoryName(catKey)}>
                                <Check className="w-4 h-4 text-green-500" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold uppercase tracking-wider">{currentTitle}</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                                onClick={() => {
                                    setEditingCategoryTempName(currentTitle);
                                    setEditingCategory(catKey);
                                }}
                            >
                                <Pencil className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {/* Render All Products in this DB Category */}
                    {allCalculatedItems.map(p => {
                        const customDbItem = products.find(cp => cp.name === p.name && (cp.category === catKey || catKey === 'jewelry'));

                        return (
                            <div key={p.name} className="relative group h-full">
                                {/* The visual card */}
                                <div className="h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                                    <PriceCard
                                        product={p}
                                        unit={catKey === 'jewelry' ? 'per gram' : undefined}
                                        className="h-full !p-4"
                                    />
                                </div>

                                {/* Overlay Badges & Actions */}
                                <div className="absolute top-3 right-3 flex gap-2 z-10">
                                    {customDbItem && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="w-8 h-8 opacity-0 shadow-xl group-hover:opacity-100 transition-opacity pointer-events-auto ring-2 ring-background text-foreground hover:bg-muted"
                                                onClick={() => openEditModal(customDbItem)}
                                                title="Edit Product"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="w-8 h-8 opacity-0 shadow-xl group-hover:opacity-100 transition-opacity pointer-events-auto ring-2 ring-background"
                                                onClick={() => deleteProduct(customDbItem._id!)}
                                                title="Delete Product"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Dotted Stroke Add Button */}
                    <div
                        onClick={() => openAddModal(catKey)}
                        className="group flex flex-col items-center justify-center min-h-[160px] p-6 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-300 text-muted-foreground hover:text-primary"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner text-primary">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-sm uppercase tracking-widest text-primary">Add Product</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/20">
            {/* 1. Compact Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 px-6 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary" />
                    </div>
                    <h1 className="text-lg font-black tracking-widest text-foreground flex items-center gap-2">
                        VISUAL <span className="font-light opacity-60">MANAGER</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsProfileModalOpen(true)}
                        className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full px-4"
                    >
                        <User className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Profile</span>
                    </Button>

                    {role === 'super_admin' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/super-admin')}
                            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full px-4"
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Super Admin</span>
                        </Button>
                    )}

                    <div className="h-4 w-px bg-border/40 mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full px-4"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>

            <div className="p-6 sm:p-10 max-w-[1600px] mx-auto pb-40">
                {/* 2. Welcome Hero */}
                <div className="mb-14">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="text-xs font-black uppercase tracking-[0.4em] leading-none">
                                    {getTimeGreeting()}
                                </span>
                                <div className="h-px w-8 bg-primary/30" />
                            </div>
                            <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tight">
                                {adminName || 'Admin'}
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
                        {/* Management Hub: Status */}
                        <div className="lg:col-span-3 p-6 rounded-3xl border border-border/40 bg-card shadow-sm hover:shadow-md transition-all group shrink-0">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-3 rounded-2xl transition-colors ${isLocked ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                                    {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                </div>
                                <Button
                                    size="sm"
                                    variant={isLocked ? 'destructive' : 'outline'}
                                    onClick={() => updateSettings({ isLocked: !isLocked })}
                                    className="h-8 rounded-full px-4 text-[10px] uppercase tracking-widest font-black"
                                >
                                    {isLocked ? 'Unlock' : 'Lock'}
                                </Button>
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">System Status</h3>
                            <p className="font-bold text-lg text-foreground mb-1 leading-none">
                                {isLocked ? 'Dashboard Locked' : 'Live & Public'}
                            </p>
                            <p className="text-[10px] text-muted-foreground italic line-clamp-1">
                                {isLocked ? 'Prices hidden from users' : 'Prices visible to all'}
                            </p>
                        </div>

                        {/* Management Hub: Global Ratio */}
                        <div className="lg:col-span-3 p-6 rounded-3xl border border-border/40 bg-card shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <SettingsIcon className="w-5 h-5" />
                                </div>
                                <MarginSettings
                                    margin={margin}
                                    marginType={marginType}
                                    goldSpotUSD={standardPrices.spot?.goldSpotUSD ?? null}
                                    onSave={(m, t) => updateSettings({ margin: m, marginType: t })}
                                />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Global Markup</h3>
                            <p className="font-bold text-lg text-foreground mb-1 leading-none">
                                {marginType === 'fixed' ? `$${margin}` : `${margin}%`}
                            </p>
                            <p className="text-[10px] text-muted-foreground italic line-clamp-1">
                                Applied universally to all products
                            </p>
                        </div>

                        {/* Management Hub: Business Settings */}
                        <div className="lg:col-span-6 p-6 rounded-3xl border border-border/40 bg-card shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1 leading-none">Business Operations</h3>
                                    <p className="font-bold text-lg text-foreground leading-none">Currency & Market Hours</p>
                                </div>
                            </div>
                            <BusinessSettings
                                currencyRate={currencyRate}
                                marketOpenUTC={marketOpenUTC}
                                marketCloseUTC={marketCloseUTC}
                                updateSettings={updateSettings}
                                token={token}
                            />
                        </div>

                        {/* Management Hub: Spot Control (Now Full Width below) */}
                        <div className="lg:col-span-12 p-6 rounded-3xl border border-primary/20 bg-primary/[0.03] shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1 leading-none">Market Configuration</h3>
                                    <p className="font-bold text-lg text-foreground leading-none">Spot Price Margin</p>
                                </div>
                            </div>
                            <div className="max-w-4xl">
                                <SpotMarginControl
                                    spotMargin={spotMargin}
                                    currentGoldSpot={standardPrices.spot?.goldSpotUSD ?? null}
                                    updateSettings={updateSettings}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-24">
                    {renderCategoryGrid('goldBars')}
                    {renderCategoryGrid('goldCoins')}
                    {renderCategoryGrid('silverBars')}
                    {renderCategoryGrid('jewelry')}
                </div>
            </div>

            {/* Fixed Overlay Modal for Adding Products */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border ring-1 ring-white/10 relative pb-8">

                            <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 rounded-full w-8 h-8 text-muted-foreground hover:bg-secondary"
                                disabled={isSubmittingProduct}
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✕
                        </Button>

                        <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                {modalMode === 'add' ? <Plus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold leading-none">{modalMode === 'add' ? 'Add' : 'Edit'} {category.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {modalMode === 'add' ? 'Deploy dynamic pricing asset to grid.' : 'Modify existing asset configuration.'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground/80">Product Name</label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 100g Bar" required className="bg-background/50" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground/80">Category</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="goldBars">{categoryTitles.goldBars}</SelectItem>
                                        <SelectItem value="goldCoins">{categoryTitles.goldCoins}</SelectItem>
                                        <SelectItem value="silverBars">{categoryTitles.silverBars}</SelectItem>
                                        <SelectItem value="jewelry">{categoryTitles.jewelry}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-foreground/80">Base Weight</label>
                                    <Input type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} required placeholder="1000" className="bg-background/50" />
                                </div>
                                <div className="w-28 space-y-1.5">
                                    <label className="text-sm font-medium text-foreground/80">Unit</label>
                                    <Select value={weightUnit} onValueChange={setWeightUnit}>
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="g">Grams</SelectItem>
                                            <SelectItem value="oz">Troy Oz</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Show Purity Select only for Jewelry */}
                            {category === 'jewelry' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground/80">Gold Purity (Karats)</label>
                                    <Select value={purity} onValueChange={setPurity}>
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1.0">24K (99.9%)</SelectItem>
                                            <SelectItem value={(22 / 24).toString()}>22K (91.6%)</SelectItem>
                                            <SelectItem value={(21 / 24).toString()}>21K (87.5%)</SelectItem>
                                            <SelectItem value={(18 / 24).toString()}>18K (75.0%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-foreground/80">Product Premium / Markup</label>
                                    <span className="text-xs text-muted-foreground">USD ($)</span>
                                </div>
                                <Input type="number" step="0.01" value={premium} onChange={e => setPremium(e.target.value)} placeholder="+ 0.00" className="bg-background/50 font-mono" />
                                <p className="text-[11px] text-muted-foreground mt-1 leading-tight">Additional fixed dollar amount on top of the global margin.</p>
                            </div>

                            {category !== 'jewelry' && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-foreground/80">Per Product Global Margin Override</label>
                                        <span className="text-xs text-muted-foreground">{marginType === 'fixed' ? 'USD/oz' : '%'}</span>
                                    </div>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={marginOverride}
                                        onChange={e => setMarginOverride(e.target.value)}
                                        placeholder={marginType === 'fixed' ? `Use global ($${margin}/oz)` : `Use global (${margin}%)`}
                                        className="bg-background/50 font-mono"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1 leading-tight">Leave blank to use global margin. Set custom value for this product only.</p>
                                </div>
                            )}

                            {/* Live Calculation Preview */}
                            {(() => {
                                const TROY_G = 31.1035;
                                const QAR = currencyRate;
                                const goldSpot = standardPrices.spot?.goldSpotUSD ?? 0;
                                const silverSpot = standardPrices.spot?.silverSpotUSD ?? 0;

                                const w = parseFloat(weight) || 0;
                                const pur = parseFloat(purity) || 1.0;
                                const prem = parseFloat(premium) || 0;
                                const perProductMarginOverride = marginOverride.trim() === '' ? null : (parseFloat(marginOverride) || 0);

                                if (w <= 0 || goldSpot === 0) return null;

                                const isSilver = category === 'silverBars';
                                const spot = isSilver ? silverSpot : goldSpot;

                                // Base spot value for this product
                                let baseUSD = 0;
                                if (category === 'goldCoins') {
                                    const oz = weightUnit === 'g' ? w / TROY_G : w;
                                    baseUSD = spot * pur * oz;
                                } else {
                                    const grams = weightUnit === 'oz' ? w * TROY_G : w;
                                    baseUSD = (spot / TROY_G) * pur * grams;
                                }

                                // Global margin impact on this product
                                let globalMarginUSD = 0;
                                if (margin > 0 && category !== 'jewelry') {
                                    const effectiveMargin = perProductMarginOverride !== null ? perProductMarginOverride : margin;
                                    const productWeightG = weightUnit === 'oz' ? w * TROY_G : w;
                                    if (marginType === 'fixed') {
                                        globalMarginUSD = effectiveMargin * (productWeightG / TROY_G);
                                    } else {
                                        globalMarginUSD = (baseUSD + prem) * (effectiveMargin / 100);
                                    }
                                }

                                const finalUSD = baseUSD + prem + globalMarginUSD;

                                return (
                                    <div className="p-3 rounded-xl border border-border/40 bg-background/50 space-y-2">
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-center mb-2">
                                            Price Breakdown Preview
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Spot Base ({isSilver ? 'Silver' : 'Gold'} × {w}{weightUnit} × {(pur * 100).toFixed(1)}%)</span>
                                                <span className="font-mono font-semibold tabular-nums">${baseUSD.toFixed(2)}</span>
                                            </div>
                                            {category !== 'jewelry' && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">
                                                        + Global Margin ({marginType === 'fixed' ? `$${(perProductMarginOverride !== null ? perProductMarginOverride : margin)}/oz` : `${(perProductMarginOverride !== null ? perProductMarginOverride : margin)}%`})
                                                    </span>
                                                    <span className={`font-mono font-semibold tabular-nums ${globalMarginUSD > 0 ? 'text-amber-500' : 'text-muted-foreground/50'}`}>
                                                        +${globalMarginUSD.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">+ Product Premium</span>
                                                <span className={`font-mono font-semibold tabular-nums ${prem > 0 ? 'text-primary' : 'text-muted-foreground/50'}`}>
                                                    +${prem.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="border-t border-border/40 pt-1.5 flex justify-between items-center">
                                                <span className="font-semibold text-foreground text-sm">Display Price</span>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-sm tabular-nums text-foreground">${finalUSD.toFixed(2)}</span>
                                                    <span className="text-muted-foreground ml-2 text-[10px]">({(finalUSD * QAR).toFixed(2)} QAR)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" disabled={isSubmittingProduct} onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmittingProduct} className="flex-1 gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
                                    {isSubmittingProduct ? (modalMode === 'add' ? 'Creating...' : 'Saving...') : (modalMode === 'add' ? 'Create Asset' : 'Save Changes')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Settings Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 rounded-full w-8 h-8 text-muted-foreground hover:bg-secondary"
                            onClick={() => setIsProfileModalOpen(false)}
                        >
                            ✕
                        </Button>

                        <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold leading-none">Profile Settings</h3>
                                <p className="text-xs text-muted-foreground mt-1">Update your administrative credentials.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</label>
                                <Input
                                    value={profileForm.name}
                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                    placeholder="e.g. Abdullah"
                                    className="bg-background/50 h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                                <Input
                                    value={profileForm.email}
                                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                    placeholder="admin@example.com"
                                    className="bg-background/50 h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reset Password</label>
                                <Input
                                    type="password"
                                    value={profileForm.password}
                                    onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                                    placeholder="Leave blank to keep current"
                                    className="bg-background/50 h-10"
                                />
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button type="submit" className="w-full gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
                                    Save Profile Changes
                                </Button>

                                <div className="pt-4 mt-4 border-t border-destructive/20">
                                    {!isFactoryResetConfirm ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsFactoryResetConfirm(true)}
                                            className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <ShieldAlert className="w-4 h-4" />
                                            System Factory Reset
                                        </Button>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-destructive font-bold text-center uppercase tracking-tighter animate-pulse">
                                                ⚠️ WARNING: This will delete ALL data permenantly!
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    className="flex-1 h-8 text-xs bg-destructive text-white hover:bg-destructive/90"
                                                    onClick={handleFactoryReset}
                                                >
                                                    Confirm Wipe
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 h-8 text-xs"
                                                    onClick={() => setIsFactoryResetConfirm(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
