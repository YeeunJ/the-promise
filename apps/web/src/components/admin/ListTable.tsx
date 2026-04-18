import type { Reservation } from '../../types';
import { extractDateStr, formatTime } from '../../utils/formatDatetime';
import { getBuildingColor } from '../../lib/adminConstants';
import { isCancellable } from '../../lib/reservationUtils';
import { StatusBadge } from '../ui/StatusBadge';

interface ListTableProps {
  reservations: Reservation[];
  onCancelRequest: (id: number) => void;
}

function formatShortDate(isoString: string): string {
  const dateStr = extractDateStr(isoString);
  const month = dateStr.slice(5, 7);
  const day = dateStr.slice(8, 10);
  return `${month}.${day}`;
}

const COLUMN_HEADERS = [
  '날짜', '건물', '장소', '시간', '이름', '부서', '인원', '목적', '상태', '액션',
] as const;

export function ListTable({ reservations, onCancelRequest }: ListTableProps): JSX.Element {
  const sorted = [...reservations].sort(
    (a, b) => a.start_datetime.localeCompare(b.start_datetime),
  );

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB]">
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <span className="text-sm font-semibold text-gray-700">
          전체 예약 {reservations.length}건
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              {COLUMN_HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-3 py-2 text-xs font-medium text-gray-500 uppercase text-left"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((reservation, index) => {
              const buildingName = reservation.space.building.name;
              const buildingColor = getBuildingColor(buildingName);
              const cancellable = isCancellable(reservation.status);

              return (
                <tr
                  key={reservation.id}
                  className={`border-b border-[#E5E7EB] hover:bg-gray-50 ${
                    index % 2 === 1 ? 'bg-gray-50/50' : ''
                  }`}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatShortDate(reservation.start_datetime)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: buildingColor.bg,
                        color: buildingColor.main,
                      }}
                    >
                      {buildingName}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {reservation.space.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatTime(reservation.start_datetime)}-{formatTime(reservation.end_datetime)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {reservation.applicant_name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {reservation.applicant_team}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {reservation.headcount}
                  </td>
                  <td className="px-3 py-2 max-w-[150px] truncate">
                    {reservation.purpose}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <StatusBadge status={reservation.status} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      type="button"
                      disabled={!cancellable}
                      onClick={() => onCancelRequest(reservation.id)}
                      className={`text-xs px-2 py-1 rounded border ${
                        cancellable
                          ? 'text-[#DC2626] border-[#DC2626]/30 hover:bg-[#DC2626]/5 cursor-pointer'
                          : 'text-gray-400 border-gray-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      취소하기
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
