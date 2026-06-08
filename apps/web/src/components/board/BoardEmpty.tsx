import { CalendarCheck, DoorOpen } from 'lucide-react';

interface BoardEmptyProps {
  kind: 'all' | 'building';
  buildingName: string;
}

export function BoardEmpty({ kind, buildingName }: BoardEmptyProps): JSX.Element {
  if (kind === 'all') {
    return (
      <div className="flex flex-col items-center gap-[7px] px-6 pb-14 pt-[52px] text-center">
        <div className="mb-1 grid h-[60px] w-[60px] place-items-center rounded-[18px] border border-primary-100 bg-primary-50 text-primary">
          <CalendarCheck size={28} />
        </div>
        <div className="text-[16px] font-extrabold tracking-[-0.02em] text-ink">
          지금은 진행 중이거나 곧 시작하는 예약이 없습니다
        </div>
        <div className="text-[13px] font-medium text-ink-mute">
          다음 2시간 내 예정된 예약이 없어요 · 모든 공간이 비어 있습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-[7px] px-6 pb-14 pt-[52px] text-center">
      <div className="mb-1 grid h-[60px] w-[60px] place-items-center rounded-[18px] border border-edge-soft bg-surface-2 text-ink-mute">
        <DoorOpen size={26} />
      </div>
      <div className="text-[16px] font-extrabold tracking-[-0.02em] text-ink">
        <span className="text-primary">{buildingName}</span> — 현재·예정 예약이 없습니다
      </div>
      <div className="text-[13px] font-medium text-ink-mute">이 건물의 모든 공간을 지금 사용할 수 있어요.</div>
    </div>
  );
}
