import { useEffect, useState } from 'react';

/**
 * 서버 now(ISO)를 seed 로 받아 1초마다 진행하는 시계.
 * nowISO 가 갱신되면(폴링) 서버 시각으로 재동기화한다 — 디스플레이 로컬 시계 오차와 무관.
 */
export function useBoardClock(nowISO: string | null): Date | null {
  const [clock, setClock] = useState<Date | null>(null);

  useEffect(() => {
    if (!nowISO) return undefined;

    let current = new Date(nowISO);
    setClock(new Date(current.getTime()));

    const id = setInterval(() => {
      current = new Date(current.getTime() + 1000);
      setClock(new Date(current.getTime()));
    }, 1000);

    return () => clearInterval(id);
  }, [nowISO]);

  return clock;
}
