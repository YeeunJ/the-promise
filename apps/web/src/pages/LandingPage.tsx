import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Building2, ChevronRight } from 'lucide-react';
import { Eyebrow } from '../components/ui/Eyebrow';
import { Button } from '../components/ui/Button';
import { useLookupCredentials } from '../hooks/useLookupCredentials';
import type { BuildingWithSpaces } from '../types';

interface LandingStep {
  number: number;
  title: string;
  description: string;
}

const STEPS: readonly LandingStep[] = [
  { number: 1, title: '신청자 정보 입력', description: '이름·연락처·소속 부서' },
  { number: 2, title: '장소 선택', description: '건물 → 층 → 공간 순' },
  { number: 3, title: '인원 선택', description: '예상 사용 인원' },
  { number: 4, title: '날짜·시간 선택', description: '30분 단위 시간대' },
  { number: 5, title: '사용 목적 입력', description: '예배·모임·세미나 등' },
] as const;

interface LandingStat {
  value: string;
  label: string;
}

function LandingPage(): JSX.Element {
  const navigate = useNavigate();
  const { credentials } = useLookupCredentials();
  const [spaceCount, setSpaceCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    axios
      .get<BuildingWithSpaces[]>(`${import.meta.env.VITE_API_BASE_URL}/api/v1/spaces/`)
      .then((res) => {
        if (cancelled) return;
        const total = res.data.reduce((sum, b) => sum + b.spaces.length, 0);
        setSpaceCount(total);
      })
      .catch(() => {
        if (cancelled) return;
        setSpaceCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats: readonly LandingStat[] = [
    { value: spaceCount !== null ? String(spaceCount) : '—', label: '예약 가능 공간' },
    { value: '평균 90초', label: '신청 소요시간' },
  ];

  function handleStartBooking(): void {
    navigate('/booking');
  }

  function handleViewMy(): void {
    navigate(credentials !== null ? '/my' : '/my/login');
  }

  return (
    <div className="flex-1 max-w-[1180px] w-full mx-auto px-10 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-[560px]">
        {/* 좌측: 헤로 카피 */}
        <section aria-labelledby="landing-headline">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary rounded-full text-[11px] font-bold tracking-[0.04em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
            ONLINE BOOKING
          </div>
          <h1
            id="landing-headline"
            className="m-0 text-[48px] font-extrabold tracking-[-0.035em] leading-[1.15] text-ink"
          >
            교회 공간을
            <br />
            <span className="text-primary">5단계로 간편하게</span>
            <br />
            예약하세요
          </h1>
          <p className="mt-[18px] text-[15px] text-ink-soft leading-[1.6] max-w-[420px]">
            본당·가나안홀·무지개홀의{' '}
            {spaceCount !== null ? `${spaceCount}개 공간` : '공간'}을 누구나 손쉽게 신청할 수 있도록 새롭게 단장했습니다.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-7">
            <Button onClick={handleStartBooking} iconRight={<ArrowRight size={16} />}>
              장소 사용 신청하기
            </Button>
            <Button variant="ghost" onClick={handleViewMy}>
              내 예약 조회
            </Button>
          </div>
          <div className="mt-9 flex flex-wrap gap-7" role="list" aria-label="서비스 통계">
            {stats.map((stat) => (
              <div key={stat.label} role="listitem">
                <div className="text-[22px] font-extrabold tracking-[-0.02em] text-primary tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[11px] text-ink-mute mt-0.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 우측: 5-step 카드 */}
        <section aria-label="신청 절차" className="relative">
          <div
            className="absolute -inset-3.5 bg-primary-100 rounded-[28px] rotate-[-1.2deg]"
            aria-hidden="true"
          />
          <div className="relative bg-surface rounded-[22px] p-7 shadow-design-lg border border-edge-soft">
            <div className="flex justify-between items-start mb-[22px]">
              <div>
                <Eyebrow>5 STEPS</Eyebrow>
                <h2 className="mt-1.5 text-[19px] font-extrabold tracking-[-0.02em] text-ink">
                  신청 절차
                </h2>
              </div>
              <div
                className="w-11 h-11 rounded-[12px] bg-primary text-white grid place-items-center"
                aria-hidden="true"
              >
                <Building2 size={22} strokeWidth={1.8} />
              </div>
            </div>
            <ol className="m-0 p-0 list-none">
              {STEPS.map((step, idx) => (
                <li
                  key={step.number}
                  className={`flex items-center gap-3.5 py-3 ${
                    idx === 0 ? '' : 'border-t border-edge-soft'
                  }`}
                >
                  <div
                    className={`w-[30px] h-[30px] rounded-lg grid place-items-center text-[13px] font-bold flex-shrink-0 ${
                      idx === 0 ? 'bg-primary text-white' : 'bg-surface-2 text-ink-soft'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold tracking-[-0.01em] text-ink">
                      {step.title}
                    </div>
                    <div className="text-[11px] text-ink-mute mt-0.5">{step.description}</div>
                  </div>
                  <ChevronRight size={14} className="text-ink-mute flex-shrink-0" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
