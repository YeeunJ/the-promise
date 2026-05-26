import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LookupForm from '../components/LookupForm';

describe('LookupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('이름과 연락처 입력 후 제출 시 onSubmit 콜백이 호출된다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LookupForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('이름'), '홍길동');
    await user.type(screen.getByLabelText('연락처'), '01012345678');
    await user.click(screen.getByRole('button', { name: '예약 조회' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: '홍길동',
      phone: '010-1234-5678',
    });
  });

  it('이름이 비어있으면 onSubmit 을 호출하지 않고 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LookupForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('연락처'), '01012345678');
    await user.click(screen.getByRole('button', { name: '예약 조회' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('이름을 입력해주세요.')).toBeInTheDocument();
  });

  it('연락처가 비어있으면 onSubmit 을 호출하지 않고 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LookupForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('이름'), '홍길동');
    await user.click(screen.getByRole('button', { name: '예약 조회' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('연락처를 입력해주세요.')).toBeInTheDocument();
  });

  it('isLoading=true 면 버튼이 비활성화되고 로딩 텍스트가 표시된다', () => {
    render(<LookupForm onSubmit={vi.fn()} isLoading />);
    const button = screen.getByRole('button', { name: '조회 중...' });
    expect(button).toBeDisabled();
  });
});
