import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface BookingFailedState {
  reason?: 'conflict' | 'error';
}

export function BookingFailedPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = (location.state as BookingFailedState | null)?.reason ?? 'error';
  const isConflict = reason === 'conflict';

  const description = isConflict
    ? '선택하신 시간대에 이미 다른 예약이 등록되어 있어 예약이 완료되지 못했습니다. 시간이나 장소를 변경해 다시 시도해주세요.'
    : '예약 처리 중 문제가 발생해 예약이 완료되지 못했습니다. 잠시 후 다시 시도해주세요.';

  return (
    <div className="mx-auto flex h-full max-w-[640px] flex-col items-center justify-center px-10 py-16 text-center">
      <div
        className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger"
        aria-hidden="true"
      >
        <AlertTriangle size={32} />
      </div>
      <h1 className="m-0 text-3xl font-extrabold tracking-[-0.025em] text-ink">
        예약을 완료하지 못했습니다
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        {description}
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
          onClick={() => navigate('/booking')}
          className="rounded-[12px] bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-design-primary hover:bg-primary-dark"
        >
          시간·장소 다시 선택
        </button>
      </div>
    </div>
  );
}

export default BookingFailedPage;
