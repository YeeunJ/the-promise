import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('axios');

import axios from 'axios';
import { BuildingsSection } from '../components/admin/buildings/BuildingsSection';
import type { AdminBuilding } from '../types';

const mockedAxios = vi.mocked(axios, true);

function makeBuilding(overrides: Partial<AdminBuilding> = {}): AdminBuilding {
  return {
    id: 1,
    name: '본당',
    description: '메인 예배당',
    is_active: true,
    created_at: '2026-03-29T00:00:00+09:00',
    ...overrides,
  };
}

describe('BuildingsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // axios.isAxiosError 는 errors.ts 에서 사용. 일반 케이스는 false 로 narrow 실패 → fallback message
    // 직접 분기 테스트는 별도 처리.
  });

  it('마운트 시 건물 목록을 가져와 테이블에 표시한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [makeBuilding()] });

    render(<BuildingsSection authToken="t" showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('본당')).toBeInTheDocument();
    });
    expect(screen.getByText('메인 예배당')).toBeInTheDocument();
  });

  it('비활성 건물은 목록에서 숨긴다', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        makeBuilding({ id: 1, name: '활성건물' }),
        makeBuilding({ id: 2, name: '비활성건물', is_active: false }),
      ],
    });

    render(<BuildingsSection authToken="t" showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('활성건물')).toBeInTheDocument();
    });
    expect(screen.queryByText('비활성건물')).not.toBeInTheDocument();
  });

  it('"+ 건물 추가" 클릭 → 모달 → 제출 → POST 호출 + 토스트 + refetch', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    mockedAxios.post.mockResolvedValueOnce({
      data: makeBuilding({ id: 99, name: '신관' }),
    });
    mockedAxios.get.mockResolvedValueOnce({
      data: [makeBuilding({ id: 99, name: '신관', description: null })],
    });
    const showToast = vi.fn();

    render(<BuildingsSection authToken="t" showToast={showToast} />);
    await waitFor(() => {
      expect(screen.getByText('등록된 건물이 없습니다.')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '+ 건물 추가' }));
    expect(
      screen.getByRole('heading', { name: '건물 추가' }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/건물명/), '신관');
    await user.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/buildings/'),
      { name: '신관', description: null },
      expect.objectContaining({
        headers: { Authorization: 'Token t' },
      }),
    );
    expect(showToast).toHaveBeenCalledWith('건물이 추가되었습니다.', 'success');
    await waitFor(() => {
      expect(screen.getByText('신관')).toBeInTheDocument();
    });
  });

  it('행 "삭제" → 확인 → DELETE 호출 + 토스트 + refetch', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [makeBuilding()] });
    mockedAxios.delete.mockResolvedValueOnce({ data: undefined });
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const showToast = vi.fn();

    render(<BuildingsSection authToken="t" showToast={showToast} />);
    await waitFor(() => {
      expect(screen.getByText('본당')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '본당 삭제' }));
    expect(
      screen.getByRole('heading', {
        name: "건물 '본당' 을(를) 삭제하시겠습니까?",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    expect(showToast).toHaveBeenCalledWith('건물이 삭제되었습니다.', 'success');
  });

  it('삭제 실패 시 (예: 활성 공간 conflict) fallback 토스트가 노출되고 목록은 그대로 유지된다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [makeBuilding()] });
    // axios mock 환경에서는 isAxiosError 가 false 로 narrow 실패 → fallback 사용
    mockedAxios.delete.mockRejectedValueOnce(new Error('conflict'));
    const showToast = vi.fn();

    render(<BuildingsSection authToken="t" showToast={showToast} />);
    await waitFor(() => {
      expect(screen.getByText('본당')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '본당 삭제' }));
    await user.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        '건물 삭제 중 오류가 발생했습니다.',
        'error',
      );
    });
    // 목록은 그대로 (refetch 호출 안 됨)
    expect(screen.getByText('본당')).toBeInTheDocument();
  });
});
