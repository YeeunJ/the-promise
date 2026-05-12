import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpaceFormModal } from '../components/admin/spaces/SpaceFormModal';
import type { AdminBuilding, AdminSpace } from '../types';

const buildings: AdminBuilding[] = [
  {
    id: 1,
    name: '본당',
    description: null,
    is_active: true,
    created_at: '2026-03-29T00:00:00+09:00',
  },
  {
    id: 2,
    name: '가나안홀',
    description: null,
    is_active: true,
    created_at: '2026-03-29T00:00:00+09:00',
  },
];

const editSpace: AdminSpace = {
  id: 10,
  building: { id: 1, name: '본당', description: null },
  name: '드림홀',
  floor: 3,
  capacity: 500,
  description: '예배당',
  is_active: true,
  created_at: '2026-03-29T00:00:00+09:00',
};

function defaultProps() {
  return {
    isOpen: true,
    mode: 'create' as const,
    entity: null,
    buildings,
    isSubmitting: false,
    errorMessage: null,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };
}

describe('SpaceFormModal', () => {
  it('isOpen=false 면 렌더링되지 않는다', () => {
    const { container } = render(
      <SpaceFormModal {...defaultProps()} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('edit 모드에서 entity 값이 모든 필드에 채워진다', () => {
    render(
      <SpaceFormModal {...defaultProps()} mode="edit" entity={editSpace} />,
    );
    expect(
      screen.getByRole('heading', { name: '공간 수정' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/건물/)).toHaveValue('1');
    expect(screen.getByLabelText(/공간명/)).toHaveValue('드림홀');
    expect(screen.getByLabelText('층')).toHaveValue(3);
    expect(screen.getByLabelText('정원')).toHaveValue(500);
    expect(screen.getByLabelText('설명')).toHaveValue('예배당');
  });

  it('건물·공간명이 모두 비어 있으면 제출 버튼이 비활성화된다', () => {
    render(<SpaceFormModal {...defaultProps()} />);
    expect(screen.getByRole('button', { name: '추가' })).toBeDisabled();
  });

  it('필수 필드만 채워 제출하면 floor/capacity/description 은 null 로 전송된다', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SpaceFormModal {...defaultProps()} onSubmit={onSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText(/건물/), '2');
    await userEvent.type(screen.getByLabelText(/공간명/), '회의실');
    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(onSubmit).toHaveBeenCalledWith({
      building: 2,
      name: '회의실',
      floor: null,
      capacity: null,
      description: null,
    });
  });

  it('숫자 입력은 number 로, 설명은 trim 후 전송된다', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SpaceFormModal {...defaultProps()} onSubmit={onSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText(/건물/), '1');
    await userEvent.type(screen.getByLabelText(/공간명/), '드림홀');
    await userEvent.type(screen.getByLabelText('층'), '3');
    await userEvent.type(screen.getByLabelText('정원'), '500');
    await userEvent.type(screen.getByLabelText('설명'), '  예배당  ');
    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(onSubmit).toHaveBeenCalledWith({
      building: 1,
      name: '드림홀',
      floor: 3,
      capacity: 500,
      description: '예배당',
    });
  });

  it('isSubmitting=true 면 모든 입력과 버튼이 비활성화된다', () => {
    render(<SpaceFormModal {...defaultProps()} isSubmitting={true} />);
    expect(screen.getByLabelText(/건물/)).toBeDisabled();
    expect(screen.getByLabelText(/공간명/)).toBeDisabled();
    expect(screen.getByLabelText('층')).toBeDisabled();
    expect(screen.getByLabelText('정원')).toBeDisabled();
    expect(screen.getByLabelText('설명')).toBeDisabled();
    expect(screen.getByRole('button', { name: '닫기' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled();
  });

  it('errorMessage 가 있으면 role="alert" 로 노출된다', () => {
    render(
      <SpaceFormModal {...defaultProps()} errorMessage="이미 존재하는 이름" />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('이미 존재하는 이름');
  });
});
