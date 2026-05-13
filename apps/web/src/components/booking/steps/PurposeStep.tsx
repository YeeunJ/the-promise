import { useEffect, useRef, useState } from 'react';
import { PURPOSE_OPTIONS } from '../../../data/purposes';

interface PurposeStepProps {
  value: string;
  onChange: (purpose: string) => void;
}

const MAX_CUSTOM_LENGTH = 200;
const ETC_ID = 'etc';

function resolveInitialSelection(value: string): { selectedId: string | null; customText: string } {
  if (!value) return { selectedId: null, customText: '' };
  const match = PURPOSE_OPTIONS.find((o) => o.label === value);
  if (match) return { selectedId: match.id, customText: '' };
  return { selectedId: ETC_ID, customText: value };
}

export function PurposeStep({ value, onChange }: PurposeStepProps): JSX.Element {
  const initial = resolveInitialSelection(value);
  const [selectedId, setSelectedId] = useState<string | null>(initial.selectedId);
  const [customText, setCustomText] = useState<string>(initial.customText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function emitFor(id: string | null, text: string): void {
    if (!id) return;
    if (id === ETC_ID) {
      const trimmed = text.trim();
      if (trimmed) onChangeRef.current(trimmed);
      return;
    }
    const label = PURPOSE_OPTIONS.find((o) => o.id === id)?.label;
    if (label) onChangeRef.current(label);
  }

  function handleCardClick(id: string): void {
    setSelectedId(id);
    if (id === ETC_ID) {
      emitFor(id, customText);
      return;
    }
    emitFor(id, '');
  }

  function handleCustomChange(text: string): void {
    setCustomText(text);
    if (selectedId === ETC_ID) emitFor(ETC_ID, text);
  }

  // Focus textarea when 기타 selected
  useEffect(() => {
    if (selectedId === ETC_ID) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [selectedId]);

  const isEtcSelected = selectedId === ETC_ID;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
        {PURPOSE_OPTIONS.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleCardClick(opt.id)}
              className={
                'flex items-center gap-3 rounded-[14px] border bg-surface px-3 py-3 text-left transition-colors ' +
                (isSelected
                  ? 'border-2 border-primary bg-primary-50'
                  : 'border-edge hover:border-primary/40 hover:bg-primary-50')
              }
            >
              <span
                className={
                  'inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] ' +
                  (isSelected ? 'bg-primary text-white' : 'bg-primary-100 text-primary')
                }
                aria-hidden="true"
              >
                <opt.icon size={18} strokeWidth={1.6} />
              </span>
              <span className="text-[13px] font-semibold text-ink">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-hidden={!isEtcSelected}
        className={
          'overflow-hidden transition-all duration-200 ease-out ' +
          (isEtcSelected ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 pointer-events-none')
        }
      >
        <textarea
          ref={textareaRef}
          rows={3}
          maxLength={MAX_CUSTOM_LENGTH}
          value={customText}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="직접 입력해주세요..."
          tabIndex={isEtcSelected ? 0 : -1}
          className={
            'w-full resize-none rounded-[14px] border border-primary/40 bg-surface ' +
            'px-4 py-3 text-[15px] text-ink placeholder:text-ink-mute ' +
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
          }
        />
        <div className="mt-1 text-right text-[11px] tabular-nums text-ink-mute">
          {customText.length} / {MAX_CUSTOM_LENGTH}
        </div>
      </div>
    </div>
  );
}
