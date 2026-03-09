import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useSettings } from '@/hooks/useSettings';
import { API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type AdminUser = {
    _id: string;
    username: string;
    adminName: string;
    adminEmail: string;
    role: 'admin' | 'super_admin';
    isActive: boolean;
    createdAt: string;
};

export default function SuperAdmin() {
    const navigate = useNavigate();
    const { initialized, isAuthenticated, token, role, id } = useAdminAuth();
    const { forceLiveMarketPricing, lockedAdminId } = useSettings();

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

    useEffect(() => {
        if (role === 'super_admin') {
            fetchUsers();
        }
    }, [role, token]);

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
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Super Admin Panel</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage admin access and enforce live-market-only mode.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/admin')}>Back to Admin</Button>
                        <Button variant="outline" onClick={fetchUsers} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
                    </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-card p-4">
                    <p className="text-sm">
                        <span className="font-semibold">Pricing Mode:</span>{' '}
                        {forceLiveMarketPricing ? 'Live market only (markups/margins disabled)' : 'Normal admin pricing (markups/margins enabled)'}
                    </p>
                    {lockedAdminId && (
                        <p className="text-xs text-muted-foreground mt-1">Locked admin id: {lockedAdminId}</p>
                    )}
                </div>

                <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                    <h2 className="font-semibold">Create Admin Account</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input placeholder="username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                        <Input type="password" placeholder="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                        <Input placeholder="display name" value={form.adminName} onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))} />
                        <Input placeholder="email" value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} />
                    </div>
                    <Button onClick={createAdmin} disabled={creating}>{creating ? 'Creating...' : 'Create Admin'}</Button>
                </div>

                <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                    <h2 className="font-semibold">Admin Access Control</h2>
                    {users.map(user => (
                        <div key={user._id} className="rounded-lg border border-border/40 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <p className="font-medium">{user.username} <span className="text-xs text-muted-foreground">({user.role})</span></p>
                                <p className="text-xs text-muted-foreground">{user.adminName || 'No name'} · {user.adminEmail || 'No email'} · {user.isActive ? 'Active' : 'Locked'}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleRole(user)}
                                    disabled={user._id === id && user.role === 'super_admin'}
                                >
                                    {user.role === 'super_admin' ? 'Demote' : 'Promote'}
                                </Button>
                                {user.role === 'admin' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => renameAdminUsername(user)}
                                    >
                                        Rename
                                    </Button>
                                )}
                                {user.role === 'admin' && (
                                    <Button
                                        size="sm"
                                        variant={user.isActive ? 'destructive' : 'outline'}
                                        onClick={() => lockAdminForLiveMarket(user, user.isActive)}
                                    >
                                        {user.isActive ? 'Lock + Live Market' : 'Unlock + Restore Pricing'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
