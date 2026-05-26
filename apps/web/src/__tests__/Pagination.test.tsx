import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../components/ui/Pagination';

describe('Pagination', () => {
  describe('렌더링 조건', () => {
    it('totalPages 가 1 이하면 아무것도 렌더링하지 않는다', () => {
      const { container: c1 } = render(
        <Pagination page={1} totalPages={1} onChange={vi.fn()} />,
      );
      expect(c1.firstChild).toBeNull();

      const { container: c0 } = render(
        <Pagination page={1} totalPages={0} onChange={vi.fn()} />,
      );
      expect(c0.firstChild).toBeNull();
    });

    it('totalPages 가 2 이상이면 nav 가 렌더링된다', () => {
      render(<Pagination page={1} totalPages={2} onChange={vi.fn()} />);
      expect(screen.getByRole('navigation', { name: '페이지네이션' }))
        .toBeInTheDocument();
    });
  });

  describe('이전/다음 버튼', () => {
    it('첫 페이지에서 이전 버튼이 비활성화된다', () => {
      render(<Pagination page={1} totalPages={5} onChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled();
    });

    it('마지막 페이지에서 다음 버튼이 비활성화된다', () => {
      render(<Pagination page={5} totalPages={5} onChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
    });

    it('가운데 페이지에서 이전/다음 모두 활성화된다', () => {
      render(<Pagination page={3} totalPages={5} onChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: '이전 페이지' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: '다음 페이지' })).not.toBeDisabled();
    });

    it('이전 버튼 클릭 시 page-1 로 onChange 호출', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination page={3} totalPages={5} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: '이전 페이지' }));

      expect(onChange).toHaveBeenCalledWith(2);
    });

    it('다음 버튼 클릭 시 page+1 로 onChange 호출', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination page={3} totalPages={5} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: '다음 페이지' }));

      expect(onChange).toHaveBeenCalledWith(4);
    });
  });

  describe('숫자 페이지 버튼', () => {
    it('totalPages 가 7 이하면 모든 숫자가 표시된다', () => {
      render(<Pagination page={1} totalPages={7} onChange={vi.fn()} />);
      for (let i = 1; i <= 7; i++) {
        expect(screen.getByRole('button', { name: `${i}페이지` })).toBeInTheDocument();
      }
    });

    it('현재 페이지 버튼은 aria-current="page" 속성을 가진다', () => {
      render(<Pagination page={3} totalPages={5} onChange={vi.fn()} />);
      const current = screen.getByRole('button', { name: '3페이지' });
      expect(current).toHaveAttribute('aria-current', 'page');
    });

    it('다른 페이지 버튼은 aria-current 가 없다', () => {
      render(<Pagination page={3} totalPages={5} onChange={vi.fn()} />);
      const other = screen.getByRole('button', { name: '2페이지' });
      expect(other).not.toHaveAttribute('aria-current');
    });

    it('숫자 버튼 클릭 시 해당 페이지로 onChange 호출', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination page={1} totalPages={5} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: '4페이지' }));

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('현재 페이지 버튼 클릭은 onChange 호출하지 않는다', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination page={3} totalPages={5} onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: '3페이지' }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('윈도 표시 (totalPages > 7)', () => {
    it('현재 페이지가 첫쪽일 때 1 2 3 4 5 ... 12 형태', () => {
      render(<Pagination page={2} totalPages={12} onChange={vi.fn()} />);
      // 1, 2, 3, 4, 5 표시
      expect(screen.getByRole('button', { name: '1페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5페이지' })).toBeInTheDocument();
      // 마지막 12 표시
      expect(screen.getByRole('button', { name: '12페이지' })).toBeInTheDocument();
      // 가운데 ellipsis 1개 이상
      expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(1);
    });

    it('현재 페이지가 가운데일 때 1 ... 5 6 [7] 8 9 ... 12 형태', () => {
      render(<Pagination page={7} totalPages={12} onChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: '1페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '7페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '9페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '12페이지' })).toBeInTheDocument();
      // 양쪽 ellipsis 2개
      expect(screen.getAllByText('…').length).toBe(2);
    });

    it('현재 페이지가 끝쪽일 때 1 ... 8 9 10 11 12 형태', () => {
      render(<Pagination page={11} totalPages={12} onChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: '1페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '8페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '12페이지' })).toBeInTheDocument();
      // 시작 쪽 ellipsis 1개
      expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('isLoading', () => {
    it('isLoading=true 면 모든 버튼이 비활성화된다', () => {
      render(<Pagination page={3} totalPages={5} onChange={vi.fn()} isLoading />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('isLoading=false 가 기본값', () => {
      render(<Pagination page={3} totalPages={5} onChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: '4페이지' })).not.toBeDisabled();
    });
  });
});
