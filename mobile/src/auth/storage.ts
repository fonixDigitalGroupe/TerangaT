import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'teranga_auth_token';

/**
 * Secure token persistence. Falls back to localStorage on web where
 * expo-secure-store is unavailable.
 */
export const tokenStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

const AVATAR_PREFIX = 'teranga_avatar_';

/** Persistance locale de la photo de profil (URI), par utilisateur. */
export const avatarStorage = {
  async get(userId: number | string): Promise<string | null> {
    const key = AVATAR_PREFIX + userId;
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(key) ?? null;
    }
    return SecureStore.getItemAsync(key);
  },
  async set(userId: number | string, uri: string): Promise<void> {
    const key = AVATAR_PREFIX + userId;
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, uri);
      return;
    }
    await SecureStore.setItemAsync(key, uri);
  },
};
