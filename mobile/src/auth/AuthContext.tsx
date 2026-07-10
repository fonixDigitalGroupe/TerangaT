import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { authApi, RegisterPayload } from '../api/endpoints';
import { tokenStorage } from './storage';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (phone: string, password: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback(async (newToken: string, newUser: User) => {
    setAuthToken(newToken);
    await tokenStorage.set(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    await tokenStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  // Restore a persisted session on cold start.
  useEffect(() => {
    (async () => {
      try {
        const stored = await tokenStorage.get();
        if (stored) {
          setAuthToken(stored);
          const { data } = await authApi.me();
          setToken(stored);
          setUser(data);
        }
      } catch {
        await clearSession();
      } finally {
        setInitializing(false);
      }
    })();
  }, [clearSession]);

  // Auto-logout when the API reports the token is no longer valid.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
  }, [clearSession]);

  const login = useCallback(
    async (phone: string, password: string) => {
      const { token: t, user: u } = await authApi.login(phone, password);
      await applySession(t, u);
    },
    [applySession]
  );

  const verifyOtp = useCallback(
    async (phone: string, code: string) => {
      const { token: t, user: u } = await authApi.verifyOtp(phone, code);
      await applySession(t, u);
    },
    [applySession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { token: t, user: u } = await authApi.register(payload);
      await applySession(t, u);
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout; clear locally regardless.
    }
    await clearSession();
  }, [clearSession]);

  const refresh = useCallback(async () => {
    const { data } = await authApi.me();
    setUser(data);
  }, []);

  const value = useMemo(
    () => ({ user, token, initializing, login, verifyOtp, register, logout, refresh }),
    [user, token, initializing, login, verifyOtp, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
