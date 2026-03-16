const DEFAULT_API_BASE_URL = '/api';

function isAbsoluteHttpUrl(value: string) {
    return /^https?:\/\//i.test(value);
}

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

function shouldUseSameOriginApi(apiBaseUrl: string) {
    if (!import.meta.env.PROD || !isAbsoluteHttpUrl(apiBaseUrl)) {
        return false;
    }

    if (typeof window === 'undefined') {
        return true;
    }

    try {
        return new URL(apiBaseUrl).origin !== window.location.origin;
    } catch {
        return true;
    }
}

export const getApiBaseUrl = () => {
    const configuredBaseUrl = normalizeApiBaseUrl(
        import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_PROXY_URL || DEFAULT_API_BASE_URL
    );

    if (shouldUseSameOriginApi(configuredBaseUrl)) {
        return DEFAULT_API_BASE_URL;
    }

    return configuredBaseUrl;
};

export const API_BASE_URL = getApiBaseUrl();
