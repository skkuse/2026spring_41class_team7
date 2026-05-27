'use client';

import { createElement, createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'team7_api_bearer';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type ApiClient = {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body?: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
  setAuthToken: (token: string | null) => void;
  authToken: string | null;
};

const ApiContext = createContext<ApiClient | null>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

async function request<T>(method: HttpMethod, path: string, token: string | null, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message = json?.message ?? `Request failed (${response.status})`;
    throw new Error(message);
  }

  return json as T;
}

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ApiProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [authToken, setAuthTokenState] = useState<string | null>(() => readStoredToken());

  const setAuthToken = useCallback((token: string | null) => {
    setAuthTokenState(token);
    if (typeof window === 'undefined') return;
    try {
      if (token) sessionStorage.setItem(STORAGE_KEY, token);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const value = useMemo<ApiClient>(
    () => ({
      authToken,
      setAuthToken,
      get: <T,>(path: string) => request<T>('GET', path, authToken),
      post: <T,>(path: string, body?: unknown) => request<T>('POST', path, authToken, body),
      patch: <T,>(path: string, body?: unknown) => request<T>('PATCH', path, authToken, body),
      delete: <T,>(path: string) => request<T>('DELETE', path, authToken),
    }),
    [authToken, setAuthToken],
  );

  return createElement(ApiContext.Provider, { value }, children) as React.JSX.Element;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) throw new Error('useApi must be used inside ApiProvider.');
  return context;
}
