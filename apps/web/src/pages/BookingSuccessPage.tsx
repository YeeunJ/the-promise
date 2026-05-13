import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function BookingSuccessPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex h-full max-w-[640px] flex-col items-center justify-center px-10 py-16 text-center">
      <div
        className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary"
        aria-hidden="true"
      >
        <CheckCircle2 size={32} />
      </div>
      <h1 className="m-0 text-3xl font-extrabold tracking-[-0.025em] text-ink">
        신청이 접수되었습니다
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        담당자 검토 후 약 2시간 내로 확정 알림을 보내드립니다. 신청 내역은 ‘내 예약 조회’에서 확인하실 수 있습니다.
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
