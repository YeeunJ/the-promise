import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BuildingWithSpaces } from '../types';
import type { SpaceSelection } from '../types/booking';

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
        {
          id: 11,
          name: '대예배실',
          floor: 1,
          capacity: 500,
          description: null,
          building: { id: 1, name: '본당', description: null },
        },
        {
          id: 12,
          name: '소예배실',
          floor: 1,
          capacity: 100,
          description: null,
          building: { id: 1, name: '본당', description: null },
        },
      ],
    },
  ];
}

describe('SpaceStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockReset();
  });

  it('초기 렌더: 건물·층·공간 카드가 차례로 표시', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: makeBuildings() });
    const { SpaceStep } = await import('../components/booking/steps/SpaceStep');

    render(<SpaceStep value={null} onChange={vi.fn()} timeSlot={null} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '본당' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /대예배실/ })).toBeInTheDocument();
  });

  it('공간 클릭 시 onChange 가 SpaceSelection 으로 호출', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: makeBuildings() });
    const { SpaceStep } = await import('../components/booking/steps/SpaceStep');

    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SpaceStep value={null} onChange={onChange} timeSlot={null} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /대예배실/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /대예배실/ }));

    const expected: SpaceSelection = {
      id: 11,
      buildingName: '본당',
      floor: 1,
      spaceName: '대예배실',
    };
    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it('초기 렌더 시 onLocationChange 가 기본 건물/층으로 호출된다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: makeBuildings() });
    const { SpaceStep } = await import('../components/booking/steps/SpaceStep');

    const onLocationChange = vi.fn();
    render(
      <SpaceStep value={null} onChange={vi.fn()} timeSlot={null} onLocationChange={onLocationChange} />,
    );

    await waitFor(() => {
      expect(onLocationChange).toHaveBeenCalledWith({ buildingName: '본당', floor: 1 });
    });
  });

  it('value 가 주어지면 해당 공간이 selected 로 시각 표시', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: makeBuildings() });
    const { SpaceStep } = await import('../components/booking/steps/SpaceStep');

    const initial: SpaceSelection = {
      id: 11,
      buildingName: '본당',
      floor: 1,
      spaceName: '대예배실',
    };

    render(<SpaceStep value={initial} onChange={vi.fn()} timeSlot={null} />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /대예배실/ })).toBeInTheDocument();
    });
    // SpaceSelector 가 value 기반으로 selected 강조 (border-primary 클래스)
    const selectedBtn = screen.getByRole('button', { name: /대예배실/ });
    expect(selectedBtn.className).toMatch(/primary|primary/);
  });
});
