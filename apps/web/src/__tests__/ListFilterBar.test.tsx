import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListFilterBar } from '../components/admin/ListFilterBar';
import type { Reservation, Space } from '../types';

// --- 테스트 데이터 ---

const mockSpaces: Space[] = [
  {
    id: 1,
    building: { id: 1, name: '본당', description: null },
    name: '대예배실',
    floor: 1,
    capacity: 500,
    description: null,
  },
  {
    id: 2,
    building: { id: 1, name: '본당', description: null },
    name: '소예배실',
    floor: 2,
    capacity: 100,
    description: null,
  },
  {
    id: 3,
    building: { id: 2, name: '가나안홀', description: null },
    name: '세미나실',
    floor: 1,
    capacity: 50,
    description: null,
  },
  {
    id: 4,
    building: { id: 3, name: '무지개홀', description: null },
    name: '다목적실',
    floor: 1,
    capacity: 80,
    description: null,
  },
];

const mockReservations: Reservation[] = [
  {
    id: 1,
    space: mockSpaces[0],
    applicant_name: '홍길동',
    applicant_phone: '010-1234-5678',
    applicant_team: '예배부',
    team: null,
    custom_team_name: null,
    leader_phone: '010-0000-0000',
    headcount: 100,
    purpose: '예배',
    start_datetime: '2026-04-16T10:00:00+09:00',
    end_datetime: '2026-04-16T12:00:00+09:00',
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-04-10T09:00:00+09:00',
  },
  {
    id: 2,
    space: mockSpaces[2],
    applicant_name: '김철수',
    applicant_phone: '010-2222-3333',
    applicant_team: '교육부',
    team: null,
    custom_team_name: null,
    leader_phone: '010-0000-0000',
    headcount: 30,
    purpose: '세미나',
    start_datetime: '2026-04-17T14:00:00+09:00',
    end_datetime: '2026-04-17T16:00:00+09:00',
    status: 'pending',
    admin_note: null,
    created_at: '2026-04-11T09:00:00+09:00',
  },
  {
    id: 3,
    space: mockSpaces[3],
    applicant_name: '이영희',
    applicant_phone: '010-4444-5555',
    applicant_team: '청년부',
    team: null,
    custom_team_name: null,
    leader_phone: '010-0000-0000',
    headcount: 50,
    purpose: '모임',
    start_datetime: '2026-04-18T09:00:00+09:00',
    end_datetime: '2026-04-18T11:00:00+09:00',
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-04-12T09:00:00+09:00',
  },
];

function createDefaultProps(overrides: Partial<Parameters<typeof ListFilterBar>[0]> = {}) {
  return {
    reservations: mockReservations,
    spaceFilter: new Set<number>(),
    onSpaceFilterChange: vi.fn(),
    datePreset: '1w' as const,
    onDatePresetChange: vi.fn(),
    dateRange: { from: '2026-04-16', to: '2026-04-23' },
    onDateRangeChange: vi.fn(),
    teamFilter: new Set<string>(),
    onTeamFilterChange: vi.fn(),
    spaces: mockSpaces,
    ...overrides,
  };
}

describe('ListFilterBar', () => {
  // --- 기본 렌더링 ---

  it('세 개의 필터 버튼이 렌더링된다', () => {
    render(<ListFilterBar {...createDefaultProps()} />);
    expect(screen.getByRole('button', { name: /장소/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1주 이내/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /그룹/i })).toBeInTheDocument();
  });

  // --- 장소 필터 드롭다운 ---

  describe('장소 필터', () => {
    it('장소 버튼 클릭 시 드롭다운이 열린다', async () => {
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /장소/i }));

      expect(screen.getByText('전체 장소')).toBeInTheDocument();
    });

    it('드롭다운에 건물별로 그룹핑된 장소가 표시된다', async () => {
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /장소/i }));

      expect(screen.getByText('본당')).toBeInTheDocument();
      expect(screen.getByText('가나안홀')).toBeInTheDocument();
      expect(screen.getByText('무지개홀')).toBeInTheDocument();
      expect(screen.getByText('대예배실')).toBeInTheDocument();
      expect(screen.getByText('소예배실')).toBeInTheDocument();
      expect(screen.getByText('세미나실')).toBeInTheDocument();
      expect(screen.getByText('다목적실')).toBeInTheDocument();
    });

    it('개별 장소 체크박스 클릭 시 onSpaceFilterChange가 호출된다', async () => {
      const onSpaceFilterChange = vi.fn();
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps({ onSpaceFilterChange })} />);

      await user.click(screen.getByRole('button', { name: /장소/i }));
      await user.click(screen.getByLabelText('대예배실'));

      expect(onSpaceFilterChange).toHaveBeenCalledWith(new Set([1]));
    });

    it('전체선택 클릭 시 모든 장소가 선택된다', async () => {
      const onSpaceFilterChange = vi.fn();
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps({ onSpaceFilterChange })} />);

      await user.click(screen.getByRole('button', { name: /장소/i }));
      await user.click(screen.getByTestId('space-select-all'));

      expect(onSpaceFilterChange).toHaveBeenCalledWith(new Set([1, 2, 3, 4]));
    });

    it('전체해제 클릭 시 모든 장소가 해제된다', async () => {
      const onSpaceFilterChange = vi.fn();
      const user = userEvent.setup();
      render(
        <ListFilterBar
          {...createDefaultProps({
            spaceFilter: new Set([1, 2, 3, 4]),
            onSpaceFilterChange,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /장소/i }));
      await user.click(screen.getByTestId('space-deselect-all'));

      expect(onSpaceFilterChange).toHaveBeenCalledWith(new Set());
    });

    it('건물별 전체선택 클릭 시 해당 건물 장소만 추가된다', async () => {
      const onSpaceFilterChange = vi.fn();
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps({ onSpaceFilterChange })} />);

      await user.click(screen.getByRole('button', { name: /장소/i }));
      await user.click(screen.getByTestId('building-select-본당'));

      expect(onSpaceFilterChange).toHaveBeenCalledWith(new Set([1, 2]));
    });

    it('선택된 장소 개수가 버튼에 표시된다', () => {
      render(
        <ListFilterBar
          {...createDefaultProps({ spaceFilter: new Set([1, 3]) })}
        />,
      );

      expect(screen.getByRole('button', { name: /장소.*2/i })).toBeInTheDocument();
    });
  });

  // --- 날짜 필터 ---

  describe('날짜 필터', () => {
    it('날짜 버튼 클릭 시 프리셋 옵션이 표시된다', async () => {
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /1주 이내/i }));

      expect(screen.getByText('1주 이내')).toBeInTheDocument();
      expect(screen.getByText('2주 이내')).toBeInTheDocument();
      expect(screen.getByText('한달 이내')).toBeInTheDocument();
      expect(screen.getByText('날짜선택')).toBeInTheDocument();
    });

    it('프리셋 선택 시 onDatePresetChange가 호출된다', async () => {
      const onDatePresetChange = vi.fn();
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps({ onDatePresetChange })} />);

      await user.click(screen.getByRole('button', { name: /1주 이내/i }));
      await user.click(screen.getByText('2주 이내'));

      expect(onDatePresetChange).toHaveBeenCalledWith('2w');
    });

    it('프리셋 선택 시 onDateRangeChange가 자동 계산된 날짜로 호출된다', async () => {
      const onDateRangeChange = vi.fn();
      const onDatePresetChange = vi.fn();
      const user = userEvent.setup();
      render(
        <ListFilterBar
          {...createDefaultProps({ onDateRangeChange, onDatePresetChange })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /1주 이내/i }));
      await user.click(screen.getByText('2주 이내'));

      expect(onDateRangeChange).toHaveBeenCalled();
      const callArg = onDateRangeChange.mock.calls[0][0];
      expect(callArg).toHaveProperty('from');
      expect(callArg).toHaveProperty('to');
    });

    it('버튼 라벨이 선택된 프리셋명으로 표시된다', () => {
      render(
        <ListFilterBar {...createDefaultProps({ datePreset: '2w' })} />,
      );

      expect(screen.getByRole('button', { name: /2주 이내/i })).toBeInTheDocument();
    });

    it('"날짜선택" 프리셋일 때 커스텀 날짜 입력 필드가 표시된다', async () => {
      const user = userEvent.setup();
      render(
        <ListFilterBar {...createDefaultProps({ datePreset: 'custom' })} />,
      );

      await user.click(screen.getByRole('button', { name: /날짜선택/i }));

      expect(screen.getByLabelText('시작일')).toBeInTheDocument();
      expect(screen.getByLabelText('종료일')).toBeInTheDocument();
    });
  });

  // --- 그룹(부서) 필터 ---

  describe('그룹 필터', () => {
    it('그룹 버튼 클릭 시 예약 데이터에서 추출된 팀 목록이 표시된다', async () => {
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /그룹/i }));

      expect(screen.getByLabelText('예배부')).toBeInTheDocument();
      expect(screen.getByLabelText('교육부')).toBeInTheDocument();
      expect(screen.getByLabelText('청년부')).toBeInTheDocument();
    });

    it('팀 체크박스 클릭 시 onTeamFilterChange가 호출된다', async () => {
      const onTeamFilterChange = vi.fn();
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps({ onTeamFilterChange })} />);

      await user.click(screen.getByRole('button', { name: /그룹/i }));
      await user.click(screen.getByLabelText('예배부'));

      expect(onTeamFilterChange).toHaveBeenCalledWith(new Set(['예배부']));
    });

    it('이미 선택된 팀을 클릭하면 해제된다', async () => {
      const onTeamFilterChange = vi.fn();
      const user = userEvent.setup();
      render(
        <ListFilterBar
          {...createDefaultProps({
            teamFilter: new Set(['예배부']),
            onTeamFilterChange,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /그룹/i }));
      await user.click(screen.getByLabelText('예배부'));

      expect(onTeamFilterChange).toHaveBeenCalledWith(new Set());
    });
  });

  // --- 드롭다운 공통 동작 ---

  describe('드롭다운 공통 동작', () => {
    it('하나의 드롭다운을 열면 다른 드롭다운이 닫힌다', async () => {
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps()} />);

      // 장소 드롭다운 열기
      await user.click(screen.getByRole('button', { name: /장소/i }));
      expect(screen.getByText('전체 장소')).toBeInTheDocument();

      // 그룹 드롭다운 열기 → 장소 드롭다운 닫힘
      await user.click(screen.getByRole('button', { name: /그룹/i }));
      expect(screen.queryByText('전체 장소')).not.toBeInTheDocument();
      expect(screen.getByLabelText('예배부')).toBeInTheDocument();
    });

    it('같은 버튼을 다시 클릭하면 드롭다운이 닫힌다', async () => {
      const user = userEvent.setup();
      render(<ListFilterBar {...createDefaultProps()} />);

      await user.click(screen.getByRole('button', { name: /장소/i }));
      expect(screen.getByText('전체 장소')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /장소/i }));
      expect(screen.queryByText('전체 장소')).not.toBeInTheDocument();
    });

    it('외부 클릭 시 드롭다운이 닫힌다', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <div data-testid="outside">외부 영역</div>
          <ListFilterBar {...createDefaultProps()} />
        </div>,
      );

      await user.click(screen.getByRole('button', { name: /장소/i }));
      expect(screen.getByText('전체 장소')).toBeInTheDocument();

      await user.click(screen.getByTestId('outside'));
      expect(screen.queryByText('전체 장소')).not.toBeInTheDocument();
    });
  });
});
