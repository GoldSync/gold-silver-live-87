/**
 * Dynamically resolves the API base URL based on the current window location.
 * This ensures that if the site is accessed via a network IP (e.g. 192.168.18.229),
 * the frontend correctly points to the proxy server on that same IP.
 */
export const getApiBaseUrl = () => {
    // Default fallback from env or standard localhost
    let proxyUrl = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001/api/prices';

    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        // If we are on a network IP or specifically NOT localhost/127.0.0.1, 
        // and the target URL contains "localhost", swap localhost for the actual host IP.
        if (host !== 'localhost' && host !== '127.0.0.1' && proxyUrl.includes('localhost')) {
            // Replace localhost with current hostname (IP), keeping the port (3001)
            proxyUrl = proxyUrl.replace('localhost', host);
        }
    }

    // Return the base API path (strip /prices if it exists)
    return proxyUrl.replace('/prices', '');
};

export const API_BASE_URL = getApiBaseUrl();
