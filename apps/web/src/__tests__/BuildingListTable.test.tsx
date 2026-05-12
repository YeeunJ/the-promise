import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuildingListTable } from '../components/admin/buildings/BuildingListTable';
import type { AdminBuilding } from '../types';

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

describe('BuildingListTable', () => {
  it('건물이 없으면 안내 문구를 표시한다', () => {
    render(
      <BuildingListTable
        buildings={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('등록된 건물이 없습니다.')).toBeInTheDocument();
  });

  it('건물 행을 이름·설명으로 렌더링한다', () => {
    render(
      <BuildingListTable
        buildings={[makeBuilding()]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('본당')).toBeInTheDocument();
    expect(screen.getByText('메인 예배당')).toBeInTheDocument();
  });

  it('description 이 null 이면 설명 열에 "-" 를 표시한다', () => {
    render(
      <BuildingListTable
        buildings={[makeBuilding({ description: null })]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('수정/삭제 버튼 클릭 시 해당 건물과 함께 콜백이 호출된다', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const building = makeBuilding();
    render(
      <BuildingListTable
        buildings={[building]}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '본당 수정' }));
    expect(onEdit).toHaveBeenCalledWith(building);

    await user.click(screen.getByRole('button', { name: '본당 삭제' }));
    expect(onDelete).toHaveBeenCalledWith(building);
  });
});
