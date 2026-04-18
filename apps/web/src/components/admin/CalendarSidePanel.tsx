import { useMemo } from 'react';
import type { Reservation } from '../../types';
import { extractDateStr, formatTime } from '../../utils/formatDatetime';
import { getBuildingColor } from '../../lib/adminConstants';
import { isCancellable } from '../../lib/reservationUtils';
import { StatusBadge } from '../ui/StatusBadge';

interface CalendarSidePanelProps {
  selectedDate: string | null;
  reservations: Reservation[];
  onCancelRequest: (id: number) => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatSelectedDate(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  const dayLabel = DAY_LABELS[date.getDay()];
  return `${yearStr}.${monthStr}.${dayStr} (${dayLabel})`;
}

function groupByBuilding(reservations: readonly Reservation[]): Map<string, Reservation[]> {
  const groups = new Map<string, Reservation[]>();
  for (const r of reservations) {
    const buildingName = r.space.building.name;
    const group = groups.get(buildingName);
    if (group) {
      group.push(r);
    } else {
      groups.set(buildingName, [r]);
    }
  }
  for (const group of groups.values()) {
    group.sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));
  }
  return groups;
}

export function CalendarSidePanel({
  selectedDate,
  reservations,
  onCancelRequest,
}: CalendarSidePanelProps): JSX.Element {
  const dayReservations = useMemo(() => {
    if (!selectedDate) return [];
    return reservations.filter(
      (r) => extractDateStr(r.start_datetime) === selectedDate
    );
  }, [selectedDate, reservations]);

  const buildingGroups = useMemo(
    () => groupByBuilding(dayReservations),
    [dayReservations]
  );

  const buildingNames = useMemo(
    () => Array.from(buildingGroups.keys()),
    [buildingGroups]
  );

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-gray-400">날짜를 선택해주세요</p>
      </div>
    );
  }

  if (dayReservations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] p-6">
        <h2 className="text-base font-bold text-black mb-4">
          {formatSelectedDate(selectedDate)}
        </h2>
        <p className="text-sm text-gray-400 text-center py-8">예약이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] flex flex-col overflow-hidden"
         style={{ maxHeight: 'calc(100vh - 120px)' }}>
      {/* 날짜 헤더 */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-black">
            {formatSelectedDate(selectedDate)}
          </h2>
          <span className="text-sm text-gray-500">{dayReservations.filter((r) => r.status === 'confirmed').length}건</span>
        </div>

        {/* 건물 범례 */}
        <div className="flex gap-3 mt-2" data-testid="building-legend">
          {buildingNames.map((name) => {
            const color = getBuildingColor(name);
            return (
              <div key={name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color.main }}
                />
                {name}
              </div>
            );
          })}
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th className="w-1 p-0" />
              <th className="text-xs font-medium text-gray-500 uppercase px-3 py-2 text-left">장소</th>
              <th className="text-xs font-medium text-gray-500 uppercase px-3 py-2 text-left">시간</th>
              <th className="text-xs font-medium text-gray-500 uppercase px-3 py-2 text-left">부서</th>
              <th className="text-xs font-medium text-gray-500 uppercase px-3 py-2 text-left">이름</th>
              <th className="text-xs font-medium text-gray-500 uppercase px-3 py-2 text-left">인원</th>
              <th className="text-xs font-medium text-gray-500 uppercase px-3 py-2 text-left">목적</th>
              <th className="text-xs font-medium text-gray-500 uppercase px-3 py-2 text-left">상태</th>
              <th className="text-xs font-medium text-gray-500 uppercase px-3 py-2 text-left">액션</th>
            </tr>
          </thead>
          <tbody>
            {buildingNames.map((buildingName) => {
              const group = buildingGroups.get(buildingName) ?? [];
              const color = getBuildingColor(buildingName);

              return (
                <BuildingGroup
                  key={buildingName}
                  buildingName={buildingName}
                  reservations={group}
                  color={color}
                  onCancelRequest={onCancelRequest}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface BuildingGroupProps {
  buildingName: string;
  reservations: Reservation[];
  color: { main: string; bg: string; border: string };
  onCancelRequest: (id: number) => void;
}

function BuildingGroup({
  buildingName,
  reservations,
  color,
  onCancelRequest,
}: BuildingGroupProps): JSX.Element {
  return (
    <>
      {/* 건물 그룹 헤더 */}
      <tr
        className="sticky top-[33px] z-[5]"
        style={{ backgroundColor: color.bg }}
      >
        <td colSpan={9} className="px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: color.main }}
            />
            <span className="text-xs font-semibold" style={{ color: color.main }}>
              {buildingName}
            </span>
            <span className="text-xs text-gray-400">{reservations.filter((r) => r.status === 'confirmed').length}건</span>
          </div>
        </td>
      </tr>

      {/* 예약 행 */}
      {reservations.map((r) => (
        <tr
          key={r.id}
          data-testid="reservation-row"
          className="border-b border-[#E5E7EB] hover:bg-gray-50"
        >
          <td className="p-0" style={{ borderLeft: `4px solid ${color.main}` }} />
          <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
            {r.space.name}
          </td>
          <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
            {formatTime(r.start_datetime)}-{formatTime(r.end_datetime)}
          </td>
          <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
            {r.applicant_team}
          </td>
          <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
            {r.applicant_name}
          </td>
          <td className="px-3 py-2 text-xs text-gray-700 text-center">
            {r.headcount}
          </td>
          <td className="px-3 py-2 text-xs text-gray-700">
            {r.purpose}
          </td>
          <td className="px-3 py-2">
            <StatusBadge status={r.status} />
          </td>
          <td className="px-3 py-2">
            <button
              type="button"
              disabled={!isCancellable(r.status)}
              onClick={() => onCancelRequest(r.id)}
              className="rounded border border-[#E5E7EB] px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소하기
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
