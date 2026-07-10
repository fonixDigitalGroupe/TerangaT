import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Port where `php artisan serve` is exposed on your machine.
 * Start the backend with: php artisan serve --host=0.0.0.0 --port=8000
 */
const API_PORT = 8000;

/**
 * If set, this URL wins over auto-detection. Use it for a deployed backend,
 * e.g. 'https://api.terangatrans.com/api'.
 */
const MANUAL_API_URL: string | null = null;

/**
 * Derive the LAN host of the Metro/Expo dev server so a physical phone running
 * Expo Go can reach the Laravel backend on the same Wi-Fi network.
 */
function resolveBaseUrl(): string {
  if (MANUAL_API_URL) return MANUAL_API_URL;

  // On web (including a phone browser on the LAN), the backend lives on the
  // same host that served the page — just on the API port instead of Metro's.
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:${API_PORT}/api`;
  }

  // e.g. "192.168.1.42:8081" (Expo dev server host)
  const legacyHost = (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;
  const hostUri = Constants.expoConfig?.hostUri ?? legacyHost ?? '';

  const host = hostUri.split(':')[0];

  if (host) {
    return `http://${host}:${API_PORT}/api`;
  }

  // Last resort (Android emulator maps host machine to 10.0.2.2).
  return `http://10.0.2.2:${API_PORT}/api`;
}

export const API_BASE_URL = resolveBaseUrl();
