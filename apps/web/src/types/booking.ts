/**
 * Booking 도메인 타입.
 * 5단계 신청 흐름 전반에서 공유되는 핵심 데이터 형태를 정의한다.
 */

export interface ApplicantData {
  name: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  teamId: number | null;
  teamName: string;
  customTeamName: string | null;
  pastorDisplay: string;
}

export interface SpaceSelection {
  id: number;
  buildingName: string;
  floor: number | null;
  spaceName: string;
}

/**
 * 평면도가 가리키는 위치(건물+층).
 * 사용자가 공간 선택 단계에서 "현재 보고 있는" 건물/층을 나타내며,
 * 장소 확정 여부와 무관하게 평면도 표시 기준이 된다.
 */
export interface FloorPlanLocation {
  buildingName: string;
  floor: number | null;
}
