import type { BoardRowItem } from '../../lib/boardLayout';
import { AXIS_COLS, blockGeometry } from '../../lib/boardLayout';

interface BoardRowProps {
  row: BoardRowItem;
  nowLeft: number;
  axisStartMs: number;
  labelWidth: number;
}

export function BoardRow({ row, nowLeft, axisStartMs, labelWidth }: BoardRowProps): JSX.Element {
  const geo = blockGeometry(row.startISO, row.endISO, axisStartMs);
  const isLive = row.state === 'live';

  return (
    <div
      className="grid items-center border-b border-edge-soft px-6 last:border-b-0 hover:bg-surface-2"
      style={{ gridTemplateColumns: `${labelWidth}px 1fr`, minHeight: 66 }}
    >
      <div className="flex flex-col gap-0.5 pr-3.5">
        <span className="text-[14px] font-bold tracking-[-0.01em] text-ink">{row.spaceName}</span>
        <span className="text-[12px] font-semibold text-ink-soft">{row.locationLabel}</span>
      </div>

      <div className="relative" style={{ height: 52 }}>
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${AXIS_COLS},1fr)` }}>
          {Array.from({ length: AXIS_COLS }).map((_, i) => (
            <div key={i} className={i === 0 ? '' : 'border-l border-edge-soft'} />
          ))}
        </div>

        <div className="absolute z-[5] w-0.5 bg-danger" style={{ left: `${nowLeft}%`, top: -8, bottom: -8 }} />

        {geo && (
          <div
            className={`absolute flex flex-col justify-center gap-0.5 overflow-hidden rounded-lg px-[11px] py-1 text-white ${
              isLive ? 'bg-primary' : 'bg-accent'
            }`}
            style={{ left: `${geo.left}%`, width: `${geo.width}%`, top: 5, height: 42 }}
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-extrabold leading-[1.15]">
              {row.team}
            </span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] font-semibold leading-[1.15] opacity-90">
              {row.purpose} · <span className="font-bold opacity-100">{row.applicantName}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
