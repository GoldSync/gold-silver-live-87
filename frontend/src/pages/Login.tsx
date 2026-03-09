import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingSetup, setCheckingSetup] = useState(true);
    const { login } = useAdminAuth();
    const navigate = useNavigate();

    // Check if onboarding is done
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/onboarding/status`);
                const data = await res.json();
                if (!data.completed) {
                    navigate('/setup');
                    return;
                }
            } catch { /* proceed to login if check fails */ }
            setCheckingSetup(false);
        })();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.token, data.id, data.username, data.adminName, data.adminEmail, data.role || 'admin');
            toast.success('Logged in successfully');
            navigate('/admin');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (checkingSetup) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border rounded-xl p-8 shadow-2xl">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Username</label>
                        <Input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
