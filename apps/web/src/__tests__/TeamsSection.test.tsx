import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('axios');

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import axios from 'axios';
import { TeamsSection } from '../components/admin/teams/TeamsSection';
import { __resetDepartmentsCacheForTest } from '../hooks/useDepartments';
import type { AdminTeam, ApiDepartment } from '../types';

const mockedAxios = vi.mocked(axios, true);

function makeTeam(overrides: Partial<AdminTeam> = {}): AdminTeam {
  return {
    id: 1,
    name: '대림1',
    department: { id: 1, name: '1교구' },
    pastor: { id: 1, name: '이상윤', title: '목사' },
    leader_phone: '010-1111-2222',
    is_active: true,
    created_at: '2026-04-17T00:00:00+09:00',
    ...overrides,
  };
}

const mockDepartments: ApiDepartment[] = [
  { id: 1, name: '1교구', display_order: 1, pastor: null, teams: [] },
  { id: 2, name: '2교구', display_order: 2, pastor: null, teams: [] },
];

function jsonOk(data: unknown): Promise<Response> {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response);
}

describe('TeamsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetDepartmentsCacheForTest();
    mockFetch.mockReset();
    mockFetch.mockReturnValue(jsonOk(mockDepartments));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('마운트 시 팀 목록을 가져와 테이블에 표시한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [makeTeam()] });

    render(<TeamsSection authToken="t" showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('대림1')).toBeInTheDocument();
    });
    // '1교구' 는 chip 필터 button 과 테이블 cell 양쪽에 등장 가능
    expect(screen.getAllByText('1교구').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('이상윤 목사')).toBeInTheDocument();
  });

  it('비활성(is_active=false) 팀은 목록에서 숨긴다', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        makeTeam({ id: 1, name: '활성팀' }),
        makeTeam({ id: 2, name: '비활성팀', is_active: false }),
      ],
    });

    render(<TeamsSection authToken="t" showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('활성팀')).toBeInTheDocument();
    });
    expect(screen.queryByText('비활성팀')).not.toBeInTheDocument();
  });

  it('"+ 팀 추가" 클릭 → 모달 → 제출 → POST 호출 + 토스트 + refetch', async () => {
    // 초기 목록 빈 배열 → 추가 후 1건
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    mockedAxios.post.mockResolvedValueOnce({ data: makeTeam({ name: '신규팀' }) });
    mockedAxios.get.mockResolvedValueOnce({
      data: [makeTeam({ id: 99, name: '신규팀' })],
    });
    const showToast = vi.fn();

    render(<TeamsSection authToken="t" showToast={showToast} />);
    await waitFor(() => {
      expect(screen.getByText('등록된 팀이 없습니다.')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '+ 팀 추가' }));
    expect(
      screen.getByRole('heading', { name: '팀 추가' }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/팀명/), '신규팀');
    await user.selectOptions(screen.getByLabelText(/부서/), '1');
    await user.type(screen.getByLabelText(/연락처/), '010-9999-8888');
    await user.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/teams/'),
      {
        name: '신규팀',
        department: 1,
        pastor: null,
        leader_phone: '010-9999-8888',
      },
      expect.objectContaining({
        headers: { Authorization: 'Token t' },
      }),
    );
    expect(showToast).toHaveBeenCalledWith('팀이 추가되었습니다.', 'success');
    await waitFor(() => {
      expect(screen.getByText('신규팀')).toBeInTheDocument();
    });
  });

  it('행 "수정" 클릭 → edit 모드 모달이 열린다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [makeTeam()] });
    render(<TeamsSection authToken="t" showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('대림1')).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', { name: '대림1 수정' }),
    );
    expect(
      screen.getByRole('heading', { name: '팀 수정' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/팀명/)).toHaveValue('대림1');
  });

  it('행 "삭제" → 확인 다이얼로그 → 확인 → DELETE 호출 + 토스트 + refetch', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [makeTeam()] });
    mockedAxios.delete.mockResolvedValueOnce({ data: undefined });
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const showToast = vi.fn();

    render(<TeamsSection authToken="t" showToast={showToast} />);
    await waitFor(() => {
      expect(screen.getByText('대림1')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '대림1 삭제' }));
    expect(
      screen.getByRole('heading', {
        name: "팀 '대림1' 을(를) 삭제하시겠습니까?",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/teams/1/'),
      expect.objectContaining({
        headers: { Authorization: 'Token t' },
      }),
    );
    expect(showToast).toHaveBeenCalledWith('팀이 삭제되었습니다.', 'success');
    await waitFor(() => {
      expect(screen.getByText('등록된 팀이 없습니다.')).toBeInTheDocument();
    });
  });
});
