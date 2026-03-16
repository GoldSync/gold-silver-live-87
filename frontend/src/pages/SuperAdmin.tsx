import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useSettings } from '@/hooks/useSettings';
import { API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, Smartphone, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

type AdminUser = {
    _id: string;
    username: string;
    adminName: string;
    adminEmail: string;
    role: 'admin' | 'super_admin';
    isActive: boolean;
    createdAt: string;
};

type Visitor = {
    _id: string;
    fingerprint: string;
    firstSeen: string;
    lastSeen: string;
    isExtended: boolean;
    isWhitelisted: boolean;
    expiredAt: string | null;
    name: string;
    email: string;
};

export default function SuperAdmin() {
    const navigate = useNavigate();
    const { initialized, isAuthenticated, token, role, id } = useAdminAuth();
    const { forceLiveMarketPricing, lockedAdminId, trialEnabled, refreshSettings } = useSettings();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingVisitors, setLoadingVisitors] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', adminName: '', adminEmail: '' });

    useEffect(() => {
        if (!initialized) return;

        if (!isAuthenticated) {
            navigate('/login?next=/super-admin');
            return;
        }
        if (role !== 'super_admin') {
            toast.error('Super admin access required');
            navigate('/admin');
        }
    }, [initialized, isAuthenticated, role, navigate]);

    const fetchData = async () => {
        if (role === 'super_admin') {
            fetchUsers();
            fetchVisitors();
        }
    };

    const fetchUsers = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/super-admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load users');
            setUsers(data || []);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchVisitors = async () => {
        if (!token) return;
        setLoadingVisitors(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/visitors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load visitors');
            setVisitors(data || []);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load visitors');
        } finally {
            setLoadingVisitors(false);
        }
    };

    useEffect(() => {
        if (role === 'super_admin') {
            fetchData();
        }
    }, [role, token]);

    const toggleTrialSystem = async (enabled: boolean) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/settings/trial-toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ enabled })
            });
            if (!res.ok) throw new Error('Failed to update trial system status');
            toast.success(enabled ? 'Trial locking enabled' : 'Trial locking disabled globally');
            refreshSettings();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const extendVisitorTrial = async (fingerprint: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/visitors/extend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ fingerprint })
            });
            if (!res.ok) throw new Error('Failed to extend trial');
            toast.success('Trial extended by 3 days');
            fetchVisitors();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const toggleWhitelist = async (fingerprint: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/visitors/whitelist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ fingerprint, whitelisted: !currentStatus })
            });
            if (!res.ok) throw new Error('Failed to update whitelist');
            toast.success(!currentStatus ? 'Device whitelisted' : 'Whitelist revoked');
            fetchVisitors();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const createAdmin = async () => {
        if (!form.username.trim() || !form.password.trim()) {
            toast.error('Username and password are required');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/super-admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create admin');

            toast.success('Admin created');
            setForm({ username: '', password: '', adminName: '', adminEmail: '' });
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to create admin');
        } finally {
            setCreating(false);
        }
    };

    const toggleRole = async (user: AdminUser) => {
        try {
            const res = await fetch(`${API_BASE_URL}/super-admin/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: user.role === 'super_admin' ? 'admin' : 'super_admin' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update role');
            toast.success('Role updated');
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update role');
        }
    };

    const renameAdminUsername = async (user: AdminUser) => {
        const nextUsername = window.prompt('Enter new username', user.username);
        if (!nextUsername) return;

        const trimmed = nextUsername.trim();
        if (!trimmed) {
            toast.error('Username cannot be empty');
            return;
        }

        if (trimmed === user.username) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/super-admin/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ username: trimmed })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to rename admin username');
            toast.success('Admin username updated');
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to rename admin username');
        }
    };

    const lockAdminForLiveMarket = async (user: AdminUser, lock: boolean) => {
        try {
            const res = await fetch(`${API_BASE_URL}/super-admin/users/${user._id}/lock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ locked: lock })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update lock state');
            toast.success(lock ? 'Admin locked and live market mode enabled' : 'Admin unlocked and pricing mode restored');
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update lock state');
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 sm:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary" />
                            Super Admin Panel
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Global settings, user management, and trial control.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/admin')}>Back to Admin</Button>
                        <Button variant="outline" onClick={fetchData} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh All'}</Button>
                    </div>
                </div>

                {/* Trial Management Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Trial System Master
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div>
                                    <p className="font-medium text-sm">Trial Locking</p>
                                    <p className="text-xs text-muted-foreground">Enabled globally</p>
                                </div>
                                <Switch 
                                    checked={trialEnabled} 
                                    onCheckedChange={toggleTrialSystem}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
                                <p>When disabled, all devices will have unrestricted access regardless of their trial status.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Smartphone className="w-5 h-5" />
                                    Device & Trial Monitoring
                                </CardTitle>
                                <Badge variant="outline">{visitors.length} total devices</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Device/Lead</th>
                                            <th className="text-left p-3 font-medium">Status</th>
                                            <th className="text-left p-3 font-medium">First Seen</th>
                                            <th className="text-right p-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {visitors.map(visitor => {
                                            const isExpired = visitor.expiredAt;
                                            return (
                                                <tr key={visitor._id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3">
                                                        <div className="font-medium">{visitor.name || visitor.email || 'Anonymous'}</div>
                                                        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                                                            {visitor.fingerprint}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        {visitor.isWhitelisted ? (
                                                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Whitelisted
                                                            </Badge>
                                                        ) : isExpired ? (
                                                            <div className="space-y-1">
                                                                <Badge variant="destructive" className="flex items-center">
                                                                    <XCircle className="w-3 h-3 mr-1" /> Expired
                                                                </Badge>
                                                                <div className="text-[10px] text-muted-foreground flex items-center">
                                                                    <Clock className="w-3 h-3 mr-1" /> {new Date(visitor.expiredAt!).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
                                                                Active Trial
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-muted-foreground text-xs">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {new Date(visitor.firstSeen).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                className="h-8 px-2 text-xs"
                                                                onClick={() => toggleWhitelist(visitor.fingerprint, visitor.isWhitelisted)}
                                                            >
                                                                {visitor.isWhitelisted ? 'Revoke' : 'Whitelist'}
                                                            </Button>
                                                            {!visitor.isExtended && (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="h-8 px-2 text-xs"
                                                                    onClick={() => extendVisitorTrial(visitor.fingerprint)}
                                                                >
                                                                    +3 Days
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {visitors.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                    No devices tracked yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-xl border border-border/40 bg-card p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Admin Access Control
                        </h2>
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                            {users.length} Admins
                        </Badge>
                    </div>

                    <div className="rounded-lg bg-muted/30 p-4 space-y-4">
                        <h3 className="text-sm font-medium">Create Admin Account</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Input placeholder="username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                            <Input type="password" placeholder="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                            <Input placeholder="display name" value={form.adminName} onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))} />
                            <Input placeholder="email" value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} />
                        </div>
                        <Button onClick={createAdmin} disabled={creating} className="w-full md:w-auto">
                            {creating ? 'Creating...' : 'Create Admin User'}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {users.map(user => (
                            <div key={user._id} className="rounded-lg border border-border/40 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{user.username}</p>
                                        <Badge variant={user.role === 'super_admin' ? 'default' : 'outline'}>
                                            {user.role}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {user.adminName || 'No name'} · {user.adminEmail || 'No email'} · {user.isActive ? <span className="text-green-600">Active</span> : <span className="text-red-600">Locked</span>}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleRole(user)}
                                        disabled={user._id === id && user.role === 'super_admin'}
                                        className="h-8"
                                    >
                                        {user.role === 'super_admin' ? 'Demote' : 'Promote'}
                                    </Button>
                                    {user.role === 'admin' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => renameAdminUsername(user)}
                                            className="h-8"
                                        >
                                            Rename
                                        </Button>
                                    )}
                                    {user.role === 'admin' && (
                                        <Button
                                            size="sm"
                                            variant={user.isActive ? 'destructive' : 'outline'}
                                            onClick={() => lockAdminForLiveMarket(user, user.isActive)}
                                            className="h-8"
                                        >
                                            {user.isActive ? 'Lock + Live Market' : 'Unlock + Restore Pricing'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-destructive" />
                    <p className="text-xs text-destructive/80 italic"> 
                        Caution: Changes here affect critical system security and revenue controls.
                    </p>
                </div>
            </div>
        </div>
    );
}
