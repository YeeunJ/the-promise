import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuildingFormModal } from '../components/admin/buildings/BuildingFormModal';
import type { AdminBuilding } from '../types';

const editBuilding: AdminBuilding = {
  id: 1,
  name: '본당',
  description: '메인 예배당',
  is_active: true,
  created_at: '2026-03-29T00:00:00+09:00',
};

function defaultProps() {
  return {
    isOpen: true,
    mode: 'create' as const,
    entity: null,
    isSubmitting: false,
    errorMessage: null,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };
}

describe('BuildingFormModal', () => {
  it('isOpen=false 면 렌더링되지 않는다', () => {
    const { container } = render(
      <BuildingFormModal {...defaultProps()} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('edit 모드에서 entity 값이 입력 필드에 채워진다', () => {
    render(
      <BuildingFormModal
        {...defaultProps()}
        mode="edit"
        entity={editBuilding}
      />,
    );
    expect(
      screen.getByRole('heading', { name: '건물 수정' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/건물명/)).toHaveValue('본당');
    expect(screen.getByLabelText('설명')).toHaveValue('메인 예배당');
  });

  it('건물명이 비어 있으면 제출 버튼이 비활성화된다', () => {
    render(<BuildingFormModal {...defaultProps()} />);
    expect(screen.getByRole('button', { name: '추가' })).toBeDisabled();
  });

  it('건물명만 채워도 제출 가능하며 description 은 null 로 전송된다', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BuildingFormModal {...defaultProps()} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/건물명/), '신관');
    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: '신관',
      description: null,
    });
  });

  it('description 을 입력하면 trim 후 payload 에 포함된다', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BuildingFormModal {...defaultProps()} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/건물명/), '신관');
    await userEvent.type(screen.getByLabelText('설명'), '  새 건물  ');
    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: '신관',
      description: '새 건물',
    });
  });

  it('errorMessage 가 있으면 role="alert" 로 노출된다', () => {
    render(
      <BuildingFormModal {...defaultProps()} errorMessage="중복된 이름" />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('중복된 이름');
  });
});
