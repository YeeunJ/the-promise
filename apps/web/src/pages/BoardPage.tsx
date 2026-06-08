import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useBoardData } from '../hooks/useBoardData';
import { useBoardClock } from '../hooks/useBoardClock';
import {
  axisStart,
  axisTicks,
  formatClock,
  nowLeftPercent,
  pageCount,
  pageSlice,
  rowsForAll,
  rowsForBuilding,
} from '../lib/boardLayout';
import { BuildingTabs } from '../components/board/BuildingTabs';
import { BoardTimeline } from '../components/board/BoardTimeline';

const ROTATE_MS = 5000;
const SELECT_ALL = -1;

export function BoardPage(): JSX.Element {
  const navigate = useNavigate();
  const { data, isLoading, error } = useBoardData();
  const clock = useBoardClock(data?.now ?? null);

  const buildings = useMemo(() => data?.buildings ?? [], [data]);

  const [selIdx, setSelIdx] = useState(0); // SELECT_ALL = 전체
  const [pageIdx, setPageIdx] = useState(0);
  const [autoOn, setAutoOn] = useState(true);
  const [paused, setPaused] = useState(false);

  // 인터벌에서 최신 값을 읽기 위한 refs
  const selRef = useRef(selIdx);
  const pageRef = useRef(pageIdx);
  const buildingsRef = useRef(buildings);
  selRef.current = selIdx;
  pageRef.current = pageIdx;
  buildingsRef.current = buildings;

  // 자동 전환: 같은 건물에 다음 페이지가 있으면 페이지 넘김, 없으면 다음 건물
  useEffect(() => {
    if (!autoOn || paused || buildings.length === 0) return undefined;
    const id = setInterval(() => {
      const bs = buildingsRef.current;
      if (bs.length === 0) return;
      const sel = selRef.current >= 0 ? selRef.current : 0;
      const page = pageRef.current;
      const rows = rowsForBuilding(bs[sel] ?? bs[0]);
      if (page + 1 < pageCount(rows.length)) {
        setPageIdx(page + 1);
      } else {
        setSelIdx((sel + 1) % bs.length);
        setPageIdx(0);
      }
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [autoOn, paused, buildings.length]);

  const rows = selIdx < 0 ? rowsForAll(buildings) : buildings[selIdx] ? rowsForBuilding(buildings[selIdx]) : [];
  const pc = pageCount(rows.length);
  const safePage = Math.min(pageIdx, pc - 1);
  const visibleRows = pageSlice(rows, safePage);
  const isEmpty = rows.length === 0;
  const emptyKind: 'all' | 'building' = selIdx < 0 ? 'all' : 'building';
  const currentBuildingName = selIdx >= 0 && buildings[selIdx] ? buildings[selIdx].name : '';

  const axisStartDate = clock ? axisStart(clock) : null;
  const axisStartMs = axisStartDate ? axisStartDate.getTime() : 0;
  const ticks = axisStartDate ? axisTicks(axisStartDate) : [];
  const nowLeft = clock && axisStartDate ? nowLeftPercent(clock, axisStartMs) : 0;
  const clockLabel = clock ? formatClock(clock) : '--:--:--';

  const selectAll = (): void => {
    setAutoOn(false);
    setSelIdx(SELECT_ALL);
    setPageIdx(0);
  };
  const selectBuilding = (i: number): void => {
    setAutoOn(false);
    setSelIdx(i);
    setPageIdx(0);
  };
  const toggleAuto = (): void => {
    if (!autoOn && selIdx < 0) {
      setSelIdx(0);
      setPageIdx(0);
    }
    setAutoOn((v) => !v);
  };
  const prevPage = (): void => {
    setAutoOn(false);
    setPageIdx((p) => (p - 1 + pc) % pc);
  };
  const nextPage = (): void => {
    setAutoOn(false);
    setPageIdx((p) => (p + 1) % pc);
  };

  return (
    <div className="min-h-screen bg-canvas px-10 pb-16 pt-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-ink">실시간 예약 현황</h1>
          <Button size="sm" onClick={() => navigate('/booking')} iconRight={<ArrowRight size={16} />}>
            장소 사용 신청하기
          </Button>
        </div>

        {isLoading ? (
          <BoardMessage text="현황을 불러오는 중…" />
        ) : data === null ? (
          <BoardMessage text={error ?? '현황을 불러오지 못했습니다'} />
        ) : (
          <>
            <BuildingTabs
              buildingNames={buildings.map((b) => b.name)}
              selIdx={selIdx}
              onSelectAll={selectAll}
              onSelectBuilding={selectBuilding}
              autoOn={autoOn}
              onToggleAuto={toggleAuto}
              pager={{ show: pc > 1, page: safePage, count: pc, onPrev: prevPage, onNext: nextPage }}
              clock={clockLabel}
            />
            <BoardTimeline
              ticks={ticks}
              nowLeft={nowLeft}
              axisStartMs={axisStartMs}
              rows={visibleRows}
              isEmpty={isEmpty}
              emptyKind={emptyKind}
              emptyBuildingName={currentBuildingName}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function BoardMessage({ text }: { text: string }): JSX.Element {
  return (
    <div className="grid min-h-[300px] place-items-center rounded-[20px] border border-edge-soft bg-surface text-[14px] font-medium text-ink-mute shadow-design-lg">
      {text}
    </div>
  );
}

export default BoardPage;
