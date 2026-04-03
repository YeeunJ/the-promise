import { formatDatetimeRange } from '../utils/formatDatetime';
import type { Reservation, ReservationStatus } from '../types/index';

interface ReservationTableProps {
  reservations: Reservation[];
}

interface StatusBadgeConfig {
  label: string;
  className: string;
}

const STATUS_BADGE: Record<ReservationStatus, StatusBadgeConfig> = {
  confirmed: { label: '확정', className: 'bg-green-100 text-green-800' },
  rejected:  { label: '거절', className: 'bg-red-100 text-red-800' },
  cancelled: { label: '취소', className: 'bg-gray-100 text-gray-800' },
  pending:   { label: '대기', className: 'bg-yellow-100 text-yellow-800' },
};

function formatSpaceName(space: Reservation['space']): string {
  const floorPart = space.floor !== null ? `${space.floor}층 ` : '';
  return `${space.building.name} ${floorPart}${space.name}`;
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const config = STATUS_BADGE[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }): JSX.Element {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">No. {reservation.id}</span>
        <StatusBadge status={reservation.status} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          {formatSpaceName(reservation.space)}
        </p>
        <p className="text-sm text-gray-600 mt-0.5">
          {formatDatetimeRange(reservation.start_datetime, reservation.end_datetime)}
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>{reservation.headcount}명</span>
        <span className="truncate">{reservation.purpose}</span>
      </div>
    </div>
  );
}

function ReservationTable({ reservations }: ReservationTableProps): JSX.Element {
  if (reservations.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">조회된 예약이 없습니다.</p>
    );
  }

  return (
    <>
      {/* 모바일: 카드 리스트 (md 미만) */}
      <div className="flex flex-col gap-3 md:hidden">
        {reservations.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>

      {/* 데스크탑: 테이블 (md 이상) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                번호
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                공간
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                날짜·시간
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                인원
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용목적
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">
                  {reservation.id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatSpaceName(reservation.space)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {formatDatetimeRange(
                    reservation.start_datetime,
                    reservation.end_datetime
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {reservation.headcount}명
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {reservation.purpose}
                </td>
                <td className="px-4 py-3 text-sm">
                  <StatusBadge status={reservation.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ReservationTable;
