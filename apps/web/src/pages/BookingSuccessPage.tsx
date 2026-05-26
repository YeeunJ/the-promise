import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function BookingSuccessPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const reservationId = (location.state as { reservationId?: number } | null)?.reservationId;

  return (
    <div className="mx-auto flex h-full max-w-[640px] flex-col items-center justify-center px-10 py-16 text-center">
      <div
        className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary"
        aria-hidden="true"
      >
        <CheckCircle2 size={32} />
      </div>
      <h1 className="m-0 text-3xl font-extrabold tracking-[-0.025em] text-ink">
        예약 신청이 완료되었습니다
      </h1>
      {reservationId !== undefined && (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-bold tabular-nums text-primary">
          예약 번호 #{reservationId}
        </div>
      )}
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
         예약 내역은 '내 예약 조회'에서 확인하실 수 있습니다.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-[12px] border border-edge bg-surface px-6 py-3.5 text-sm font-semibold text-ink hover:bg-surface-2"
        >
          처음 화면으로
        </button>
        <button
          type="button"
          onClick={() => navigate('/my/login')}
          className="rounded-[12px] bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-design-primary hover:bg-primary-dark"
        >
          내 예약 조회
        </button>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
