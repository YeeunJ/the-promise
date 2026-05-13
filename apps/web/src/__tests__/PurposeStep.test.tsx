import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurposeStep } from '../components/booking/steps/PurposeStep';

describe('PurposeStep', () => {
  it('9 옵션 모두 렌더', () => {
    render(<PurposeStep value="" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /정기 모임/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /예배.*기도회/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /성경 공부/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /찬양 연습/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /세미나.*강의/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /친교.*식사/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /위원회.*회의/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /행사.*특별 집회/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /기타.*직접 입력/ })).toBeInTheDocument();
  });

  it('preset 옵션 클릭 시 onChange 에 해당 label 전달', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PurposeStep value="" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /정기 모임/ }));
    expect(onChange).toHaveBeenCalledWith('정기 모임');
  });

  it('기타 클릭 시 textarea 표시', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PurposeStep value="" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /기타.*직접 입력/ }));
    const textarea = await screen.findByPlaceholderText(/직접 입력/);
    expect(textarea).toBeInTheDocument();
  });

  it('기타 + textarea 타이핑 시 onChange 에 trim 된 값 전달', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PurposeStep value="" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /기타.*직접 입력/ }));
    const textarea = await screen.findByPlaceholderText(/직접 입력/);
    await user.type(textarea, '특별모임');

    expect(onChange).toHaveBeenLastCalledWith('특별모임');
  });

  it('value 가 preset 라벨이면 해당 옵션이 selected', () => {
    render(<PurposeStep value="찬양 연습" onChange={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /찬양 연습/ });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('value 가 preset 외 값이면 기타가 selected 되고 textarea 채워짐', () => {
    render(<PurposeStep value="자유발언" onChange={vi.fn()} />);
    const etc = screen.getByRole('button', { name: /기타.*직접 입력/ });
    expect(etc).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByDisplayValue('자유발언')).toBeInTheDocument();
  });
});
