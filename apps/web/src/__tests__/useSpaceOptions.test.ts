import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { Space } from '../types';

vi.mock('axios');
import axios from 'axios';

const mockedAxios = vi.mocked(axios, true);

function makeSpace(overrides: Partial<Space> = {}): Space {
  return {
    id: 1,
    name: '대예배실',
    floor: 1,
    capacity: 500,
    description: null,
    building: { id: 1, name: '본당', description: null },
    is_active: true,
    created_at: '2026-01-01T00:00:00+09:00',
    ...overrides,
  };
}

describe('useSpaceOptions', () => {
  beforeEach(() => {
    vi.resetModules();
    mockedAxios.get.mockReset();
  });

  it('초기 상태에서 isLoading이 true이고 spaces가 빈 배열이다', async () => {
    mockedAxios.get.mockReturnValueOnce(new Promise(() => {}));
    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');

    const { result } = renderHook(() =>
      useSpaceOptions({ authToken: 'test-token' }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.spaces).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('성공 시 spaces를 채우고 isLoading이 false가 된다', async () => {
    const data = [makeSpace({ id: 1 }), makeSpace({ id: 2, name: '소예배실' })];
    mockedAxios.get.mockResolvedValueOnce({ data });
    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');

    const { result } = renderHook(() =>
      useSpaceOptions({ authToken: 'test-token' }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.spaces).toEqual(data);
    expect(result.current.error).toBeNull();
  });

  it('Authorization 헤더에 Token <token> 형식으로 전달한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');

    renderHook(() => useSpaceOptions({ authToken: 'abc123' }));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/spaces/'),
        expect.objectContaining({
          headers: { Authorization: 'Token abc123' },
        }),
      );
    });
  });

  it('is_active === false 인 항목은 제외한다', async () => {
    const data = [
      makeSpace({ id: 1, is_active: true }),
      makeSpace({ id: 2, name: '폐쇄된 공간', is_active: false }),
      makeSpace({ id: 3, name: '플래그 없음', is_active: undefined }),
    ];
    mockedAxios.get.mockResolvedValueOnce({ data });
    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');

    const { result } = renderHook(() =>
      useSpaceOptions({ authToken: 'test-token' }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // is_active=true 와 undefined(필드 자체 부재) 모두 통과 — 보수적 처리
    expect(result.current.spaces.map((s) => s.id)).toEqual([1, 3]);
  });

  it('API 실패 시 에러 메시지를 설정한다', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');

    const { result } = renderHook(() =>
      useSpaceOptions({ authToken: 'test-token' }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('공간 목록을 불러오지 못했습니다');
    expect(result.current.spaces).toEqual([]);
  });

  it('배열이 아닌 응답은 빈 배열로 처리한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { not: 'an array' } });
    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');

    const { result } = renderHook(() =>
      useSpaceOptions({ authToken: 'test-token' }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.spaces).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('enabled=false 이면 호출하지 않는다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [makeSpace()] });
    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');

    const { result } = renderHook(() =>
      useSpaceOptions({ authToken: 'test-token', enabled: false }),
    );

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.spaces).toEqual([]);
  });

  it('authToken 이 null 이면 호출하지 않는다', async () => {
    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');

    const { result } = renderHook(() =>
      useSpaceOptions({ authToken: null }),
    );

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.spaces).toEqual([]);
  });

  it('두 번째 마운트 시 캐시된 데이터를 사용하여 fetch 하지 않는다', async () => {
    const data = [makeSpace({ id: 7 })];
    mockedAxios.get.mockResolvedValueOnce({ data });
    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');

    const { result, unmount } = renderHook(() =>
      useSpaceOptions({ authToken: 'test-token' }),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    unmount();

    const { result: result2 } = renderHook(() =>
      useSpaceOptions({ authToken: 'test-token' }),
    );

    expect(result2.current.isLoading).toBe(false);
    expect(result2.current.spaces).toEqual(data);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('refetch 호출 시 캐시를 무시하고 다시 fetch 한다', async () => {
    const first = [makeSpace({ id: 1 })];
    const second = [makeSpace({ id: 1 }), makeSpace({ id: 2, name: '추가' })];
    mockedAxios.get
      .mockResolvedValueOnce({ data: first })
      .mockResolvedValueOnce({ data: second });

    const { useSpaceOptions } = await import('../hooks/useSpaceOptions');
    const { result } = renderHook(() =>
      useSpaceOptions({ authToken: 'test-token' }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.spaces).toEqual(first);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(result.current.spaces).toEqual(second);
  });
});
