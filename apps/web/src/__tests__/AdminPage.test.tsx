import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
vi.mock('../hooks/useSpaceOptions', () => ({
  useSpaceOptions: vi.fn(() => ({
    spaces: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));
// 섹션 컴포넌트는 자체 테스트에서 검증. AdminPage 는 마운트/언마운트만 확인
vi.mock('../components/admin/teams/TeamsSection', () => ({
  TeamsSection: () => <div data-testid="teams-section-mock">팀 섹션</div>,
}));
vi.mock('../components/admin/buildings/BuildingsSection', () => ({
  BuildingsSection: () => (
    <div data-testid="buildings-section-mock">건물 섹션</div>
  ),
}));
vi.mock('../components/admin/spaces/SpacesSection', () => ({
  SpacesSection: () => <div data-testid="spaces-section-mock">공간 섹션</div>,
}));

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

function paginated(reservations: Reservation[]): {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: Reservation[];
} {
  return {
    count: reservations.length,
    page: 1,
    page_size: 100,
    total_pages: reservations.length === 0 ? 1 : 1,
    results: reservations,
  };
}

function mockFetchReservations(reservations: Reservation[] = []): void {
  mockedAxios.get.mockResolvedValueOnce({ data: paginated(reservations) });
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-04-16T09:00:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- 기본 렌더링 ---

  it('로그인 전에는 AdminLoginForm을 렌더링한다', () => {
    render(<AdminPage />);
    expect(screen.getByText('관리자 로그인')).toBeInTheDocument();
  });

  it('로그인 후 헤더에 "가나안교회" + "ADMIN" 뱃지가 표시된다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    expect(screen.getByText('가나안교회')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
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
    // 해당 날짜 셀에 ring-primary-dark가 적용됨
    await waitFor(() => {
      const selectedCell = container.querySelector('.ring-primary-dark');
      expect(selectedCell).toBeInTheDocument();
    });
  });

  // --- 뷰 토글 ---

  it('기본 뷰는 달력 보기이다', () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    const calendarBtn = screen.getByRole('button', { name: '달력' });
    expect(calendarBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('리스트 보기 버튼 클릭 시 뷰가 전환된다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    const user = userEvent.setup();

    const listBtn = screen.getByRole('button', { name: '리스트' });
    await user.click(listBtn);

    // 리스트 보기 활성
    expect(listBtn).toHaveAttribute('aria-pressed', 'true');
    // 달력 보기 비활성
    const calendarBtn = screen.getByRole('button', { name: '달력' });
    expect(calendarBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('달력 보기에서 월 네비게이션이 표시된다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    // CalendarGrid 내부 헤더 — fetch 완료 후 렌더
    expect(await screen.findByRole('button', { name: '이전 달' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 달' })).toBeInTheDocument();
  });

  it('리스트 보기에서 월 네비게이션이 숨겨진다', async () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '리스트' }));

    // 리스트 모드에서는 CalendarGrid 자체가 안 그려져서 월 nav도 없음
    expect(screen.queryByRole('button', { name: '이전 달' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음 달' })).not.toBeInTheDocument();
  });

  // --- 달력 보기 레이아웃 ---

  it('달력 보기에서 CalendarGrid 와 AdminSideRail 을 표시한다', async () => {
    setupLoggedIn();
    const reservations = [makeReservation()];
    mockFetchReservations(reservations);
    render(<AdminPage />);

    await waitFor(() => {
      // CalendarGrid 렌더링 확인 (요일 헤더)
      expect(screen.getByText('일')).toBeInTheDocument();
      // SideRail "오늘" 카드에 예약 표시 (오늘 날짜와 일치하는 예약)
      expect(screen.getByText(/홍길동/)).toBeInTheDocument();
    });
  });

  // --- 리스트 보기 레이아웃 ---

  it('리스트 보기에서 ListFilterBar와 ListTable을 렌더링한다', async () => {
    setupLoggedIn();
    const reservations = [makeReservation()];
    mockFetchReservations(reservations);
    render(<AdminPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '리스트' }));

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

  it('CancelDialog가 SideRail 행 → DetailModal 의 "예약 취소" 클릭 시 표시된다', async () => {
    setupLoggedIn();
    const reservations = [makeReservation({ status: 'confirmed' })];
    mockFetchReservations(reservations);
    render(<AdminPage />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/홍길동/)).toBeInTheDocument();
    });

    // SideRail "오늘" 카드의 행 클릭 → DetailModal 열기
    await user.click(screen.getByText(/홍길동/));

    // DetailModal 내 "예약 취소" 버튼 클릭
    const detailCancelBtn = await screen.findByRole('button', { name: '예약 취소' });
    await user.click(detailCancelBtn);

    // CancelDialog 표시
    expect(screen.getByText('이 예약을 취소하시겠습니까?')).toBeInTheDocument();
  });

  it('CancelDialog 확인 시 취소 API를 호출하고 성공 토스트를 표시한다', async () => {
    setupLoggedIn();
    const reservations = [makeReservation({ id: 42, status: 'confirmed' })];
    mockFetchReservations(reservations);
    render(<AdminPage />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/홍길동/)).toBeInTheDocument();
    });

    // SideRail 행 → DetailModal → 예약 취소
    await user.click(screen.getByText(/홍길동/));
    const detailCancelBtn = await screen.findByRole('button', { name: '예약 취소' });
    await user.click(detailCancelBtn);

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

  it('SectionHeader의 subtitle에 "{year}년 {month}월"이 포함된다', () => {
    setupLoggedIn();
    mockFetchReservations();
    render(<AdminPage />);
    expect(screen.getByText(/2026년 4월/)).toBeInTheDocument();
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

  it('이전 달로 이동 시 해당 달 1일이 selectedDate 로 설정된다 (셀 ring 적용)', async () => {
    setupLoggedIn();
    mockedAxios.get.mockResolvedValue({ data: paginated([]) });
    const { container } = render(<AdminPage />);
    const user = userEvent.setup();

    // CalendarGrid 내부 헤더 — fetch 완료 후 등장
    const prevBtn = await screen.findByRole('button', { name: '이전 달' });
    await user.click(prevBtn);

    await waitFor(() => {
      // 이전 달(3월) 1일 셀에 ring-primary-dark 적용 확인
      const selectedCells = container.querySelectorAll('.ring-primary-dark');
      const labels = Array.from(selectedCells).map((el) => el.textContent?.trim() ?? '');
      expect(labels.some((t) => t === '1' || t.startsWith('1'))).toBe(true);
    });
  });

  it('다음 달로 이동 시 해당 달 1일이 selectedDate 로 설정된다 (셀 ring 적용)', async () => {
    setupLoggedIn();
    mockedAxios.get.mockResolvedValue({ data: paginated([]) });
    const { container } = render(<AdminPage />);
    const user = userEvent.setup();

    const nextBtn = await screen.findByRole('button', { name: '다음 달' });
    await user.click(nextBtn);

    await waitFor(() => {
      const selectedCells = container.querySelectorAll('.ring-primary-dark');
      const labels = Array.from(selectedCells).map((el) => el.textContent?.trim() ?? '');
      expect(labels.some((t) => t === '1' || t.startsWith('1'))).toBe(true);
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

  // --- 1.5.3 PR-3B: viewMode 별 endpoint 분리 ---

  describe('viewMode 별 endpoint 호출', () => {
    it('calendar 모드에서 /admin/reservations/ 를 from_date/to_date 와 함께 호출한다', async () => {
      setupLoggedIn();
      mockedAxios.get.mockResolvedValue({ data: paginated([]) });
      render(<AdminPage />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringMatching(/\/admin\/reservations\/$/),
          expect.objectContaining({
            params: expect.objectContaining({
              from_date: '2026-04-01',
              to_date: '2026-04-30',
              page_size: 100,
              ordering: '-start_datetime',
            }),
          }),
        );
      });
    });

    it('list 모드 진입 시 /admin/reservations/current/ 가 호출된다', async () => {
      setupLoggedIn();
      mockedAxios.get.mockResolvedValue({ data: paginated([]) });
      render(<AdminPage />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '리스트' }));

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringMatching(/\/admin\/reservations\/current\/$/),
          expect.objectContaining({
            params: expect.objectContaining({ page: 1, page_size: 20 }),
          }),
        );
      });
    });

    it('list 모드에서 "지난" 탭 클릭 시 /admin/reservations/past/ 호출 + page=1', async () => {
      setupLoggedIn();
      mockedAxios.get.mockResolvedValue({ data: paginated([]) });
      render(<AdminPage />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '리스트' }));
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringMatching(/\/current\/$/),
          expect.anything(),
        );
      });

      await user.click(screen.getByRole('button', { name: '지난' }));

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringMatching(/\/admin\/reservations\/past\/$/),
          expect.objectContaining({
            params: expect.objectContaining({ page: 1 }),
          }),
        );
      });
    });

    it('totalPages 가 1 보다 크면 Pagination 컴포넌트가 노출된다', async () => {
      setupLoggedIn();
      mockedAxios.get.mockResolvedValue({
        data: {
          count: 50,
          page: 1,
          page_size: 20,
          total_pages: 3,
          results: [makeReservation()],
        },
      });
      render(<AdminPage />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '리스트' }));

      await waitFor(() => {
        expect(
          screen.getByRole('navigation', { name: '페이지네이션' }),
        ).toBeInTheDocument();
      });
    });

    it('totalPages 가 1 이면 Pagination 컴포넌트가 노출되지 않는다', async () => {
      setupLoggedIn();
      mockedAxios.get.mockResolvedValue({ data: paginated([]) });
      render(<AdminPage />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: '리스트' }));

      await waitFor(() => {
        expect(screen.getByText(/전체 예약/)).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('navigation', { name: '페이지네이션' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('섹션 탭 전환', () => {
    it('로그인 후 기본 섹션은 예약이고 ReservationsSection 이 렌더된다', async () => {
      setupLoggedIn();
      mockFetchReservations([]);
      render(<AdminPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: '달력' }),
        ).toBeInTheDocument();
      });
      expect(
        screen.queryByTestId('teams-section-mock'),
      ).not.toBeInTheDocument();
    });

    it('"팀" 탭 클릭 시 TeamsSection 이 노출되고 예약 영역은 사라진다', async () => {
      setupLoggedIn();
      mockFetchReservations([]);
      render(<AdminPage />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: '달력' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '팀' }));

      expect(screen.getByTestId('teams-section-mock')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '달력' }),
      ).not.toBeInTheDocument();
    });

    it('"건물" 탭 클릭 시 BuildingsSection 이 노출된다', async () => {
      setupLoggedIn();
      mockFetchReservations([]);
      render(<AdminPage />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: '달력' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '건물' }));

      expect(screen.getByTestId('buildings-section-mock')).toBeInTheDocument();
    });

    it('"공간" 탭 클릭 시 SpacesSection 이 노출된다', async () => {
      setupLoggedIn();
      mockFetchReservations([]);
      render(<AdminPage />);
      const user = userEvent.setup();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: '달력' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '공간' }));

      expect(screen.getByTestId('spaces-section-mock')).toBeInTheDocument();
    });
  });
});
