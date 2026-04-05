import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useSettings } from '@/hooks/useSettings';
import { API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


type AdminUser = {
    _id: string;
    username: string;
    adminName: string;
    adminEmail: string;
    role: 'admin' | 'super_admin';
    isActive: boolean;
    createdAt: string;
};

// Visitor type removed

export default function SuperAdmin() {
    const navigate = useNavigate();
    const { initialized, isAuthenticated, token, role, id } = useAdminAuth();
    const { forceLiveMarketPricing, lockedAdminId, refreshSettings } = useSettings();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        if (!initialized || !isAuthenticated || role !== 'super_admin' || !token) return;
        fetchUsers();
    }, [initialized, isAuthenticated, role, token]);

    const fetchData = async () => {
        if (role === 'super_admin') {
            fetchUsers();
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

    // Trial management functions removed

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
                        <p className="text-sm text-muted-foreground mt-1">Global settings and user management.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/admin')}>Back to Admin</Button>
                        <Button variant="outline" onClick={fetchData} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh All'}</Button>
                    </div>
                </div>

                {/* Trial Management Section Removed */}

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
