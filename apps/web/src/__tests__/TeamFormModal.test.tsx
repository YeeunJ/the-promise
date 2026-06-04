import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamFormModal } from '../components/admin/teams/TeamFormModal';
import type { AdminTeam, ApiDepartment, ApiPastor } from '../types';

const departments: ApiDepartment[] = [
  { id: 1, name: '1교구', display_order: 1, pastor: null, teams: [] },
  { id: 2, name: '2교구', display_order: 2, pastor: null, teams: [] },
];

const pastors: ApiPastor[] = [
  { id: 10, name: '홍길동', title: '목사' },
  { id: 11, name: '김철수', title: '전도사' },
];

const editTeam: AdminTeam = {
  id: 10,
  name: '대림1',
  department: { id: 1, name: '1교구', pastor: null },
  pastor: null,
  leader_phone: '010-1111-2222',
  is_active: true,
  created_at: '2026-04-17T00:00:00+09:00',
};

function defaultProps() {
  return {
    isOpen: true,
    mode: 'create' as const,
    entity: null,
    departments,
    pastors,
    isSubmitting: false,
    errorMessage: null,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };
}

describe('TeamFormModal', () => {
  it('isOpen=false 면 렌더링되지 않는다', () => {
    const { container } = render(
      <TeamFormModal {...defaultProps()} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('create 모드 헤더가 "팀 추가" 로 표시된다', () => {
    render(<TeamFormModal {...defaultProps()} />);
    expect(
      screen.getByRole('heading', { name: '팀 추가' }),
    ).toBeInTheDocument();
  });

  it('edit 모드 헤더가 "팀 수정" 으로 표시되고 entity 값이 채워진다', () => {
    render(
      <TeamFormModal {...defaultProps()} mode="edit" entity={editTeam} />,
    );
    expect(
      screen.getByRole('heading', { name: '팀 수정' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/팀명/)).toHaveValue('대림1');
    expect(screen.getByLabelText(/부서/)).toHaveValue('1');
    expect(screen.getByLabelText(/연락처/)).toHaveValue('010-1111-2222');
    expect(screen.getByLabelText(/담당교역자/)).toHaveValue('');
  });

  it('필수 필드가 비어 있으면 제출 버튼이 비활성화된다', () => {
    render(<TeamFormModal {...defaultProps()} />);
    expect(screen.getByRole('button', { name: '추가' })).toBeDisabled();
  });

  it('모든 필수 필드를 채우면 제출이 가능하고 payload 에 pastor: null 이 포함된다', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TeamFormModal {...defaultProps()} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/팀명/), '신규팀');
    await userEvent.selectOptions(screen.getByLabelText(/부서/), '2');
    await userEvent.type(screen.getByLabelText(/연락처/), '010-9999-8888');

    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: '신규팀',
      department: 2,
      pastor: null,
      leader_phone: '010-9999-8888',
    });
  });

  it('errorMessage 가 있으면 role="alert" 로 노출된다', () => {
    render(
      <TeamFormModal
        {...defaultProps()}
        errorMessage="이미 사용 중인 이름입니다."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      '이미 사용 중인 이름입니다.',
    );
  });

  it('담당교역자를 선택하면 payload 에 pastor id 가 포함된다', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TeamFormModal {...defaultProps()} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/팀명/), '신규팀');
    await userEvent.selectOptions(screen.getByLabelText(/부서/), '2');
    await userEvent.selectOptions(screen.getByLabelText(/담당교역자/), '10');
    await userEvent.type(screen.getByLabelText(/연락처/), '010-9999-8888');

    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: '신규팀',
      department: 2,
      pastor: 10,
      leader_phone: '010-9999-8888',
    });
  });

  it('isSubmitting=true 면 입력과 버튼이 모두 비활성화된다', () => {
    render(<TeamFormModal {...defaultProps()} isSubmitting={true} />);
    expect(screen.getByLabelText(/팀명/)).toBeDisabled();
    expect(screen.getByLabelText(/부서/)).toBeDisabled();
    expect(screen.getByLabelText(/담당교역자/)).toBeDisabled();
    expect(screen.getByLabelText(/연락처/)).toBeDisabled();
    expect(screen.getByRole('button', { name: '닫기' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled();
  });

  it('"닫기" 버튼 클릭 시 onClose 가 호출된다', async () => {
    const onClose = vi.fn();
    render(<TeamFormModal {...defaultProps()} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalled();
  });
});
