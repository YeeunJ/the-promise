import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Reservation, Space } from '../types';

// Mock modules before imports
vi.mock('axios');
vi.mock('../utils/formatDatetime', async () => {
  const actual = await vi.importActual('../utils/formatDatetime');
  return {
    ...actual,
    getKSTDateString: vi.fn(() => '2026-04-16'),
  };
});

import axios from 'axios';
import AdminPage from '../pages/AdminPage';
import { ADMIN_TOKEN_KEY } from '../lib/constants';

const mockedAxios = vi.mocked(axios, true);

function makeSpace(overrides: Partial<Space> = {}): Space {
  return {
    id: 1,
    name: '세미나실',
    floor: 2,
    capacity: 20,
    description: null,
    building: { id: 1, name: '본관', description: null },
    ...overrides,
  };
}

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 1,
    space: makeSpace(),
    applicant_name: '홍길동',
    applicant_phone: '010-1234-5678',
    applicant_team: '청년부',
    team: null,
    custom_team_name: null,
    leader_phone: '010-8765-4321',
    headcount: 10,
    purpose: '정기모임',
    start_datetime: '2026-04-16T10:00:00+09:00',
    end_datetime: '2026-04-16T12:00:00+09:00',
    status: 'confirmed',
    admin_note: null,
    created_at: '2026-04-01T09:00:00+09:00',
    ...overrides,
  };
}

function setupLoggedIn(): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, 'test-token');
}

function mockFetchReservations(reservations: Reservation[] = []): void {
  mockedAxios.get.mockResolvedValueOnce({ data: reservations });
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // --- 기본 렌더링 ---

  it('로그인 전에는 AdminLoginForm을 렌더링한다', () => {
    render(<AdminPage />);
    expect(screen.getByText('관리자 로그인')).toBeInTheDocument();
  });

  it('로그인 후 타이틀이 "가나안교회 관리자"로 표시된다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    expect(screen.getByText('가나안교회 관리자')).toBeInTheDocument();
  });

  it('메인 영역이 max-w-[1920px] 클래스를 가진다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    const { container } = render(<AdminPage />);
    const main = container.querySelector('main');
    expect(main?.className).toContain('max-w-[1920px]');
  });

  // --- selectedDate 초기값 ---

  it('selectedDate가 오늘 날짜(getKSTDateString)로 초기화된다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    const { container } = render(<AdminPage />);
    // CalendarGrid에 selectedDate="2026-04-16"이 전달되어
    // 해당 날짜 셀에 ring-brand-secondary가 적용됨
    await waitFor(() => {
      const selectedCell = container.querySelector('.ring-brand-secondary');
      expect(selectedCell).toBeInTheDocument();
    });
  });

  // --- 뷰 토글 ---

  it('기본 뷰는 달력 보기이다', () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    const calendarBtn = screen.getByRole('button', { name: '달력 보기' });
    // 활성 버튼은 bg-brand-primary 스타일
    expect(calendarBtn.className).toContain('bg-brand-primary');
  });

  it('리스트 보기 버튼 클릭 시 뷰가 전환된다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    const user = userEvent.setup();

    const listBtn = screen.getByRole('button', { name: '리스트 보기' });
    await user.click(listBtn);

    // 리스트 보기 활성
    expect(listBtn.className).toContain('bg-brand-primary');
    // 달력 보기 비활성
    const calendarBtn = screen.getByRole('button', { name: '달력 보기' });
    expect(calendarBtn.className).not.toContain('bg-brand-primary');
  });

  it('달력 보기에서 월 네비게이션이 표시된다', () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    expect(screen.getByText('◀')).toBeInTheDocument();
    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('리스트 보기에서 월 네비게이션이 숨겨진다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '리스트 보기' }));

    // 월 네비게이션과 월 표시가 숨겨짐
    expect(screen.queryByText('◀')).not.toBeInTheDocument();
    expect(screen.queryByText('▶')).not.toBeInTheDocument();
  });

  // --- 달력 보기 레이아웃 ---

  it('달력 보기에서 50:50 flex 레이아웃으로 CalendarGrid와 CalendarSidePanel을 표시한다', async () => {
    setupLoggedIn();
    const reservations = [makeReservation()];
    mockFetchReservations(reservations);
    render(<AdminPage />);

    await waitFor(() => {
      // CalendarGrid 렌더링 확인 (요일 헤더)
      expect(screen.getByText('일')).toBeInTheDocument();
      // CalendarSidePanel 렌더링 확인 (오늘 날짜 예약 표시)
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });
  });

  // --- 리스트 보기 레이아웃 ---

  it('리스트 보기에서 ListFilterBar와 ListTable을 렌더링한다', async () => {
    setupLoggedIn();
    const reservations = [makeReservation()];
    mockFetchReservations(reservations);
    render(<AdminPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '리스트 보기' }));

    await waitFor(() => {
      // ListTable 테이블 헤더 확인
      expect(screen.getByText('이름')).toBeInTheDocument();
      // ListFilterBar 존재 확인 (장소 필터 등)
      expect(screen.getByText('장소')).toBeInTheDocument();
    });
  });

  // --- 스켈레톤 UI ---

  it('로딩 중 스켈레톤 UI를 표시한다 (스피너 대신)', () => {
    setupLoggedIn();
    // axios.get을 resolve하지 않아 로딩 상태 유지
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    const { container } = render(<AdminPage />);

    // animate-pulse 스켈레톤 존재
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);

    // 기존 스피너(animate-spin) 없음
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeNull();
  });

  // --- 취소 처리 ---

  it('CancelDialog가 cancelTargetId 설정 시 표시된다', async () => {
    setupLoggedIn();
    const reservations = [makeReservation({ status: 'confirmed' })];
    mockFetchReservations(reservations);
    render(<AdminPage />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });

    // CalendarSidePanel에서 취소하기 버튼 클릭
    const cancelBtns = screen.getAllByRole('button', { name: '취소하기' });
    await user.click(cancelBtns[0]);

    // CancelDialog 모달 표시
    expect(screen.getByText('이 예약을 취소하시겠습니까?')).toBeInTheDocument();
  });

  it('CancelDialog 확인 시 취소 API를 호출하고 성공 토스트를 표시한다', async () => {
    setupLoggedIn();
    const reservations = [makeReservation({ id: 42, status: 'confirmed' })];
    mockFetchReservations(reservations);
    render(<AdminPage />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });

    // 취소하기 버튼 클릭
    const cancelBtns = screen.getAllByRole('button', { name: '취소하기' });
    await user.click(cancelBtns[0]);

    // admin note 입력 후 확인
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    mockFetchReservations([]); // 취소 후 재조회

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '테스트 취소 사유');

    // CancelDialog 내부의 "취소하기" 버튼 클릭
    const dialogCancelBtns = screen.getAllByRole('button', { name: '취소하기' });
    await user.click(dialogCancelBtns[dialogCancelBtns.length - 1]);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/admin/reservations/42/cancel/'),
        { admin_note: '테스트 취소 사유' },
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });

    // 성공 토스트 표시
    await waitFor(() => {
      expect(screen.getByText('예약이 취소되었습니다.')).toBeInTheDocument();
    });
  });

  // --- 토스트 에러 알림 ---

  it('예약 조회 실패 시 에러 토스트를 표시한다', async () => {
    setupLoggedIn();
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    render(<AdminPage />);

    await waitFor(() => {
      expect(
        screen.getByText('예약 목록을 불러오는 데 실패했습니다.'),
      ).toBeInTheDocument();
    });
  });

  // --- fetchError 제거 확인 ---

  it('fetchError 인라인 에러 배너가 더 이상 렌더링되지 않는다', async () => {
    setupLoggedIn();
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(<AdminPage />);

    await waitFor(() => {
      // 토스트는 표시되지만 기존 인라인 에러 배너(bg-[#DC2626]/10)는 없어야 함
      const errorBanner = container.querySelector('[class*="DC2626"]');
      expect(errorBanner).toBeNull();
    });
  });

  // --- TASK 1: 달력 헤더 형식 ---

  it('달력 헤더가 "{year}년 {month}월" 한 줄 형식으로 표시된다', () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    expect(screen.getByText('2026년 4월')).toBeInTheDocument();
  });

  // --- TASK 2: CalendarGrid confirmed 전용 ---

  it('CalendarGrid에는 confirmed 예약 칩만 표시된다', async () => {
    setupLoggedIn();
    const reservations = [
      makeReservation({
        id: 1,
        status: 'confirmed',
        applicant_team: '확정부서',
        start_datetime: '2026-04-16T10:00:00+09:00',
      }),
      makeReservation({
        id: 2,
        status: 'cancelled',
        applicant_team: '취소부서',
        start_datetime: '2026-04-16T14:00:00+09:00',
      }),
    ];
    mockFetchReservations(reservations);
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('확정부서 - 세미나실')).toBeInTheDocument();
      expect(screen.queryByText('취소부서 - 세미나실')).toBeNull();
    });
  });

  // --- TASK 5: 월 이동 시 selectedDate 자동 설정 ---

  it('이전 달로 이동 시 해당 달 1일이 selectedDate로 설정된다', async () => {
    setupLoggedIn();
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<AdminPage />);
    const user = userEvent.setup();

    await user.click(screen.getByText('◀'));

    await waitFor(() => {
      expect(screen.getByText(/2026\.03\.01/)).toBeInTheDocument();
    });
  });

  it('다음 달로 이동 시 해당 달 1일이 selectedDate로 설정된다', async () => {
    setupLoggedIn();
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<AdminPage />);
    const user = userEvent.setup();

    await user.click(screen.getByText('▶'));

    await waitFor(() => {
      expect(screen.getByText(/2026\.05\.01/)).toBeInTheDocument();
    });
  });

  // --- 로그아웃 ---

  it('로그아웃 클릭 시 로그인 폼으로 돌아간다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '로그아웃' }));
    expect(screen.getByText('관리자 로그인')).toBeInTheDocument();
  });
});
