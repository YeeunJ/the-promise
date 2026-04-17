import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../hooks/useToast';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useToast', () => {
  it('초기 상태에서 toasts가 빈 배열이다', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('showToast 호출 시 토스트가 추가된다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('에러 발생', 'error');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: '에러 발생',
      type: 'error',
    });
    expect(result.current.toasts[0].id).toBeTruthy();
  });

  it('type 미지정 시 기본값은 error이다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('기본 에러');
    });

    expect(result.current.toasts[0].type).toBe('error');
  });

  it('success 타입 토스트를 추가할 수 있다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('성공!', 'success');
    });

    expect(result.current.toasts[0].type).toBe('success');
  });

  it('removeToast로 특정 토스트를 제거한다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('첫 번째', 'error');
      result.current.showToast('두 번째', 'success');
    });

    const idToRemove = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(idToRemove);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('두 번째');
  });

  it('3초 후 토스트가 자동 소멸한다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('자동 소멸 테스트');
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('3초 이전에는 토스트가 남아있다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('아직 살아있음');
    });

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it('동시에 최대 3개까지 표시하고 초과 시 가장 오래된 것을 제거한다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('첫 번째', 'error');
      result.current.showToast('두 번째', 'error');
      result.current.showToast('세 번째', 'error');
    });

    expect(result.current.toasts).toHaveLength(3);

    act(() => {
      result.current.showToast('네 번째', 'error');
    });

    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts.find(t => t.message === '첫 번째')).toBeUndefined();
    expect(result.current.toasts[2].message).toBe('네 번째');
  });

  it('각 토스트는 고유한 id를 가진다', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('토스트 1');
      result.current.showToast('토스트 2');
      result.current.showToast('토스트 3');
    });

    const ids = result.current.toasts.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  it('언마운트 시 타이머가 정리된다', () => {
    const { result, unmount } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('테스트');
    });

    unmount();

    // clearTimeout이 호출되어야 하므로 타이머 진행 시 에러 없이 완료
    expect(() => {
      vi.advanceTimersByTime(3000);
    }).not.toThrow();
  });
});
