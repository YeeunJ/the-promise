import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  valid?: boolean;
  error?: string;
  required?: boolean;
}

const FIELD_BASE =
  'flex items-center gap-2.5 px-4 py-3.5 rounded-[12px] bg-surface-2 transition-colors';
const FIELD_NORMAL = 'border border-edge';
const FIELD_VALID = 'border-[1.5px] border-primary';
const FIELD_ERROR = 'border-[1.5px] border-danger';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, iconLeft, iconRight, valid = false, error, required = false, id, ...inputProps },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const fieldStateClass = error !== undefined ? FIELD_ERROR : valid ? FIELD_VALID : FIELD_NORMAL;
  const fieldClasses = `${FIELD_BASE} ${fieldStateClass}`;

  return (
    <div className="flex flex-col gap-2">
      {label !== undefined && (
        <label htmlFor={inputId} className="text-xs font-bold text-ink">
          {label}
          {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={fieldClasses}>
        {iconLeft !== undefined && <span aria-hidden="true">{iconLeft}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error !== undefined}
          aria-describedby={error !== undefined ? errorId : undefined}
          aria-required={required}
          className="flex-1 border-none outline-none bg-transparent text-sm font-semibold text-ink placeholder:text-ink-mute"
          {...inputProps}
        />
        {iconRight !== undefined && <span aria-hidden="true">{iconRight}</span>}
      </div>
      {error !== undefined && (
        <p id={errorId} className="text-[11px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
