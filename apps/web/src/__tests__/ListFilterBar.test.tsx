import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListFilterBar } from '../components/admin/ListFilterBar';
import type { Building } from '../types';
import type { PaginatedReservationsFilters } from '../hooks/usePaginatedReservations';

const mockBuildings: Building[] = [
  { id: 1, name: '본당', description: null },
  { id: 2, name: '가나안홀', description: null },
  { id: 3, name: '무지개홀', description: null },
];

function createDefaultProps(
  overrides: Partial<Parameters<typeof ListFilterBar>[0]> = {},
) {
  const filters: PaginatedReservationsFilters = {
    from_date: '2026-04-16',
    to_date: '2026-04-23',
  };
  return {
    filters,
    onFiltersChange: vi.fn(),
    buildings: mockBuildings,
    isLoading: false,
    ...overrides,
  };
}

describe('ListFilterBar (서버 필터 시그니처)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-04-16T09:00:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- 기본 렌더링 ---

  it('건물 / 기간 / 검색 세 개 영역이 렌더링된다', () => {
    render(<ListFilterBar {...createDefaultProps()} />);
    expect(screen.getByRole('button', { name: '건물 필터' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '기간 필터' })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('이름·전화 검색'),
    ).toBeInTheDocument();
  });

  it('그룹/팀 필터 UI 가 노출되지 않는다 (T3 에서 제거)', () => {
    render(<ListFilterBar {...createDefaultProps()} />);
    expect(
      screen.queryByRole('button', { name: /그룹/i }),
    ).not.toBeInTheDocument();
  });

  // --- 건물 필터 (단일 선택) ---

  describe('건물 필터', () => {
    it('드롭다운에 "전체 건물" + 건물들이 표시된다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: '건물 필터' }));

      expect(screen.getByRole('button', { name: '전체 건물' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '본당' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '가나안홀' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '무지개홀' })).toBeInTheDocument();
    });

    it('건물 선택 시 onFiltersChange({...filters, building_id}) 호출', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <ListFilterBar {...createDefaultProps({ onFiltersChange })} />,
      );

      await user.click(screen.getByRole('button', { name: '건물 필터' }));
      await user.click(screen.getByRole('button', { name: '본당' }));

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          building_id: 1,
          from_date: '2026-04-16',
          to_date: '2026-04-23',
        }),
      );
    });

    it('"전체 건물" 선택 시 building_id 가 undefined 로 통보된다', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <ListFilterBar
          {...createDefaultProps({
            filters: { building_id: 2, from_date: '2026-04-16', to_date: '2026-04-23' },
            onFiltersChange,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: '건물 필터' }));
      await user.click(screen.getByRole('button', { name: '전체 건물' }));

      const arg = onFiltersChange.mock.calls[0][0];
      expect(arg.building_id).toBeUndefined();
    });

    it('선택된 건물명이 버튼 라벨에 표시된다', () => {
      render(
        <ListFilterBar
          {...createDefaultProps({
            filters: { building_id: 2, from_date: '2026-04-16', to_date: '2026-04-23' },
          })}
        />,
      );

      const trigger = screen.getByRole('button', { name: '건물 필터' });
      expect(trigger.textContent).toContain('가나안홀');
    });
  });

  // --- 기간 필터 ---

  describe('기간 필터', () => {
    it('프리셋 옵션이 표시된다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: '기간 필터' }));

      const dropdown = screen.getByTestId('date-dropdown');
      expect(dropdown).toHaveTextContent('1주 이내');
      expect(dropdown).toHaveTextContent('2주 이내');
      expect(dropdown).toHaveTextContent('한달 이내');
      expect(dropdown).toHaveTextContent('날짜선택');
    });

    it('"2주 이내" 선택 시 onFiltersChange 가 from_date/to_date 로 호출된다', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <ListFilterBar {...createDefaultProps({ onFiltersChange })} />,
      );

      await user.click(screen.getByRole('button', { name: '기간 필터' }));
      await user.click(screen.getByRole('button', { name: '2주 이내' }));

      const arg = onFiltersChange.mock.calls[0][0];
      expect(typeof arg.from_date).toBe('string');
      expect(typeof arg.to_date).toBe('string');
      // 시스템시간 2026-04-16 기준 → from=2026-04-16 to=2026-04-30
      expect(arg.from_date).toBe('2026-04-16');
      expect(arg.to_date).toBe('2026-04-30');
    });

    it('"날짜선택" 모드에서 시작일 / 종료일 인풋이 노출된다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: '기간 필터' }));
      await user.click(screen.getByRole('button', { name: '날짜선택' }));

      expect(screen.getByLabelText('시작일')).toBeInTheDocument();
      expect(screen.getByLabelText('종료일')).toBeInTheDocument();
    });

    it('custom 모드에서 시작일 변경 시 onFiltersChange 호출', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <ListFilterBar {...createDefaultProps({ onFiltersChange })} />,
      );

      await user.click(screen.getByRole('button', { name: '기간 필터' }));
      await user.click(screen.getByRole('button', { name: '날짜선택' }));
      onFiltersChange.mockClear();

      const fromInput = screen.getByLabelText('시작일');
      fireEvent.change(fromInput, { target: { value: '2026-05-01' } });

      const lastCall = onFiltersChange.mock.calls.at(-1);
      expect(lastCall?.[0]).toMatchObject({ from_date: '2026-05-01' });
    });
  });

  // --- 검색 입력 (디바운스 적용) ---

  describe('검색', () => {
    it('검색 input에 aria-label "이름·전화 검색" 이 설정된다', () => {
      render(<ListFilterBar {...createDefaultProps()} />);
      expect(
        screen.getByRole('searchbox', { name: '이름·전화 검색' }),
      ).toBeInTheDocument();
    });

    it('isLoading=true 라도 검색 input은 비활성화되지 않는다 (IME 끊김 방지)', () => {
      render(
        <ListFilterBar {...createDefaultProps({ isLoading: true })} />,
      );
      const input = screen.getByPlaceholderText('이름·전화 검색');
      expect(input).not.toBeDisabled();
    });

    it('isLoading=true 일 때 검색 spinner 가 표시된다', () => {
      render(
        <ListFilterBar {...createDefaultProps({ isLoading: true })} />,
      );
      expect(screen.getByTestId('search-spinner')).toBeInTheDocument();
    });

    it('250ms 이내에 추가 입력이 오면 onFiltersChange 가 호출되지 않는다', () => {
      const onFiltersChange = vi.fn();
      render(
        <ListFilterBar {...createDefaultProps({ onFiltersChange })} />,
      );

      const input = screen.getByPlaceholderText('이름·전화 검색');
      fireEvent.change(input, { target: { value: '홍' } });

      act(() => {
        vi.advanceTimersByTime(249);
      });

      expect(onFiltersChange).not.toHaveBeenCalled();
    });

    it('250ms 정지 후 onFiltersChange 가 마지막 입력값으로 한 번만 호출된다', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <ListFilterBar {...createDefaultProps({ onFiltersChange })} />,
      );

      const input = screen.getByPlaceholderText('이름·전화 검색');
      await user.type(input, '홍길동');

      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(onFiltersChange).toHaveBeenCalledTimes(1);
      expect(onFiltersChange.mock.calls[0][0]).toMatchObject({
        search: '홍길동',
      });
    });

    it('공백만 입력하면 디바운스 후 search 가 undefined 로 전달된다 (trim)', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <ListFilterBar
          {...createDefaultProps({
            filters: {
              search: '홍',
              from_date: '2026-04-16',
              to_date: '2026-04-23',
            },
            onFiltersChange,
          })}
        />,
      );

      const input = screen.getByPlaceholderText('이름·전화 검색');
      await user.clear(input);
      await user.type(input, '   ');

      act(() => {
        vi.advanceTimersByTime(250);
      });

      const lastCall = onFiltersChange.mock.calls.at(-1);
      expect(lastCall?.[0].search).toBeUndefined();
    });

    it('비워서 빈 문자열이 되면 디바운스 후 search 가 undefined 로 전달된다', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <ListFilterBar
          {...createDefaultProps({
            filters: {
              search: '홍',
              from_date: '2026-04-16',
              to_date: '2026-04-23',
            },
            onFiltersChange,
          })}
        />,
      );

      const input = screen.getByPlaceholderText('이름·전화 검색');
      await user.clear(input);

      act(() => {
        vi.advanceTimersByTime(250);
      });

      const lastCall = onFiltersChange.mock.calls.at(-1);
      expect(lastCall?.[0].search).toBeUndefined();
    });
  });

  // --- 드롭다운 공통 ---

  describe('드롭다운 공통 동작', () => {
    it('하나의 드롭다운을 열면 다른 드롭다운이 닫힌다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: '건물 필터' }));
      expect(screen.getByRole('button', { name: '전체 건물' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '기간 필터' }));
      expect(
        screen.queryByRole('button', { name: '전체 건물' }),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('date-dropdown')).toBeInTheDocument();
    });

    it('같은 버튼을 다시 클릭하면 드롭다운이 닫힌다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: '건물 필터' }));
      expect(screen.getByRole('button', { name: '전체 건물' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '건물 필터' }));
      expect(
        screen.queryByRole('button', { name: '전체 건물' }),
      ).not.toBeInTheDocument();
    });

    it('외부 클릭 시 드롭다운이 닫힌다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <div>
          <div data-testid="outside">외부</div>
          <ListFilterBar {...createDefaultProps()} />
        </div>,
      );

      await user.click(screen.getByRole('button', { name: '건물 필터' }));
      expect(screen.getByRole('button', { name: '전체 건물' })).toBeInTheDocument();

      await user.click(screen.getByTestId('outside'));
      expect(
        screen.queryByRole('button', { name: '전체 건물' }),
      ).not.toBeInTheDocument();
    });
  });
});
