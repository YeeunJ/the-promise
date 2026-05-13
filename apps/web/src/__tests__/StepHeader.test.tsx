import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepHeader, STEP_TITLES, STEP_CHIP_LABELS } from '../components/booking/StepHeader';

describe('StepHeader', () => {
  it('현재 step 의 타이틀과 N/5 인디케이터 표시', () => {
    render(
      <StepHeader
        currentStep={2}
        maxReachedStep={2}
        validSteps={[true, false, false, false, false]}
        onStepChange={() => {}}
        onCancel={() => {}}
        onComplete={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: STEP_TITLES[1] })).toBeInTheDocument();
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('5개 chip 모두 렌더 (자유 점프 가능 정책)', () => {
    render(
      <StepHeader
        currentStep={1}
        maxReachedStep={1}
        validSteps={[false, false, false, false, false]}
        onStepChange={() => {}}
        onCancel={() => {}}
        onComplete={() => {}}
      />,
    );
    STEP_CHIP_LABELS.forEach((label) => {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument();
    });
  });

  it('미도달 chip (step > maxReachedStep) 도 클릭 가능 — 자유 점프', () => {
    const onStepChange = vi.fn();
    render(
      <StepHeader
        currentStep={1}
        maxReachedStep={1}
        validSteps={[false, false, false, false, false]}
        onStepChange={onStepChange}
        onCancel={() => {}}
        onComplete={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: new RegExp(STEP_CHIP_LABELS[4]) }));
    expect(onStepChange).toHaveBeenCalledWith(5);
  });

  it('현재 chip 클릭은 onStepChange 호출하지 않음', () => {
    const onStepChange = vi.fn();
    render(
      <StepHeader
        currentStep={3}
        maxReachedStep={3}
        validSteps={[true, true, false, false, false]}
        onStepChange={onStepChange}
        onCancel={() => {}}
        onComplete={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: new RegExp(STEP_CHIP_LABELS[2]) }));
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('isComplete=false 면 완료 버튼 disabled', () => {
    const onComplete = vi.fn();
    render(
      <StepHeader
        currentStep={5}
        maxReachedStep={5}
        validSteps={[true, true, true, true, false]}
        onStepChange={() => {}}
        onCancel={() => {}}
        onComplete={onComplete}
        isComplete={false}
      />,
    );
    const btn = screen.getByRole('button', { name: '완료' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('isComplete=true 면 완료 버튼 활성, 클릭 시 콜백', () => {
    const onComplete = vi.fn();
    render(
      <StepHeader
        currentStep={5}
        maxReachedStep={5}
        validSteps={[true, true, true, true, true]}
        onStepChange={() => {}}
        onCancel={() => {}}
        onComplete={onComplete}
        isComplete
      />,
    );
    const btn = screen.getByRole('button', { name: '완료' });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('취소 버튼 클릭 → onCancel', () => {
    const onCancel = vi.fn();
    render(
      <StepHeader
        currentStep={1}
        maxReachedStep={1}
        validSteps={[false, false, false, false, false]}
        onStepChange={() => {}}
        onCancel={onCancel}
        onComplete={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('chip 의 시각 상태: current/reached-valid/reached-invalid/unreached 가 data 속성으로 구분', () => {
    render(
      <StepHeader
        currentStep={2}
        maxReachedStep={3}
        validSteps={[true, false, false, false, false]}
        onStepChange={() => {}}
        onCancel={() => {}}
        onComplete={() => {}}
      />,
    );
    // step1: reached + valid
    const c1 = screen.getByRole('button', { name: new RegExp(STEP_CHIP_LABELS[0]) });
    expect(c1).toHaveAttribute('data-state', 'reached-valid');
    // step2: current
    const c2 = screen.getByRole('button', { name: new RegExp(STEP_CHIP_LABELS[1]) });
    expect(c2).toHaveAttribute('data-state', 'current');
    // step3: reached + invalid
    const c3 = screen.getByRole('button', { name: new RegExp(STEP_CHIP_LABELS[2]) });
    expect(c3).toHaveAttribute('data-state', 'reached-invalid');
    // step4: unreached
    const c4 = screen.getByRole('button', { name: new RegExp(STEP_CHIP_LABELS[3]) });
    expect(c4).toHaveAttribute('data-state', 'unreached');
  });
});
