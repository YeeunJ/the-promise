import type { AxisTick, BoardRowItem } from '../../lib/boardLayout';
import { AXIS_COLS } from '../../lib/boardLayout';
import { BoardRow } from './BoardRow';
import { BoardEmpty } from './BoardEmpty';

const LABEL_W = 185;
const BODY_MIN_H = 402; // 6행(페이지 크기) 기준 고정 높이

interface BoardTimelineProps {
  ticks: AxisTick[];
  nowLeft: number;
  axisStartMs: number;
  rows: BoardRowItem[];
  isEmpty: boolean;
  emptyKind: 'all' | 'building';
  emptyBuildingName: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function BoardTimeline({
  ticks,
  nowLeft,
  axisStartMs,
  rows,
  isEmpty,
  emptyKind,
  emptyBuildingName,
  onMouseEnter,
  onMouseLeave,
}: BoardTimelineProps): JSX.Element {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] border border-edge-soft bg-surface pb-4 pt-2 shadow-design-lg"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="grid items-start border-b border-edge-soft px-6 pb-7 pt-3.5"
        style={{ gridTemplateColumns: `${LABEL_W}px 1fr` }}
      >
        <div />
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${AXIS_COLS},1fr)` }}>
          {ticks.map((t, i) => (
            <span
              key={i}
              className={`text-[11px] font-bold tracking-[0.02em] ${t.isHour ? 'text-ink-soft' : 'text-ink-mute'}`}
            >
              {t.label}
            </span>
          ))}
          <span
            className="absolute z-[7] rounded-md bg-danger px-[7px] py-[3px] text-[10px] font-extrabold leading-none tracking-[0.06em] text-white"
            style={{ left: `${nowLeft}%`, top: 'calc(100% + 7px)', transform: 'translateX(-50%)' }}
          >
            now
          </span>
        </div>
      </div>

      <div style={{ minHeight: BODY_MIN_H }}>
        {isEmpty ? (
          <BoardEmpty kind={emptyKind} buildingName={emptyBuildingName} />
        ) : (
          rows.map((row) => (
            <BoardRow key={row.id} row={row} nowLeft={nowLeft} axisStartMs={axisStartMs} labelWidth={LABEL_W} />
          ))
        )}
      </div>
    </div>
  );
}
