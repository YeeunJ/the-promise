import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'the-promise:lookup-creds:v1';

export interface LookupCredentials {
  name: string;
  phone: string;
}

interface UseLookupCredentialsReturn {
  credentials: LookupCredentials | null;
  setCredentials: (creds: LookupCredentials) => void;
  clearCredentials: () => void;
}

function readFromStorage(): LookupCredentials | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'name' in parsed &&
      'phone' in parsed &&
      typeof (parsed as Record<string, unknown>).name === 'string' &&
      typeof (parsed as Record<string, unknown>).phone === 'string'
    ) {
      return parsed as LookupCredentials;
    }
    return null;
  } catch {
    return null;
  }
}

export function useLookupCredentials(): UseLookupCredentialsReturn {
  const [credentials, setCredentialsState] = useState<LookupCredentials | null>(
    () => readFromStorage(),
  );

  useEffect(() => {
    function onStorage(e: StorageEvent): void {
      if (e.key === STORAGE_KEY) {
        setCredentialsState(readFromStorage());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('storage', onStorage); };
  }, []);

  const setCredentials = useCallback((creds: LookupCredentials) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    } catch {
      // sessionStorage 불가 환경에서도 in-memory state 는 유지
    }
    setCredentialsState(creds);
  }, []);

  const clearCredentials = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setCredentialsState(null);
  }, []);

  return { credentials, setCredentials, clearCredentials };
}

export const LOOKUP_CREDENTIALS_STORAGE_KEY = STORAGE_KEY;
