import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminTopNav } from '../components/admin/AdminTopNav';

describe('AdminTopNav', () => {
  it('로고 + 가나안교회 + ADMIN 뱃지 표시', () => {
    render(
      <AdminTopNav
        section="reservations"
        onSectionChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );
    expect(screen.getByAltText('가나안교회')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('4개 탭 모두 렌더 (예약/팀/건물/공간)', () => {
    render(
      <AdminTopNav
        section="reservations"
        onSectionChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '예약' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '팀' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '건물' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '공간' })).toBeInTheDocument();
  });

  it('active 탭은 aria-current=page', () => {
    render(
      <AdminTopNav
        section="teams"
        onSectionChange={vi.fn()}
        onLogout={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '팀' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: '예약' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('탭 클릭 → onSectionChange 콜백', async () => {
    const user = userEvent.setup();
    const onSectionChange = vi.fn();
    render(
      <AdminTopNav
        section="reservations"
        onSectionChange={onSectionChange}
        onLogout={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: '팀' }));
    expect(onSectionChange).toHaveBeenCalledWith('teams');
  });

  it('로그아웃 버튼 클릭 → onLogout', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(
      <AdminTopNav
        section="reservations"
        onSectionChange={vi.fn()}
        onLogout={onLogout}
      />,
    );
    await user.click(screen.getByRole('button', { name: '로그아웃' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
