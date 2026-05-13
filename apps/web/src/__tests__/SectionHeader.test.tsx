import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from '../components/admin/SectionHeader';

describe('SectionHeader', () => {
  it('title을 h1으로 렌더한다', () => {
    render(<SectionHeader title="예약 관리" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('예약 관리');
  });

  it('subtitle이 주어지면 렌더한다', () => {
    render(
      <SectionHeader
        title="예약 관리"
        subtitle="2026년 5월 · 확정 47건 · 취소 3건"
      />,
    );

    expect(
      screen.getByText('2026년 5월 · 확정 47건 · 취소 3건'),
    ).toBeInTheDocument();
  });

  it('subtitle이 없으면 렌더하지 않는다', () => {
    const { container } = render(<SectionHeader title="팀 관리" />);

    // subtitle 영역 자체가 존재하지 않아야 함
    expect(container.querySelector('[data-testid="section-header-subtitle"]')).toBeNull();
  });

  it('actions slot에 전달된 노드를 렌더한다', () => {
    render(
      <SectionHeader
        title="팀 관리"
        actions={
          <>
            <button type="button">CSV</button>
            <button type="button">+ 팀 추가</button>
          </>
        }
      />,
    );

    expect(screen.getByRole('button', { name: 'CSV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ 팀 추가' })).toBeInTheDocument();
  });

  it('subtitle에 ReactNode를 그대로 받을 수 있다', () => {
    render(
      <SectionHeader
        title="예약 관리"
        subtitle={<span data-testid="custom-subtitle">커스텀</span>}
      />,
    );

    expect(screen.getByTestId('custom-subtitle')).toHaveTextContent('커스텀');
  });
});
