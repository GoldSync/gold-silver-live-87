/**
 * Generates or retrieves a stable unique identifier for this device.
 * Not truly un-spoofable, but sufficient for a 30-day trial logic on Android TV/Mobiles.
 */
export const getFingerprint = (): string => {
    const STORAGE_KEY = 'gs_device_fingerprint';

    // 1. Try LocalStorage
    let fingerprint = localStorage.getItem(STORAGE_KEY);
    if (fingerprint) return fingerprint;

    // 2. Create a unique ID
    // @ts-ignore - crypto.randomUUID might not be known by older TS definitions but exists in modern browsers
    fingerprint = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Store it
    localStorage.setItem(STORAGE_KEY, fingerprint);

    return fingerprint;
};
