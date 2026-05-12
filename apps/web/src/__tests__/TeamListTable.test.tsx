import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamListTable } from '../components/admin/teams/TeamListTable';
import type { AdminTeam } from '../types';

function makeTeam(overrides: Partial<AdminTeam> = {}): AdminTeam {
  return {
    id: 1,
    name: '대림1',
    department: { id: 1, name: '1교구' },
    pastor: { id: 1, name: '이상윤', title: '목사' },
    leader_phone: '010-1234-5678',
    is_active: true,
    created_at: '2026-04-17T00:00:00+09:00',
    ...overrides,
  };
}

describe('TeamListTable', () => {
  it('팀이 없으면 안내 문구를 표시한다', () => {
    render(
      <TeamListTable teams={[]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.getByText('등록된 팀이 없습니다.')).toBeInTheDocument();
  });

  it('팀 행을 이름·부서·담당교역자·연락처로 렌더링한다', () => {
    render(
      <TeamListTable
        teams={[makeTeam()]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('대림1')).toBeInTheDocument();
    expect(screen.getByText('1교구')).toBeInTheDocument();
    expect(screen.getByText('이상윤 목사')).toBeInTheDocument();
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
  });

  it('pastor 가 null 이면 담당교역자 열에 "-" 를 표시한다', () => {
    render(
      <TeamListTable
        teams={[makeTeam({ pastor: null })]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('department 가 null 이면 부서 열에 "-" 를 표시한다', () => {
    render(
      <TeamListTable
        teams={[makeTeam({ department: null, pastor: null })]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    // department 와 pastor 모두 null 이므로 "-" 가 2번
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('수정 버튼 클릭 시 onEdit 콜백이 해당 팀과 함께 호출된다', async () => {
    const onEdit = vi.fn();
    const team = makeTeam();
    render(
      <TeamListTable teams={[team]} onEdit={onEdit} onDelete={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: '대림1 수정' }));
    expect(onEdit).toHaveBeenCalledWith(team);
  });

  it('삭제 버튼 클릭 시 onDelete 콜백이 해당 팀과 함께 호출된다', async () => {
    const onDelete = vi.fn();
    const team = makeTeam();
    render(
      <TeamListTable teams={[team]} onEdit={vi.fn()} onDelete={onDelete} />,
    );

    await userEvent.click(screen.getByRole('button', { name: '대림1 삭제' }));
    expect(onDelete).toHaveBeenCalledWith(team);
  });
});
