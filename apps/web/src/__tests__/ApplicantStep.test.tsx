import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicantStep } from '../components/booking/steps/ApplicantStep';
import type { ApplicantData } from '../types/booking';
import * as useDepartmentsModule from '../hooks/useDepartments';

vi.mock('../hooks/useDepartments');

const mockUseDepartments = vi.mocked(useDepartmentsModule.useDepartments);

const departments = [
  {
    id: 1,
    name: '청년부',
    display_order: 1,
    pastor: { id: 1, name: '김목사', title: '목사' },
    teams: [
      { id: 11, name: '1청년', pastor: null, pastor_display: '김목사 목사' },
      { id: 12, name: '2청년', pastor: null, pastor_display: '김목사 목사' },
    ],
  },
  { id: 2, name: '기타', display_order: 99, pastor: null, teams: [] },
];

const filled: ApplicantData = {
  name: '홍길동',
  phone: '010-1234-5678',
  departmentId: 1,
  departmentName: '청년부',
  teamId: 11,
  teamName: '1청년',
  customTeamName: null,
  pastorDisplay: '김목사 목사',
};

describe('ApplicantStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDepartments.mockReturnValue({
      departments,
      isLoading: false,
      error: null,
    });
  });

  it('value=null 초기 렌더: 이름/연락처 input 과 부서 chip 표시', () => {
    render(<ApplicantStep value={null} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('홍길동')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('010-0000-0000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '청년부' })).toBeInTheDocument();
  });

  it('value 가 주어지면 input/부서 chip 모두 초기값으로 hydrate', () => {
    render(<ApplicantStep value={filled} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument();
    expect(screen.getByDisplayValue('010-1234-5678')).toBeInTheDocument();
  });

  it('이름·연락처 사전 입력 + 부서·팀 선택 → onChange 콜백 호출', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // 이름과 연락처를 사전 hydrate (이미 valid 상태에서 단체만 선택)
    const seed: ApplicantData = {
      ...filled,
      teamId: null,
      teamName: '',
      pastorDisplay: '',
    };
    render(<ApplicantStep value={seed} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '청년부' }));
    await user.click(screen.getByRole('button', { name: '1청년' }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '홍길동',
          phone: '010-1234-5678',
          departmentId: 1,
          teamId: 11,
        }),
      );
    });
  });

  it('필수 필드 누락 시 onChange 호출되지 않음', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApplicantStep value={null} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText('홍길동'), '홍길동');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('잘못된 전화 형식 (불완전) 이면 유효 신청자 데이터가 전파되지 않음', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // 이름은 있지만 phone 불완전
    const seed: ApplicantData = {
      ...filled,
      phone: '010-1234',
      teamId: null,
      teamName: '',
      pastorDisplay: '',
    };
    render(<ApplicantStep value={seed} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '청년부' }));
    await user.click(screen.getByRole('button', { name: '1청년' }));

    expect(onChange).not.toHaveBeenCalledWith(
      expect.objectContaining({ teamId: 11 }),
    );
  });

  it('유효 입력 후 이름을 비우면 onChange(null) 호출 (신청 차단)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApplicantStep value={filled} onChange={onChange} />);

    await user.clear(screen.getByDisplayValue('홍길동'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });
});
