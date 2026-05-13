import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios, { isAxiosError } from 'axios';
import { Calendar, Check, MapPin, Pencil, Ticket, User, Users } from 'lucide-react';
import { useBookingDraft } from '../hooks/useBookingDraft';
import { resolveEditTarget } from '../lib/resolveEditTarget';
import { formatTime, formatTimeSlotLabel, formatDateStr } from '../utils/formatDatetime';
import type {
  ApiError,
  Reservation,
  ReservationFormData,
} from '../types';

function computeDuration(startISO: string, endISO: string): string {
  const ms = new Date(endISO).getTime() - new Date(startISO).getTime();
  if (ms <= 0) return '';
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function ConfirmationPage(): JSX.Element {
  const navigate = useNavigate();
  const { draft, isComplete, clear } = useBookingDraft();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isComplete || !draft.applicant || !draft.space) {
    return <Navigate to="/booking" replace />;
  }

  const applicant = draft.applicant;
  const space = draft.space;
  const { headcount, timeSlot, purpose } = draft;

  const teamLabel =
    applicant.teamId === null
      ? `${applicant.departmentName} · ${applicant.customTeamName ?? ''}`
      : `${applicant.departmentName} · ${applicant.teamName}`;
  const spaceLabel = `${space.buildingName}${space.floor !== null ? ` ${space.floor}층` : ''} ${space.spaceName}`;
  const dateLabel = formatDateStr(timeSlot.date);
  const timeLabel = `${formatTime(timeSlot.startTime)} — ${formatTimeSlotLabel(timeSlot.endTime, timeSlot.date)}`;
  const durationLabel = computeDuration(timeSlot.startTime, timeSlot.endTime);

  async function handleSubmit(): Promise<void> {
    setIsSubmitting(true);
    setSubmitError(null);
    const formData: ReservationFormData = {
      space: space.id,
      applicant_name: applicant.name,
      applicant_phone: applicant.phone,
      team: applicant.teamId,
      custom_team_name: applicant.customTeamName ?? '',
      leader_phone: applicant.pastorDisplay || '직접 문의',
      headcount,
      purpose: purpose.trim(),
      start_datetime: timeSlot.startTime,
      end_datetime: timeSlot.endTime,
    };
    try {
      await axios.post<Reservation>(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/`,
        formData,
      );
      clear();
      navigate('/booking/success', { replace: true });
    } catch (err) {
      let message = '예약 신청 중 오류가 발생했습니다. 다시 시도해주세요.';
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data as ApiError;
        message = data.message ?? message;
      }
      setSubmitError(message);
      const targetStep = resolveEditTarget(message);
      navigate(`/booking?step=${targetStep}&edit=1`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(): void {
    navigate('/booking');
  }

  return (
    <div className="mx-auto flex h-full max-w-[1180px] flex-col px-10 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
        {/* Left rail */}
        <div>
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1.5 text-[11px] font-bold tracking-[0.04em] text-primary">
            마지막 단계
          </div>
          <h1 className="m-0 text-4xl font-extrabold leading-[1.2] tracking-[-0.03em] text-ink">
            아래 내용을<br />확인하고 신청해주세요
          </h1>
          <p className="mt-3.5 text-sm leading-relaxed text-ink-soft">
            신청 후 담당자 검토를 거쳐 <b className="text-ink">약 2시간 내</b>로 확정 알림을 보내드립니다.
          </p>
        </div>

        {/* Ticket */}
        <div className="relative">
          <div
            className="absolute -inset-2 rounded-[22px] bg-primary opacity-[0.04]"
            style={{ transform: 'rotate(0.8deg)' }}
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[20px] border border-edge-soft bg-surface shadow-design-lg">
            <div className="flex items-center justify-between bg-primary px-7 py-6 text-white">
              <div>
                <div className="mb-1 text-[11px] font-bold tracking-[0.08em] opacity-70">
                  RESERVATION SUMMARY
                </div>
                <div className="text-xl font-extrabold tracking-[-0.02em]">
                  신청 내용 확인
                </div>
              </div>
              <div
                className="grid h-11 w-11 place-items-center rounded-[12px] bg-white/15"
                aria-hidden="true"
              >
                <Ticket size={22} />
              </div>
            </div>

            <div className="px-7 py-2">
              <TicketRow icon={<User size={16} />} label="신청자" value={applicant.name} sub={applicant.phone} />
              <TicketRow icon={<Users size={16} />} label="단체" value={teamLabel} sub={applicant.pastorDisplay} />
              <TicketRow icon={<MapPin size={16} />} label="장소" value={spaceLabel} sub={null} />
              <TicketRow icon={<Calendar size={16} />} label="일시" value={`${dateLabel} ${timeLabel}`} sub={durationLabel} />
              <TicketRow icon={<Users size={16} />} label="인원" value={`${headcount}명`} sub={null} />
              <TicketRow icon={<Pencil size={16} />} label="목적" value={purpose} sub={null} isLast />
            </div>

            <div
              className="h-3.5 border-t border-dashed border-edge-soft"
              style={{
                background:
                  'radial-gradient(circle at 7px 7px, #F4F1E8 5px, transparent 6px) repeat-x',
                backgroundSize: '14px 14px',
              }}
              aria-hidden="true"
            />

            {submitError && (
              <div className="mx-7 mt-4 rounded-[10px] bg-danger/10 px-4 py-3 text-sm text-danger">
                {submitError}
              </div>
            )}

            <div className="flex gap-2.5 px-7 pb-5 pt-4">
              <button
                type="button"
                onClick={handleEdit}
                className="flex-none rounded-[12px] border border-edge bg-surface px-6 py-3.5 text-sm font-semibold text-ink hover:bg-surface-2"
              >
                수정하기
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                className={
                  'inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] ' +
                  'bg-primary px-6 py-3.5 text-sm font-bold text-white ' +
                  'shadow-design-primary transition-colors ' +
                  (isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-dark')
                }
              >
                {isSubmitting ? '신청 중...' : '신청하기'}
                {!isSubmitting && <Check size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TicketRowProps {
  icon: JSX.Element;
  label: string;
  value: string;
  sub: string | null;
  isLast?: boolean;
}

function TicketRow({ icon, label, value, sub, isLast = false }: TicketRowProps): JSX.Element {
  return (
    <div
      className={
        'flex items-center gap-3.5 py-3 ' +
        (isLast ? '' : 'border-b border-dashed border-edge-soft')
      }
    >
      <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[10px] bg-surface-2 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[11px] font-medium text-ink-mute">{label}</div>
        <div className="truncate text-sm font-bold tracking-[-0.01em] text-ink">
          {value}
        </div>
      </div>
      {sub && (
        <div className="flex-none text-right text-[11px] text-ink-mute">{sub}</div>
      )}
    </div>
  );
}

export default ConfirmationPage;
