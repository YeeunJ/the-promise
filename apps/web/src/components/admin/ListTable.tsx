import type { Reservation } from '../../types';
import { extractDateStr, formatTime } from '../../utils/formatDatetime';
import { getBuildingColor } from '../../lib/adminConstants';
import { isCancellable } from '../../lib/reservationUtils';
import { StatusBadge } from '../ui/StatusBadge';

interface ListTableProps {
  reservations: Reservation[];
  onCancelRequest: (id: number) => void;
  onDetailRequest: (id: number) => void;
  // 정렬은 서버(백엔드 ordering 파라미터)가 책임. 둘 다 함께 전달되면
  // 정렬 가능한 컬럼 헤더가 토글 컨트롤로 바뀐다. 형식: 'field'(오름) | '-field'(내림)
  ordering?: string;
  onOrderingChange?: (next: string) => void;
  // 빈 결과 메시지에 컨텍스트로 노출할 현재 검색어
  searchQuery?: string;
}

function formatShortDate(isoString: string): string {
  const dateStr = extractDateStr(isoString);
  const month = dateStr.slice(5, 7);
  const day = dateStr.slice(8, 10);
  return `${month}.${day}`;
}

interface HeaderConfig {
  label: string;
  // 백엔드 ordering 필드. 지정 시 정렬 가능 컬럼이 된다.
  // 날짜·시간은 모두 start_datetime 기준(통합 정렬)이다.
  field?: string;
}

const HEADERS: readonly HeaderConfig[] = [
  { label: '날짜', field: 'start_datetime' },
  { label: '건물', field: 'space__building__name' },
  { label: '장소' },
  { label: '시간', field: 'start_datetime' },
  { label: '이름', field: 'applicant_name' },
  { label: '부서' },
  { label: '인원', field: 'headcount' },
  { label: '목적' },
  { label: '상태', field: 'status' },
  { label: '액션' },
] as const;

function parseOrdering(
  ordering: string | undefined,
): { field: string; desc: boolean } | null {
  if (!ordering) return null;
  const desc = ordering.startsWith('-');
  return { field: desc ? ordering.slice(1) : ordering, desc };
}

interface SortableHeaderProps {
  config: HeaderConfig;
  ordering: string | undefined;
  onOrderingChange: ((next: string) => void) | undefined;
}

function SortableHeader({
  config,
  ordering,
  onOrderingChange,
}: SortableHeaderProps): JSX.Element {
  const thClass =
    'px-3 py-2 text-xs font-medium text-gray-500 uppercase text-left';
  const sortable = config.field !== undefined && onOrderingChange !== undefined;

  if (!sortable || config.field === undefined) {
    return <th className={thClass}>{config.label}</th>;
  }

  const parsed = parseOrdering(ordering);
  const isActive = parsed?.field === config.field;
  const isDesc = isActive && parsed.desc;
  // 비활성 컬럼 → 오름차순부터. 활성 컬럼 → 방향 토글.
  const next = !isActive
    ? config.field
    : isDesc
      ? config.field
      : `-${config.field}`;
  const ariaSort = isActive ? (isDesc ? 'descending' : 'ascending') : 'none';
  const icon = isActive ? (isDesc ? '↓' : '↑') : '↕';

  return (
    <th aria-sort={ariaSort} className={thClass}>
      <button
        type="button"
        onClick={() => onOrderingChange(next)}
        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
      >
        {config.label}
        <span
          aria-hidden="true"
          className={`text-[10px] ${isActive ? 'text-primary' : 'text-gray-300'}`}
        >
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
              {HEADERS.map((config, index) => (
                <SortableHeader
                  key={`${config.label}-${String(index)}`}
                  config={config}
                  ordering={ordering}
                  onOrderingChange={onOrderingChange}
                />
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
                      {cancellable && (
                        <button
                          type="button"
                          onClick={() => onCancelRequest(reservation.id)}
                          className="text-xs px-2 py-1 rounded border text-[#DC2626] border-[#DC2626]/30 hover:bg-[#DC2626]/5 cursor-pointer"
                        >
                          취소하기
                        </button>
                      )}
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
