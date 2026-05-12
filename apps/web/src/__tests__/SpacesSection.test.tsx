import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('axios');

import axios from 'axios';
import { SpacesSection } from '../components/admin/spaces/SpacesSection';
import type { AdminBuilding, AdminSpace } from '../types';

const mockedAxios = vi.mocked(axios, true);

function makeSpace(overrides: Partial<AdminSpace> = {}): AdminSpace {
  return {
    id: 1,
    building: { id: 1, name: '본당', description: null },
    name: '드림홀',
    floor: 3,
    capacity: 500,
    description: null,
    is_active: true,
    created_at: '2026-03-29T00:00:00+09:00',
    ...overrides,
  };
}

function makeBuilding(overrides: Partial<AdminBuilding> = {}): AdminBuilding {
  return {
    id: 1,
    name: '본당',
    description: null,
    is_active: true,
    created_at: '2026-03-29T00:00:00+09:00',
    ...overrides,
  };
}

// /admin/spaces/ 와 /admin/buildings/ 호출 순서를 URL 기준으로 분기
function setupGetMock(spaces: AdminSpace[], buildings: AdminBuilding[]): void {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url.includes('/admin/spaces/')) {
      return Promise.resolve({ data: spaces });
    }
    if (url.includes('/admin/buildings/')) {
      return Promise.resolve({ data: buildings });
    }
    return Promise.reject(new Error(`unexpected url: ${url}`));
  });
}

describe('SpacesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('마운트 시 공간/건물 목록을 가져와 테이블에 표시한다', async () => {
    setupGetMock([makeSpace()], [makeBuilding()]);

    render(<SpacesSection authToken="t" showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('드림홀')).toBeInTheDocument();
    });
    expect(screen.getByText('본당')).toBeInTheDocument();
    expect(screen.getByText('3층')).toBeInTheDocument();
    expect(screen.getByText('500명')).toBeInTheDocument();
  });

  it('비활성 공간은 목록에서 숨긴다', async () => {
    setupGetMock(
      [
        makeSpace({ id: 1, name: '활성공간' }),
        makeSpace({ id: 2, name: '비활성공간', is_active: false }),
      ],
      [makeBuilding()],
    );

    render(<SpacesSection authToken="t" showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('활성공간')).toBeInTheDocument();
    });
    expect(screen.queryByText('비활성공간')).not.toBeInTheDocument();
  });

  it('건물이 0개면 "+ 공간 추가" 버튼이 비활성화된다', async () => {
    setupGetMock([], []);

    render(<SpacesSection authToken="t" showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('등록된 공간이 없습니다.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: '+ 공간 추가' })).toBeDisabled();
  });

  it('"+ 공간 추가" → 모달 → 제출 → POST + 토스트 + refetch', async () => {
    setupGetMock([], [makeBuilding()]);
    mockedAxios.post.mockResolvedValueOnce({
      data: makeSpace({ id: 99, name: '신규공간' }),
    });
    // refetch 시 새 데이터
    const showToast = vi.fn();

    render(<SpacesSection authToken="t" showToast={showToast} />);
    await waitFor(() => {
      expect(screen.getByText('등록된 공간이 없습니다.')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '+ 공간 추가' }));
    expect(
      screen.getByRole('heading', { name: '공간 추가' }),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/건물/), '1');
    await user.type(screen.getByLabelText(/공간명/), '신규공간');
    // refetch 시 새 데이터로 mock 갱신
    setupGetMock(
      [makeSpace({ id: 99, name: '신규공간', floor: null, capacity: null })],
      [makeBuilding()],
    );
    await user.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/spaces/'),
      {
        building: 1,
        name: '신규공간',
        floor: null,
        capacity: null,
        description: null,
      },
      expect.objectContaining({
        headers: { Authorization: 'Token t' },
      }),
    );
    expect(showToast).toHaveBeenCalledWith('공간이 추가되었습니다.', 'success');
    await waitFor(() => {
      expect(screen.getByText('신규공간')).toBeInTheDocument();
    });
  });

  it('행 "삭제" → 확인 → DELETE 호출 + 토스트 + refetch', async () => {
    setupGetMock([makeSpace()], [makeBuilding()]);
    mockedAxios.delete.mockResolvedValueOnce({ data: undefined });
    const showToast = vi.fn();

    render(<SpacesSection authToken="t" showToast={showToast} />);
    await waitFor(() => {
      expect(screen.getByText('드림홀')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '드림홀 삭제' }));
    expect(
      screen.getByRole('heading', {
        name: "공간 '드림홀' 을(를) 삭제하시겠습니까?",
      }),
    ).toBeInTheDocument();

    // refetch 시 빈 데이터로 mock 갱신
    setupGetMock([], [makeBuilding()]);
    await user.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/spaces/1/'),
      expect.objectContaining({
        headers: { Authorization: 'Token t' },
      }),
    );
    expect(showToast).toHaveBeenCalledWith('공간이 삭제되었습니다.', 'success');
  });
});
