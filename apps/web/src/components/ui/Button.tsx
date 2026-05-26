import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
}

const BASE_CLASS =
  'inline-flex items-center justify-center gap-1.5 font-bold tracking-[-0.01em] ' +
  'transition-colors disabled:cursor-not-allowed';

const SIZE_CLASS: Record<ButtonSize, string> = {
  md: 'px-6 py-4 rounded-[14px] text-sm',
  sm: 'px-[22px] py-[9px] rounded-[10px] text-[13px]',
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-design-primary ' +
    'hover:bg-primary-dark active:bg-primary-dark ' +
    'disabled:bg-edge-soft disabled:text-ink-mute disabled:shadow-none',
  ghost:
    'bg-surface text-ink border border-edge font-semibold ' +
    'hover:bg-surface-2 ' +
    'disabled:bg-edge-soft disabled:text-ink-mute disabled:border-edge-soft',
  danger:
    'bg-danger text-white shadow-design-danger ' +
    'hover:bg-[#A04036] ' +
    'disabled:bg-edge-soft disabled:text-ink-mute disabled:shadow-none',
};

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  type = 'button',
  className = '',
  children,
  ...rest
}: ButtonProps): JSX.Element {
  const classes = `${BASE_CLASS} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`.trim();
  return (
    <button type={type} className={classes} {...rest}>
      {iconLeft !== undefined && <span aria-hidden="true">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight !== undefined && <span aria-hidden="true">{iconRight}</span>}
    </button>
  );
}
