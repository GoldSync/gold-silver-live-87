import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
    token: string | null;
    username: string | null;
    adminName: string | null;
    adminEmail: string | null;
    login: (token: string, username: string, adminName: string, adminEmail: string) => void;
    logout: () => void;
    updateProfile: (adminName: string, adminEmail: string) => void;
    isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [adminName, setAdminName] = useState<string | null>(null);
    const [adminEmail, setAdminEmail] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        const storedUser = localStorage.getItem('adminUsername');
        const storedName = localStorage.getItem('adminName');
        const storedEmail = localStorage.getItem('adminEmail');
        if (storedToken) {
            setToken(storedToken);
            setUsername(storedUser);
            setAdminName(storedName);
            setAdminEmail(storedEmail);
        }
    }, []);

    const login = (newToken: string, newUsername: string, newAdminName: string, newAdminEmail: string) => {
        localStorage.setItem('adminToken', newToken);
        localStorage.setItem('adminUsername', newUsername);
        localStorage.setItem('adminName', newAdminName);
        localStorage.setItem('adminEmail', newAdminEmail);
        setToken(newToken);
        setUsername(newUsername);
        setAdminName(newAdminName);
        setAdminEmail(newAdminEmail);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminName');
        localStorage.removeItem('adminEmail');
        setToken(null);
        setUsername(null);
        setAdminName(null);
        setAdminEmail(null);
    };

    const updateProfile = (newAdminName: string, newAdminEmail: string) => {
        localStorage.setItem('adminName', newAdminName);
        localStorage.setItem('adminEmail', newAdminEmail);
        setAdminName(newAdminName);
        setAdminEmail(newAdminEmail);
    };

    return (
        <AdminAuthContext.Provider value={{ token, username, adminName, adminEmail, login, logout, updateProfile, isAuthenticated: !!token }}>
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
