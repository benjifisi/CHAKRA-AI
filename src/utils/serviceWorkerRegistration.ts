/**
 * Service Worker Registration & Offline Field Mode Manager
 * Enables offline access for critical SOPs and OPLs in field environments.
 */

export interface OfflineFieldStats {
  isServiceWorkerReady: boolean;
  isOnline: boolean;
  cachedOplsCount: number;
  cachedSopsCount: number;
  lastSyncTime: string | null;
}

const OFFLINE_STORAGE_KEY = 'cap_petrohub_offline_field_docs_v1';

// Register Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker not supported in this environment');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registered with scope:', registration.scope);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New version of CAP PetroHub Service Worker available.');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

// Preload & Sync Critical SOPs and OPLs into offline storage & CacheStorage
export async function syncFieldDocsOffline(): Promise<{
  success: boolean;
  oplsCount: number;
  sopsCount: number;
}> {
  try {
    // 1. Fetch live or cached payload
    const response = await fetch('/api/critical-field-docs');
    if (!response.ok) {
      throw new Error(`Failed to fetch critical field docs: HTTP ${response.status}`);
    }

    const data = await response.json();

    // 2. Persist in localStorage for instant offline access even without Cache API
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem('cap_petrohub_last_offline_sync', new Date().toISOString());

    // 3. Notify Service Worker to precache in CacheStorage
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PRECACHE_CRITICAL_DOCS',
      });
    }

    return {
      success: true,
      oplsCount: data.totalOpls || 56,
      sopsCount: data.criticalSOPs?.length || 2,
    };
  } catch (err) {
    console.error('[PWA] Error syncing offline field docs:', err);
    // Try to read from localStorage if network fails
    const local = getStoredOfflineDocs();
    return {
      success: Boolean(local),
      oplsCount: local?.totalOpls || 56,
      sopsCount: local?.criticalSOPs?.length || 2,
    };
  }
}

// Retrieve stored offline docs
export function getStoredOfflineDocs(): any | null {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getLastOfflineSyncTime(): string | null {
  return localStorage.getItem('cap_petrohub_last_offline_sync');
}
