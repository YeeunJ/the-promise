import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservationStatusChips } from '../components/admin/ReservationStatusChips';

describe('ReservationStatusChips', () => {
  it('전체/확정/대기/취소/거절 5개 칩을 렌더한다', () => {
    render(<ReservationStatusChips value={undefined} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '확정' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '대기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '거절' })).toBeInTheDocument();
  });

  it('value=undefined 이면 "전체" 칩이 활성이다', () => {
    render(<ReservationStatusChips value={undefined} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '확정' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('value=cancelled 이면 "취소" 칩만 활성이다', () => {
    render(<ReservationStatusChips value="cancelled" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '취소' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('"전체" 클릭 시 onChange(undefined)', async () => {
    const handle = vi.fn();
    render(<ReservationStatusChips value="confirmed" onChange={handle} />);

    await userEvent.click(screen.getByRole('button', { name: '전체' }));
    expect(handle).toHaveBeenCalledWith(undefined);
  });

  it('상태 칩 클릭 시 onChange(해당 status)', async () => {
    const handle = vi.fn();
    render(<ReservationStatusChips value={undefined} onChange={handle} />);

    await userEvent.click(screen.getByRole('button', { name: '대기' }));
    expect(handle).toHaveBeenCalledWith('pending');
  });

  it('이미 활성인 칩을 클릭해도 onChange는 호출되지 않는다', async () => {
    const handle = vi.fn();
    render(<ReservationStatusChips value="confirmed" onChange={handle} />);

    await userEvent.click(screen.getByRole('button', { name: '확정' }));
    expect(handle).not.toHaveBeenCalled();
  });

  it('role="group" 과 aria-label을 부여한다', () => {
    render(<ReservationStatusChips value={undefined} onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: '상태 필터' })).toBeInTheDocument();
  });
});
