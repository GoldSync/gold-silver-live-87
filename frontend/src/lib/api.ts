const DEFAULT_API_BASE_URL = '/api';

function normalizeApiBaseUrl(value?: string) {
    if (!value) {
        return DEFAULT_API_BASE_URL;
    }

    const trimmed = value.trim().replace(/\/+$/, '');

    if (trimmed.endsWith('/api/prices')) {
        return trimmed.slice(0, -'/prices'.length);
    }

    if (trimmed.endsWith('/prices')) {
        return trimmed.slice(0, -'/prices'.length);
    }

    return trimmed;
}

export const getApiBaseUrl = () => normalizeApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_PROXY_URL || DEFAULT_API_BASE_URL
);

export const API_BASE_URL = getApiBaseUrl();
