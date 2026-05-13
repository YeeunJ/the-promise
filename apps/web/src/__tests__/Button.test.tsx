import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/Button';

describe('Button atom', () => {
  it('renders children text', () => {
    render(<Button>저장하기</Button>);
    expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument();
  });

  it('default variant=primary applies primary class', () => {
    render(<Button>확인</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-primary');
  });

  it('variant=ghost applies surface bg + edge border', () => {
    render(<Button variant="ghost">취소</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-surface');
    expect(btn.className).toContain('border-edge');
  });

  it('variant=danger applies danger bg', () => {
    render(<Button variant="danger">삭제</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-danger');
  });

  it('size=sm applies smaller padding/text', () => {
    render(<Button size="sm">짧게</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('text-[13px]');
  });

  it('iconLeft and iconRight render', () => {
    render(
      <Button
        iconLeft={<span data-testid="ic-left">L</span>}
        iconRight={<span data-testid="ic-right">R</span>}
      >
        가운데
      </Button>,
    );
    expect(screen.getByTestId('ic-left')).toBeInTheDocument();
    expect(screen.getByTestId('ic-right')).toBeInTheDocument();
  });

  it('onClick fires when enabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled prevents onClick and sets disabled attribute', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>막힘</Button>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('default type is button (not submit)', () => {
    render(<Button>기본</Button>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.type).toBe('button');
  });

  it('type=submit honored', () => {
    render(<Button type="submit">제출</Button>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.type).toBe('submit');
  });
});
