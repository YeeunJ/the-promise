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
