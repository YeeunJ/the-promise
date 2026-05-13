import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomBar } from '../components/booking/BottomBar';

describe('BottomBar', () => {
  it('이전/다음 모두 활성: 두 버튼 모두 렌더', () => {
    render(<BottomBar onPrev={() => {}} onNext={() => {}} />);
    expect(screen.getByRole('button', { name: /이전/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다음/ })).toBeInTheDocument();
  });

  it('onPrev/onNext 콜백 호출', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(<BottomBar onPrev={onPrev} onNext={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: /이전/ }));
    fireEvent.click(screen.getByRole('button', { name: /다음/ }));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('onPrev 미지정 시 이전 버튼 숨김 (step 1)', () => {
    render(<BottomBar onNext={() => {}} />);
    expect(screen.queryByRole('button', { name: /이전/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다음/ })).toBeInTheDocument();
  });

  it('onNext 미지정 시 다음 버튼 숨김 (step 5)', () => {
    render(<BottomBar onPrev={() => {}} />);
    expect(screen.getByRole('button', { name: /이전/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /다음/ })).not.toBeInTheDocument();
  });

  it('nextDisabled 가 true 면 다음 버튼 disabled', () => {
    render(<BottomBar onPrev={() => {}} onNext={() => {}} nextDisabled />);
    const nextBtn = screen.getByRole('button', { name: /다음/ });
    expect(nextBtn).toBeDisabled();
  });
});
