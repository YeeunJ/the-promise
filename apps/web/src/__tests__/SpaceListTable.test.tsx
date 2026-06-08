import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpaceListTable } from '../components/admin/spaces/SpaceListTable';
import type { AdminSpace } from '../types';

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

describe('SpaceListTable', () => {
  it('공간이 없으면 안내 문구를 표시한다', () => {
    render(
      <SpaceListTable spaces={[]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.getByText('등록된 공간이 없습니다.')).toBeInTheDocument();
  });

  it('공간 행을 건물·이름·층·정원으로 렌더링한다', () => {
    render(
      <SpaceListTable
        spaces={[makeSpace()]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('본당')).toBeInTheDocument();
    expect(screen.getByText('드림홀')).toBeInTheDocument();
    expect(screen.getByText('3층')).toBeInTheDocument();
    expect(screen.getByText('500명')).toBeInTheDocument();
  });

  it('floor 또는 capacity 가 null 이면 "-" 를 표시한다', () => {
    render(
      <SpaceListTable
        spaces={[makeSpace({ floor: null, capacity: null })]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('"층" 헤더 클릭 시 층 오름차순으로 정렬한다', async () => {
    const user = userEvent.setup();
    render(
      <SpaceListTable
        spaces={[
          makeSpace({ id: 1, name: '3층방', floor: 3 }),
          makeSpace({ id: 2, name: '1층방', floor: 1 }),
          makeSpace({ id: 3, name: '2층방', floor: 2 }),
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByText('층'));

    const rows = screen.getAllByRole('row').slice(1); // 헤더 제외
    expect(rows[0]).toHaveTextContent('1층방');
    expect(rows[1]).toHaveTextContent('2층방');
    expect(rows[2]).toHaveTextContent('3층방');
  });

  it('"층" 헤더를 두 번 클릭하면 내림차순으로 정렬한다', async () => {
    const user = userEvent.setup();
    render(
      <SpaceListTable
        spaces={[
          makeSpace({ id: 1, name: '1층방', floor: 1 }),
          makeSpace({ id: 2, name: '3층방', floor: 3 }),
          makeSpace({ id: 3, name: '2층방', floor: 2 }),
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const header = screen.getByText('층');
    await user.click(header);
    await user.click(header);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('3층방');
    expect(rows[1]).toHaveTextContent('2층방');
    expect(rows[2]).toHaveTextContent('1층방');
  });

  it('수정/삭제 클릭 시 해당 공간과 함께 콜백이 호출된다', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const space = makeSpace();
    render(
      <SpaceListTable
        spaces={[space]}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '드림홀 수정' }));
    expect(onEdit).toHaveBeenCalledWith(space);

    await user.click(screen.getByRole('button', { name: '드림홀 삭제' }));
    expect(onDelete).toHaveBeenCalledWith(space);
  });
});
