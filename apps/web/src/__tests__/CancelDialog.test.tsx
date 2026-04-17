import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CancelDialog } from '../components/admin/CancelDialog';

describe('CancelDialog', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onClose: vi.fn(),
    isLoading: false,
  };

  // --- 표시/숨김 ---

  it('isOpen=true일 때 모달을 표시한다', () => {
    render(<CancelDialog {...defaultProps} />);
    expect(screen.getByText('이 예약을 취소하시겠습니까?')).toBeInTheDocument();
  });

  it('isOpen=false일 때 모달을 렌더링하지 않는다', () => {
    render(<CancelDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('이 예약을 취소하시겠습니까?')).not.toBeInTheDocument();
  });

  // --- 취소사유 입력 ---

  it('취소사유 textarea가 표시된다', () => {
    render(<CancelDialog {...defaultProps} />);
    expect(screen.getByPlaceholderText('취소 사유를 입력해주세요 (선택)')).toBeInTheDocument();
  });

  it('취소사유에 텍스트를 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(<CancelDialog {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('취소 사유를 입력해주세요 (선택)');
    await user.type(textarea, '일정 변경으로 취소');
    expect(textarea).toHaveValue('일정 변경으로 취소');
  });

  // --- 버튼 동작 ---

  it('"취소하기" 클릭 시 입력된 사유와 함께 onConfirm을 호출한다', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<CancelDialog {...defaultProps} onConfirm={onConfirm} />);

    const textarea = screen.getByPlaceholderText('취소 사유를 입력해주세요 (선택)');
    await user.type(textarea, '테스트 사유');
    await user.click(screen.getByRole('button', { name: '취소하기' }));

    expect(onConfirm).toHaveBeenCalledWith('테스트 사유');
  });

  it('"취소하기" 클릭 시 사유 없이도 빈 문자열로 onConfirm을 호출한다', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<CancelDialog {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: '취소하기' }));

    expect(onConfirm).toHaveBeenCalledWith('');
  });

  it('"닫기" 클릭 시 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CancelDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: '닫기' }));

    expect(onClose).toHaveBeenCalled();
  });

  // --- 로딩 상태 ---

  it('isLoading=true일 때 "취소하기" 버튼이 비활성화된다', () => {
    render(<CancelDialog {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled();
  });

  it('isLoading=true일 때 버튼 텍스트가 "처리 중..."으로 변경된다', () => {
    render(<CancelDialog {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button', { name: '처리 중...' })).toBeInTheDocument();
  });

  // --- ESC 키 ---

  it('ESC 키를 누르면 onClose를 호출한다', () => {
    const onClose = vi.fn();
    render(<CancelDialog {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  // --- 오버레이 클릭 ---

  it('오버레이 클릭 시 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CancelDialog {...defaultProps} onClose={onClose} />);

    const overlay = screen.getByTestId('cancel-dialog-overlay');
    await user.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it('다이얼로그 본체 클릭 시 onClose를 호출하지 않는다', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CancelDialog {...defaultProps} onClose={onClose} />);

    const dialog = screen.getByTestId('cancel-dialog-body');
    await user.click(dialog);

    expect(onClose).not.toHaveBeenCalled();
  });

  // --- 다이얼로그를 닫으면 textarea가 초기화된다 ---

  it('다이얼로그를 다시 열면 textarea가 비어있다', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CancelDialog {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('취소 사유를 입력해주세요 (선택)');
    await user.type(textarea, '테스트');

    // 닫았다가 다시 열기
    rerender(<CancelDialog {...defaultProps} isOpen={false} />);
    rerender(<CancelDialog {...defaultProps} isOpen={true} />);

    const newTextarea = screen.getByPlaceholderText('취소 사유를 입력해주세요 (선택)');
    expect(newTextarea).toHaveValue('');
  });
});
