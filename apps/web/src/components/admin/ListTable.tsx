import type { Reservation } from '../../types';
import { extractDateStr, formatTime } from '../../utils/formatDatetime';
import { getBuildingColor } from '../../lib/adminConstants';
import { isCancellable } from '../../lib/reservationUtils';
import { StatusBadge } from '../ui/StatusBadge';

type DateOrdering = 'start_datetime' | '-start_datetime';

interface ListTableProps {
  reservations: Reservation[];
  onCancelRequest: (id: number) => void;
  onDetailRequest: (id: number) => void;
  // 정렬은 서버(백엔드 ordering 파라미터)가 책임. 둘 다 함께 전달되면
  // "날짜" 헤더가 토글 가능한 컨트롤로 바뀐다.
  ordering?: DateOrdering;
  onOrderingChange?: (next: DateOrdering) => void;
  // 빈 결과 메시지에 컨텍스트로 노출할 현재 검색어
  searchQuery?: string;
}

function formatShortDate(isoString: string): string {
  const dateStr = extractDateStr(isoString);
  const month = dateStr.slice(5, 7);
  const day = dateStr.slice(8, 10);
  return `${month}.${day}`;
}

const STATIC_HEADERS = [
  '건물', '장소', '시간', '이름', '부서', '인원', '목적', '상태', '액션',
] as const;

interface DateHeaderProps {
  ordering: DateOrdering | undefined;
  onOrderingChange: ((next: DateOrdering) => void) | undefined;
}

function DateHeader({
  ordering,
  onOrderingChange,
}: DateHeaderProps): JSX.Element {
  const sortable = ordering !== undefined && onOrderingChange !== undefined;

  if (!sortable) {
    return (
      <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase text-left">
        날짜
      </th>
    );
  }

  const isDesc = ordering === '-start_datetime';
  const ariaSort = isDesc ? 'descending' : 'ascending';
  const icon = isDesc ? '↓' : '↑';
  const next: DateOrdering = isDesc ? 'start_datetime' : '-start_datetime';

  return (
    <th
      aria-sort={ariaSort}
      className="px-3 py-2 text-xs font-medium text-gray-500 uppercase text-left"
    >
      <button
        type="button"
        onClick={() => onOrderingChange(next)}
        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
      >
        날짜
        <span aria-hidden="true" className="text-primary text-[10px]">
          {icon}
        </span>
      </button>
    </th>
  );
}

export function ListTable({
  reservations,
  onCancelRequest,
  onDetailRequest,
  ordering,
  onOrderingChange,
  searchQuery,
}: ListTableProps): JSX.Element {
  const isEmpty = reservations.length === 0;
  const trimmedQuery = searchQuery?.trim();
  const emptyMessage =
    trimmedQuery
      ? `검색어 '${trimmedQuery}'에 해당하는 예약이 없습니다.`
      : '조회된 예약이 없습니다.';

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
              <DateHeader
                ordering={ordering}
                onOrderingChange={onOrderingChange}
              />
              {STATIC_HEADERS.map((header) => (
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
            {reservations.map((reservation, index) => {
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
                    {reservation.applicant_team || '-'}
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
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onDetailRequest(reservation.id)}
                        className="text-xs px-2 py-1 rounded border border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
                      >
                        상세보기
                      </button>
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
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isEmpty && (
        <div
          role="status"
          className="px-4 py-8 text-center text-sm text-gray-500 border-t border-[#E5E7EB]"
        >
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
