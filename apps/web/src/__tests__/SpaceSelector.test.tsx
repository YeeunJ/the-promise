import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { BuildingWithSpaces } from '../types';

vi.mock('axios');
import axios from 'axios';

const mockedAxios = vi.mocked(axios, true);

function makeBuildings(): BuildingWithSpaces[] {
  return [
    {
      id: 1,
      name: '본당',
      description: null,
      spaces: [
        { id: 11, name: '대예배실', floor: 1, capacity: 500, description: null, building: { id: 1, name: '본당', description: null } },
        { id: 12, name: '소예배실', floor: 2, capacity: 100, description: null, building: { id: 1, name: '본당', description: null } },
      ],
    },
    {
      id: 2,
      name: '청년관',
      description: null,
      spaces: [
        { id: 21, name: '청년1실', floor: 3, capacity: 30, description: null, building: { id: 2, name: '청년관', description: null } },
        { id: 22, name: '청년2실', floor: 3, capacity: 30, description: null, building: { id: 2, name: '청년관', description: null } },
      ],
    },
  ];
}

describe('SpaceSelector — value 기반 building/floor 초기화', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockReset();
  });

  it('value가 null이면 기본 본당 1층이 선택된다 (기존 동작 회귀 방지)', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: makeBuildings() });
    const { SpaceSelector } = await import('../components/SpaceSelector');

    render(<SpaceSelector value={null} onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /대예배실/ })).toBeInTheDocument();
    });
    // 청년관 1층 공간이 아닌 본당 1층의 공간이 보여야 함
    expect(screen.queryByRole('button', { name: /청년1실/ })).not.toBeInTheDocument();
  });

  it('value가 청년관 3층 청년1실이면 청년관 3층이 선택된 상태로 표시된다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: makeBuildings() });
    const { SpaceSelector } = await import('../components/SpaceSelector');

    render(<SpaceSelector value={21} onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /청년1실/ })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /청년2실/ })).toBeInTheDocument();
    // 본당의 공간은 표시되지 않아야 함 (다른 building 선택됨)
    expect(screen.queryByRole('button', { name: /대예배실/ })).not.toBeInTheDocument();
  });

  it('value가 본당 2층 소예배실이면 본당 2층이 선택된 상태로 표시된다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: makeBuildings() });
    const { SpaceSelector } = await import('../components/SpaceSelector');

    render(<SpaceSelector value={12} onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /소예배실/ })).toBeInTheDocument();
    });
    // 1층 공간은 표시되지 않아야 함 (2층 선택됨)
    expect(screen.queryByRole('button', { name: /대예배실/ })).not.toBeInTheDocument();
  });

  it('존재하지 않는 value면 기본값(본당 1층)으로 fallback 된다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: makeBuildings() });
    const { SpaceSelector } = await import('../components/SpaceSelector');

    render(<SpaceSelector value={9999} onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /대예배실/ })).toBeInTheDocument();
    });
  });
});
