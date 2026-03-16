import { useState, useCallback, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';
// getFingerprint removed

export interface CustomProduct {
    _id?: string;
    category: string;
    name: string;
    weight: number;
    weightUnit: string;
    premium: number;
    marginOverride?: number | null;
    purity?: number;
}


export const EVENT_PRODUCTS_CHANGED = 'EVENT_PRODUCTS_CHANGED';

export function useProducts() {
    const { token } = useAdminAuth();
    const [products, setProducts] = useState<CustomProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await fetch(`${API_BASE_URL}/products`);

            if (!res.ok) throw new Error('Failed to fetch custom products');
            const data = await res.json();
            setProducts(data);
        } catch (err: any) {
            console.error(err);
            if (!silent) toast.error('Could not load custom products. Is MongoDB connected?');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();

        const handleGlobalChange = () => fetchProducts(true);
        window.addEventListener(EVENT_PRODUCTS_CHANGED, handleGlobalChange);

        const mode = import.meta.env.VITE_REFRESH_MODE || 'MANUAL';
        const intervalMs = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '2000', 10);

        if (mode === 'AUTO' && intervalMs > 0) {
            const intervalId = setInterval(() => {
                fetchProducts(true);
            }, intervalMs);
            return () => {
                clearInterval(intervalId);
                window.removeEventListener(EVENT_PRODUCTS_CHANGED, handleGlobalChange);
            };
        }

        return () => window.removeEventListener(EVENT_PRODUCTS_CHANGED, handleGlobalChange);
    }, [fetchProducts]);

    const addProduct = async (product: Omit<CustomProduct, '_id'>) => {
        try {
            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(product)
            });
            if (!res.ok) throw new Error('Failed to add product');
            fetchProducts(true);
            window.dispatchEvent(new Event(EVENT_PRODUCTS_CHANGED));
            toast.success('Product added successfully');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Failed to add product');
            return false;
        }
    };

    const editProduct = async (id: string, updates: Partial<Omit<CustomProduct, '_id'>>) => {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update product');
            fetchProducts(true);
            window.dispatchEvent(new Event(EVENT_PRODUCTS_CHANGED));
            toast.success('Product updated successfully');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Failed to update product');
            return false;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete product');
            fetchProducts(true);
            window.dispatchEvent(new Event(EVENT_PRODUCTS_CHANGED));
            toast.success('Product deleted successfully');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete product');
            return false;
        }
    };

    return { products, loading, refetch: fetchProducts, addProduct, editProduct, deleteProduct };
}
