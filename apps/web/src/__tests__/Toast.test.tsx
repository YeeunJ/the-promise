import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '../components/ui/Toast';
import type { ToastItem } from '../hooks/useToast';

function makeToast(overrides: Partial<ToastItem> = {}): ToastItem {
  return {
    id: 'toast-1',
    message: '테스트 메시지',
    type: 'error',
    ...overrides,
  };
}

describe('Toast', () => {
  it('토스트가 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <Toast toasts={[]} onRemove={vi.fn()} />,
    );
    expect(container.firstChild?.childNodes.length).toBe(0);
  });

  it('에러 토스트의 메시지를 표시한다', () => {
    const toasts = [makeToast({ message: '에러 발생!' })];
    render(<Toast toasts={toasts} onRemove={vi.fn()} />);
    expect(screen.getByText('에러 발생!')).toBeInTheDocument();
  });

  it('성공 토스트의 메시지를 표시한다', () => {
    const toasts = [makeToast({ type: 'success', message: '성공했습니다' })];
    render(<Toast toasts={toasts} onRemove={vi.fn()} />);
    expect(screen.getByText('성공했습니다')).toBeInTheDocument();
  });

  it('여러 토스트를 모두 표시한다', () => {
    const toasts = [
      makeToast({ id: '1', message: '첫 번째' }),
      makeToast({ id: '2', message: '두 번째' }),
      makeToast({ id: '3', message: '세 번째' }),
    ];
    render(<Toast toasts={toasts} onRemove={vi.fn()} />);

    expect(screen.getByText('첫 번째')).toBeInTheDocument();
    expect(screen.getByText('두 번째')).toBeInTheDocument();
    expect(screen.getByText('세 번째')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onRemove를 호출한다', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const toasts = [makeToast({ id: 'remove-me' })];

    render(<Toast toasts={toasts} onRemove={onRemove} />);

    const closeButton = screen.getByRole('button', { name: /닫기/i });
    await user.click(closeButton);

    expect(onRemove).toHaveBeenCalledWith('remove-me');
  });

  it('에러 토스트에 빨간 계열 배경이 적용된다', () => {
    const toasts = [makeToast({ type: 'error' })];
    render(<Toast toasts={toasts} onRemove={vi.fn()} />);

    const toastEl = screen.getByText('테스트 메시지').closest('[data-toast-type]');
    expect(toastEl?.getAttribute('data-toast-type')).toBe('error');
  });

  it('성공 토스트에 초록 계열 배경이 적용된다', () => {
    const toasts = [makeToast({ type: 'success', message: '성공' })];
    render(<Toast toasts={toasts} onRemove={vi.fn()} />);

    const toastEl = screen.getByText('성공').closest('[data-toast-type]');
    expect(toastEl?.getAttribute('data-toast-type')).toBe('success');
  });

  it('컨테이너가 fixed 포지셔닝이다', () => {
    const toasts = [makeToast()];
    const { container } = render(<Toast toasts={toasts} onRemove={vi.fn()} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('fixed');
  });
});
