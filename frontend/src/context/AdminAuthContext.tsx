import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
    initialized: boolean;
    token: string | null;
    id: string | null;
    username: string | null;
    adminName: string | null;
    adminEmail: string | null;
    role: 'admin' | 'super_admin';
    login: (token: string, id: string, username: string, adminName: string, adminEmail: string, role: 'admin' | 'super_admin') => void;
    logout: () => void;
    updateProfile: (adminName: string, adminEmail: string) => void;
    isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [initialized, setInitialized] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [adminName, setAdminName] = useState<string | null>(null);
    const [adminEmail, setAdminEmail] = useState<string | null>(null);
    const [role, setRole] = useState<'admin' | 'super_admin'>('admin');

    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        const storedId = localStorage.getItem('adminId');
        const storedUser = localStorage.getItem('adminUsername');
        const storedName = localStorage.getItem('adminName');
        const storedEmail = localStorage.getItem('adminEmail');
        const storedRole = (localStorage.getItem('adminRole') as 'admin' | 'super_admin' | null) || 'admin';
        if (storedToken) {
            setToken(storedToken);
            setId(storedId);
            setUsername(storedUser);
            setAdminName(storedName);
            setAdminEmail(storedEmail);
            setRole(storedRole);
        }
        setInitialized(true);
    }, []);

    const login = (newToken: string, newId: string, newUsername: string, newAdminName: string, newAdminEmail: string, newRole: 'admin' | 'super_admin') => {
        localStorage.setItem('adminToken', newToken);
        localStorage.setItem('adminId', newId);
        localStorage.setItem('adminUsername', newUsername);
        localStorage.setItem('adminName', newAdminName);
        localStorage.setItem('adminEmail', newAdminEmail);
        localStorage.setItem('adminRole', newRole);
        setToken(newToken);
        setId(newId);
        setUsername(newUsername);
        setAdminName(newAdminName);
        setAdminEmail(newAdminEmail);
        setRole(newRole);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminName');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminRole');
        setToken(null);
        setId(null);
        setUsername(null);
        setAdminName(null);
        setAdminEmail(null);
        setRole('admin');
    };

    const updateProfile = (newAdminName: string, newAdminEmail: string) => {
        localStorage.setItem('adminName', newAdminName);
        localStorage.setItem('adminEmail', newAdminEmail);
        setAdminName(newAdminName);
        setAdminEmail(newAdminEmail);
    };

    return (
        <AdminAuthContext.Provider value={{ initialized, token, id, username, adminName, adminEmail, role, login, logout, updateProfile, isAuthenticated: !!token }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
