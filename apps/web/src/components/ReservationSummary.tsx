import { Reservation, ReservationStatus } from '../types';
import { formatDatetimeRange } from '../utils/formatDatetime';

interface ReservationSummaryProps {
  reservation: Reservation;
  onReset: () => void;
}

interface StatusBannerConfig {
  message: string;
  className: string;
}

function getStatusBannerConfig(status: ReservationStatus): StatusBannerConfig {
  if (status === 'confirmed') {
    return {
      message: '예약이 확정되었습니다',
      className: 'bg-green-100 text-green-800 border border-green-300',
    };
  }
  if (status === 'rejected') {
    return {
      message: '시간 충돌로 예약이 거절되었습니다',
      className: 'bg-red-100 text-red-800 border border-red-300',
    };
  }
  return {
    message: status,
    className: 'bg-gray-100 text-gray-800 border border-gray-300',
  };
}

function buildSpaceLabel(reservation: Reservation): string {
  const { space } = reservation;
  const buildingName = space.building.name;
  const floorPart = space.floor !== null ? `${space.floor}층 ` : '';
  return `${buildingName} ${floorPart}${space.name}`;
}

function ReservationSummary({ reservation, onReset }: ReservationSummaryProps): JSX.Element {
  const statusConfig = getStatusBannerConfig(reservation.status);
  const spaceLabel = buildSpaceLabel(reservation);
  const datetimeLabel = formatDatetimeRange(
    reservation.start_datetime,
    reservation.end_datetime,
  );

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className={`rounded-lg px-4 py-3 mb-6 text-center font-semibold text-base ${statusConfig.className}`}>
        {statusConfig.message}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">신청 내용 요약</h2>

          <dl className="space-y-3">
            <div className="flex">
              <dt className="w-28 flex-shrink-0 text-sm text-gray-500">신청 번호</dt>
              <dd className="text-sm font-medium text-gray-900">{reservation.id}</dd>
            </div>

            <div className="flex">
              <dt className="w-28 flex-shrink-0 text-sm text-gray-500">신청자 이름</dt>
              <dd className="text-sm font-medium text-gray-900">{reservation.applicant_name}</dd>
            </div>

            <div className="flex">
              <dt className="w-28 flex-shrink-0 text-sm text-gray-500">단체명</dt>
              <dd className="text-sm font-medium text-gray-900">{reservation.applicant_team}</dd>
            </div>

            <div className="flex">
              <dt className="w-28 flex-shrink-0 text-sm text-gray-500">공간</dt>
              <dd className="text-sm font-medium text-gray-900">{spaceLabel}</dd>
            </div>

            <div className="flex">
              <dt className="w-28 flex-shrink-0 text-sm text-gray-500">날짜·시간</dt>
              <dd className="text-sm font-medium text-gray-900">{datetimeLabel}</dd>
            </div>

            <div className="flex">
              <dt className="w-28 flex-shrink-0 text-sm text-gray-500">인원</dt>
              <dd className="text-sm font-medium text-gray-900">{reservation.headcount}명</dd>
            </div>

            <div className="flex">
              <dt className="w-28 flex-shrink-0 text-sm text-gray-500">사용 목적</dt>
              <dd className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{reservation.purpose}</dd>
            </div>
          </dl>
        </div>

        <div className="px-6 pb-5">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors duration-150"
          >
            새 신청하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationSummary;
