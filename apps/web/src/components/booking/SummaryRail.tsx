import type { BookingDraft } from '../../hooks/useBookingDraft';
import { HEADCOUNT_OPTIONS } from '@/lib/constants';
import { formatDateStr, formatTime } from '../../utils/formatDatetime';

interface SummaryRailProps {
  draft: BookingDraft;
  isStepValid: (step: number) => boolean;
}

interface RailItem {
  label: string;
  value: string | null;
  filled: boolean;
}

function buildItems(draft: BookingDraft, isStepValid: (step: number) => boolean): RailItem[] {
  const applicantValue = draft.applicant
    ? `${draft.applicant.name} · ${draft.applicant.phone}\n${draft.applicant.departmentName}`
    : null;

  const spaceValue = draft.space
    ? `${draft.space.buildingName}${draft.space.floor !== null ? ` ${draft.space.floor}층` : ''} · 수용 ${draft.space.spaceName}`
    : null;

  const headcountValue =
    draft.headcount > 0
      ? (HEADCOUNT_OPTIONS.find((o) => o.value === draft.headcount)?.label ?? `${draft.headcount}명`)
      : null;

  const timeSlot = draft.timeSlot;
  const timeValue =
    timeSlot.date && timeSlot.startTime && timeSlot.endTime
      ? `${formatDateStr(timeSlot.date)}\n${formatTime(timeSlot.startTime)} — ${formatTime(timeSlot.endTime)}`
      : null;

  const purposeValue = draft.purpose.trim() || null;

  return [
    { label: '신청자', value: applicantValue, filled: isStepValid(1) },
    { label: '장소', value: spaceValue, filled: isStepValid(2) },
    { label: '인원', value: headcountValue, filled: isStepValid(3) },
    { label: '일시', value: timeValue, filled: isStepValid(4) },
    { label: '사용 목적', value: purposeValue, filled: isStepValid(5) },
  ];
}

export function SummaryRail({ draft, isStepValid }: SummaryRailProps): JSX.Element {
  const items = buildItems(draft, isStepValid);
  const filledCount = items.filter((item) => item.filled).length;

  return (
    <div className="sticky top-[110px] w-[280px]">
      <div className="bg-surface rounded-2xl border border-edge shadow-design-md p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-ink">신청 현황</span>
          <span className="text-xs font-semibold text-ink-soft tabular-nums">
            {filledCount}/5
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.label} className="flex gap-2.5">
              <div className="mt-0.5 shrink-0">
                {item.filled ? (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-surface"
                      fill="none"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-edge-soft bg-surface-2" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-ink-soft mb-0.5">{item.label}</div>
                {item.value ? (
                  <div className="text-xs text-ink whitespace-pre-line">{item.value}</div>
                ) : (
                  <div className="text-xs text-ink-mute">선택 전</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filledCount === 0 && (
          <p className="mt-4 text-[11px] text-ink-mute text-center leading-relaxed">
            채워질 때마다 여기에 실시간으로 표시돼요.
          </p>
        )}
      </div>
    </div>
  );
}
