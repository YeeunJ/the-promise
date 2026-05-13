import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

interface BaseCardProps {
  selected?: boolean;
  children: ReactNode;
  className?: string;
}

interface DivCardProps extends BaseCardProps, Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'> {
  as?: 'div';
}

interface ButtonCardProps extends BaseCardProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'type'> {
  as: 'button';
  type?: 'button' | 'submit';
}

type CardProps = DivCardProps | ButtonCardProps;

const BASE = 'bg-surface rounded-[16px] shadow-design-md transition-all';
const NORMAL_BORDER = 'border border-edge-soft';
const SELECTED_BORDER = 'border-2 border-primary shadow-[0_4px_16px_rgba(31,95,74,0.14)]';

export function Card(props: CardProps): JSX.Element {
  const { selected = false, className = '', children } = props;
  const borderClass = selected ? SELECTED_BORDER : NORMAL_BORDER;
  const classes = `${BASE} ${borderClass} ${className}`.trim();

  if (props.as === 'button') {
    const { as: _as, selected: _sel, className: _cn, children: _ch, type = 'button', ...rest } = props;
    return (
      <button type={type} className={`${classes} text-left`} {...rest}>
        {children}
      </button>
    );
  }

  const { as: _as, selected: _sel, className: _cn, children: _ch, ...rest } = props;
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
