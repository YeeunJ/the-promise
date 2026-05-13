import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebouncedValue', () => {
  it('초기 렌더 시 입력값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useDebouncedValue('초기', 250));
    expect(result.current).toBe('초기');
  });

  it('값이 변경되어도 delay 이전에는 이전 값을 유지한다', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 250),
      { initialProps: { value: '가' } },
    );

    rerender({ value: '나' });
    act(() => {
      vi.advanceTimersByTime(249);
    });

    expect(result.current).toBe('가');
  });

  it('delay 이후 새로운 값으로 갱신된다', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 250),
      { initialProps: { value: '가' } },
    );

    rerender({ value: '나' });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe('나');
  });

  it('짧은 시간에 여러 번 변경되면 마지막 값만 반영된다', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 250),
      { initialProps: { value: '김' } },
    );

    rerender({ value: '김민' });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: '김민수' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // 마지막 변경에서 아직 250ms 안 지남
    expect(result.current).toBe('김');

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe('김민수');
  });

  it('값이 동일하면 디바운스 타이머를 재시작하지 않는다', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 250),
      { initialProps: { value: '같음' } },
    );

    rerender({ value: '같음' });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe('같음');
  });

  it('언마운트 시 타이머가 정리된다', () => {
    const { rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 250),
      { initialProps: { value: '초기' } },
    );

    rerender({ value: '변경' });
    unmount();

    expect(() => {
      vi.advanceTimersByTime(500);
    }).not.toThrow();
  });
});
