import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useLookupCredentials } from '../hooks/useLookupCredentials';

type ActiveTab = 'booking' | 'lookup' | null;

function deriveActiveTab(pathname: string): ActiveTab {
  if (pathname === '/' || pathname === '') return null;
  if (pathname.startsWith('/booking')) return 'booking';
  if (pathname.startsWith('/my')) return 'lookup';
  return null;
}

export function AppShell(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { credentials } = useLookupCredentials();
  const active = deriveActiveTab(location.pathname);

  function goToBooking(): void {
    navigate('/booking');
  }

  function goToLookup(): void {
    navigate(credentials !== null ? '/my' : '/my/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <header className="bg-surface border-b border-edge-soft">
        <div className="max-w-[1180px] mx-auto px-10 py-[18px] flex items-center gap-[18px]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-[7px] bg-primary grid place-items-center text-white"
              aria-hidden="true"
            >
              <Building2 size={16} strokeWidth={1.8} />
            </div>
            <span className="font-extrabold text-[17px] tracking-[-0.02em] text-primary">
              가나안교회
            </span>
          </div>
          <div className="w-px h-4 bg-edge" aria-hidden="true" />
          <span className="text-sm text-ink-soft tracking-[-0.01em]">장소 사용 신청</span>

          <div className="flex-1" />

          <nav aria-label="페이지 탭" className="flex gap-1 p-1 bg-canvas rounded-full">
            <button
              type="button"
              onClick={goToBooking}
              aria-current={active === 'booking' ? 'page' : undefined}
              className={`px-4 py-[7px] rounded-full text-[13px] font-semibold tracking-[-0.01em] transition-colors ${
                active === 'booking'
                  ? 'bg-surface text-primary shadow-[0_1px_2px_rgba(20,30,25,0.06)]'
                  : 'bg-transparent text-ink-soft hover:text-primary'
              }`}
            >
              예약 신청
            </button>
            <button
              type="button"
              onClick={goToLookup}
              aria-current={active === 'lookup' ? 'page' : undefined}
              className={`px-4 py-[7px] rounded-full text-[13px] font-semibold tracking-[-0.01em] transition-colors ${
                active === 'lookup'
                  ? 'bg-surface text-primary shadow-[0_1px_2px_rgba(20,30,25,0.06)]'
                  : 'bg-transparent text-ink-soft hover:text-primary'
              }`}
            >
              내 예약 조회
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export { deriveActiveTab };
