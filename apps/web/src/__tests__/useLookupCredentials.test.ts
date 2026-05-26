import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useLookupCredentials,
  LOOKUP_CREDENTIALS_STORAGE_KEY,
} from '../hooks/useLookupCredentials';

describe('useLookupCredentials', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('starts with null when sessionStorage is empty', () => {
    const { result } = renderHook(() => useLookupCredentials());
    expect(result.current.credentials).toBeNull();
  });

  it('hydrates from sessionStorage on mount', () => {
    sessionStorage.setItem(
      LOOKUP_CREDENTIALS_STORAGE_KEY,
      JSON.stringify({ name: '홍길동', phone: '010-1234-5678' }),
    );
    const { result } = renderHook(() => useLookupCredentials());
    expect(result.current.credentials).toEqual({
      name: '홍길동',
      phone: '010-1234-5678',
    });
  });

  it('setCredentials persists to sessionStorage and updates state', () => {
    const { result } = renderHook(() => useLookupCredentials());
    act(() => {
      result.current.setCredentials({ name: '김철수', phone: '010-9999-0000' });
    });
    expect(result.current.credentials).toEqual({
      name: '김철수',
      phone: '010-9999-0000',
    });
    expect(sessionStorage.getItem(LOOKUP_CREDENTIALS_STORAGE_KEY)).toBe(
      JSON.stringify({ name: '김철수', phone: '010-9999-0000' }),
    );
  });

  it('clearCredentials wipes both state and sessionStorage', () => {
    const { result } = renderHook(() => useLookupCredentials());
    act(() => {
      result.current.setCredentials({ name: 'A', phone: 'B' });
    });
    expect(result.current.credentials).not.toBeNull();
    act(() => {
      result.current.clearCredentials();
    });
    expect(result.current.credentials).toBeNull();
    expect(sessionStorage.getItem(LOOKUP_CREDENTIALS_STORAGE_KEY)).toBeNull();
  });

  it('returns null when storage contains invalid JSON', () => {
    sessionStorage.setItem(LOOKUP_CREDENTIALS_STORAGE_KEY, '{not valid');
    const { result } = renderHook(() => useLookupCredentials());
    expect(result.current.credentials).toBeNull();
  });

  it('returns null when storage shape is invalid', () => {
    sessionStorage.setItem(LOOKUP_CREDENTIALS_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
    const { result } = renderHook(() => useLookupCredentials());
    expect(result.current.credentials).toBeNull();
  });
});
