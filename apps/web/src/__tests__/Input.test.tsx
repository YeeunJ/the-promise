import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../components/ui/Input';

describe('Input atom', () => {
  it('renders label and associates with input via htmlFor', () => {
    render(<Input label="이름" defaultValue="홍길동" />);
    const input = screen.getByLabelText('이름');
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('홍길동');
  });

  it('required label shows asterisk', () => {
    render(<Input label="연락처" required />);
    const label = screen.getByText('연락처').parentElement;
    expect(label?.textContent).toContain('*');
  });

  it('valid=true applies valid border class on wrapper', () => {
    render(<Input label="이름" valid />);
    const wrapper = screen.getByLabelText('이름').parentElement;
    expect(wrapper?.className).toContain('border-primary');
  });

  it('error message shows and sets aria-invalid', () => {
    render(<Input label="전화" error="형식 오류" />);
    const input = screen.getByLabelText('전화');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert')).toHaveTextContent('형식 오류');
    const wrapper = input.parentElement;
    expect(wrapper?.className).toContain('border-danger');
  });

  it('iconLeft and iconRight render adjacent to input', () => {
    render(
      <Input
        label="검색"
        iconLeft={<span data-testid="left-ic" />}
        iconRight={<span data-testid="right-ic" />}
      />,
    );
    expect(screen.getByTestId('left-ic')).toBeInTheDocument();
    expect(screen.getByTestId('right-ic')).toBeInTheDocument();
  });

  it('typing fires onChange', async () => {
    const onChange = vi.fn();
    render(<Input label="이름" onChange={onChange} />);
    const input = screen.getByLabelText('이름');
    await userEvent.type(input, 'A');
    expect(onChange).toHaveBeenCalled();
  });
});
