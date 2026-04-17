import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonOk(data: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
}

function jsonError(status: number) {
  return Promise.resolve({ ok: false, status } as Response);
}

const mockDepartments = [
  {
    id: 1,
    name: '청년부',
    display_order: 1,
    pastor: { id: 1, name: '김목사', title: '목사' },
    teams: [{ id: 1, name: '1청년', pastor: null, pastor_display: '' }],
  },
];

describe('useDepartments', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  it('초기 상태에서 isLoading이 true이고 departments가 빈 배열이다', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    const { useDepartments } = await import('../hooks/useDepartments');

    const { result } = renderHook(() => useDepartments());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.departments).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('성공 시 departments를 채우고 isLoading이 false가 된다', async () => {
    mockFetch.mockReturnValueOnce(jsonOk(mockDepartments));
    const { useDepartments } = await import('../hooks/useDepartments');

    const { result } = renderHook(() => useDepartments());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.departments).toEqual(mockDepartments);
    expect(result.current.error).toBeNull();
  });

  it('API 실패 시 에러 메시지를 설정하고 isLoading이 false가 된다', async () => {
    mockFetch.mockReturnValueOnce(jsonError(500));
    const { useDepartments } = await import('../hooks/useDepartments');

    const { result } = renderHook(() => useDepartments());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('부서 정보를 불러오지 못했습니다');
    expect(result.current.departments).toEqual([]);
  });

  it('배열이 아닌 응답은 빈 배열로 처리한다', async () => {
    mockFetch.mockReturnValueOnce(jsonOk({ not: 'an array' }));
    const { useDepartments } = await import('../hooks/useDepartments');

    const { result } = renderHook(() => useDepartments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.departments).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('두 번째 마운트 시 캐시된 데이터를 사용하여 fetch하지 않는다', async () => {
    mockFetch.mockReturnValueOnce(jsonOk(mockDepartments));
    const { useDepartments } = await import('../hooks/useDepartments');

    const { result, unmount } = renderHook(() => useDepartments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    unmount();

    const { result: result2 } = renderHook(() => useDepartments());

    expect(result2.current.isLoading).toBe(false);
    expect(result2.current.departments).toEqual(mockDepartments);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('언마운트 시 진행 중인 fetch가 중단된다', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    const { useDepartments } = await import('../hooks/useDepartments');

    const { unmount } = renderHook(() => useDepartments());
    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});
