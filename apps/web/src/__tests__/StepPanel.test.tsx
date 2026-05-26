import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepPanel } from '../components/booking/StepPanel';

describe('StepPanel', () => {
  it('STEP N / 5 라벨 렌더', () => {
    render(
      <StepPanel
        stepNumber={3}
        title="사용 인원"
        isActive={true}
        isFilled={false}
        canAdvance={false}
        isLastStep={false}
        onAdvance={vi.fn()}
      >
        <div>내용</div>
      </StepPanel>,
    );
    expect(screen.getByText('STEP 3 / 5')).toBeInTheDocument();
  });

  it('isActive=true: 입력 중 배지 + 다음 단계 버튼 표시', () => {
    render(
      <StepPanel
        stepNumber={1}
        title="신청자 정보"
        isActive={true}
        isFilled={false}
        canAdvance={false}
        isLastStep={false}
        onAdvance={vi.fn()}
      >
        <div>내용</div>
      </StepPanel>,
    );
    expect(screen.getByText('입력 중')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다음 단계/ })).toBeInTheDocument();
  });

  it('isActive=true, canAdvance=false: 버튼 disabled + 안내 텍스트', () => {
    render(
      <StepPanel
        stepNumber={1}
        title="신청자 정보"
        isActive={true}
        isFilled={false}
        canAdvance={false}
        isLastStep={false}
        onAdvance={vi.fn()}
      >
        <div>내용</div>
      </StepPanel>,
    );
    expect(screen.getByRole('button', { name: /다음 단계/ })).toBeDisabled();
    expect(
      screen.getByText('모든 항목을 입력하면 다음으로 진행할 수 있어요'),
    ).toBeInTheDocument();
  });

  it('isActive=true, canAdvance=true: 버튼 활성화 + 클릭 시 onAdvance 호출', async () => {
    const user = userEvent.setup();
    const onAdvance = vi.fn();
    render(
      <StepPanel
        stepNumber={1}
        title="신청자 정보"
        isActive={true}
        isFilled={true}
        canAdvance={true}
        isLastStep={false}
        onAdvance={onAdvance}
      >
        <div>내용</div>
      </StepPanel>,
    );
    const btn = screen.getByRole('button', { name: /다음 단계/ });
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(onAdvance).toHaveBeenCalledOnce();
  });

  it('isActive=false, isFilled=true: 입력 완료 배지, 푸터 없음', () => {
    render(
      <StepPanel
        stepNumber={1}
        title="신청자 정보"
        isActive={false}
        isFilled={true}
        canAdvance={true}
        isLastStep={false}
        onAdvance={vi.fn()}
      >
        <div>내용</div>
      </StepPanel>,
    );
    expect(screen.getByText('입력 완료')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /다음/ })).not.toBeInTheDocument();
  });

  it('isLastStep=true: 신청 완료 버튼', () => {
    render(
      <StepPanel
        stepNumber={5}
        title="사용 목적"
        isActive={true}
        isFilled={true}
        canAdvance={true}
        isLastStep={true}
        onAdvance={vi.fn()}
      >
        <div>내용</div>
      </StepPanel>,
    );
    expect(screen.getByRole('button', { name: /신청 완료/ })).toBeInTheDocument();
  });

  it('isActive=false 일 때 푸터(버튼) 없음', () => {
    render(
      <StepPanel
        stepNumber={2}
        title="장소 선택"
        isActive={false}
        isFilled={false}
        canAdvance={false}
        isLastStep={false}
        onAdvance={vi.fn()}
      >
        <div>내용</div>
      </StepPanel>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
