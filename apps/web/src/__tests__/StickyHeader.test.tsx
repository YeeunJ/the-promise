import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StickyHeader } from '../components/booking/StickyHeader';

describe('StickyHeader', () => {
  it('step 1 라벨 렌더 (currentStep=0)', () => {
    render(
      <StickyHeader
        currentStep={0}
        isComplete={false}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText('5단계 중 1단계 진행 · 0% 완료')).toBeInTheDocument();
  });

  it('currentStep=3 일 때 pct 60%, 4단계 라벨', () => {
    render(
      <StickyHeader
        currentStep={3}
        isComplete={false}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText('5단계 중 4단계 진행 · 60% 완료')).toBeInTheDocument();
  });

  it('완료 버튼 — isComplete=false 일 때 disabled', () => {
    render(
      <StickyHeader
        currentStep={0}
        isComplete={false}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '완료' })).toBeDisabled();
  });

  it('완료 버튼 — isComplete=true 일 때 활성화', () => {
    render(
      <StickyHeader
        currentStep={4}
        isComplete={true}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '완료' })).not.toBeDisabled();
  });

  it('취소 버튼 클릭 시 onCancel 호출', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <StickyHeader
        currentStep={0}
        isComplete={false}
        onCancel={onCancel}
        onComplete={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('완료 버튼 클릭 시 onComplete 호출', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <StickyHeader
        currentStep={4}
        isComplete={true}
        onCancel={vi.fn()}
        onComplete={onComplete}
      />,
    );
    await user.click(screen.getByRole('button', { name: '완료' }));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
