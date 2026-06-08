export interface Building {
  id: number;
  name: string;
  description: string | null;
}

export interface Space {
  id: number;
  building: Building;
  name: string;
  floor: number | null;
  capacity: number | null;
  description: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface BuildingWithSpaces extends Building {
  spaces: Space[];
}

export type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface Reservation {
  id: number;
  space: Space;
  applicant_name: string;
  applicant_phone: string;
  applicant_team: string;
  team: number | null;
  custom_team_name: string | null;
  leader_phone: string;
  headcount: number;
  purpose: string;
  start_datetime: string;
  end_datetime: string;
  status: ReservationStatus;
  admin_note: string | null;
  created_at: string;
}

// --- 실시간 예약 현황 보드 (/board) ---

export type BoardState = 'live' | 'upcoming';

export interface BoardReservation {
  id: number;
  space: { id: number; name: string; floor: number | null };
  applicant_team: string;
  applicant_name: string;
  purpose: string;
  start_datetime: string;
  end_datetime: string;
  status: ReservationStatus;
  state: BoardState;
}

export interface BoardBuilding {
  id: number;
  name: string;
  reservations: BoardReservation[];
}

export interface BoardResponse {
  now: string;
  window_minutes: number;
  buildings: BoardBuilding[];
}

export interface ReservationFormData {
  space: number;
  applicant_name: string;
  applicant_phone: string;
  team: number | null;
  custom_team_name: string | null;
  leader_phone: string;
  headcount: number;
  purpose: string;
  start_datetime: string;
  end_datetime: string;
}

export interface ApiPastor {
  id: number;
  name: string;
  title: string;
}

export interface ApiTeam {
  id: number;
  name: string;
  pastor: ApiPastor | null;
  pastor_display: string;
}

export interface ApiDepartment {
  id: number;
  name: string;
  display_order: number;
  pastor: ApiPastor | null;
  teams: ApiTeam[];
}

export interface ApiError {
  error: string;
  message: string;
}

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
}

export interface OccupiedSlot {
  start_datetime: string;
  end_datetime: string;
}

export interface TimeSlotValue {
  date: string;
  startTime: string;
  endTime: string;
}

export interface OverlappingReservation {
  start_datetime: string;
  end_datetime: string;
}

export interface SpaceAvailabilityItem {
  id: number;
  name: string;
  floor: number | null;
  capacity: number | null;
  availability: 'full' | 'partial' | 'none';
  overlapping_reservations: OverlappingReservation[];
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
}

export type ActivePopup = 'applicant' | 'space' | 'headcount' | 'datetime' | 'purpose';

export { ADMIN_TOKEN_KEY } from '../lib/constants';

export interface UpdateReservationStatusPayload {
  status: 'confirmed' | 'rejected' | 'cancelled';
  admin_note?: string;
}

// --- Admin CRUD (phase 1.5.2) ---

export interface AdminTeamPastor {
  id: number;
  name: string;
  title: string;
}

export interface AdminTeamDepartment {
  id: number;
  name: string;
  pastor: AdminTeamPastor | null;
}

export interface AdminTeam {
  id: number;
  name: string;
  department: AdminTeamDepartment | null;
  // /admin/teams/ 응답에는 pastor_display 가 없다. 표시는 클라에서 `${name} ${title}` 조합
  pastor: AdminTeamPastor | null;
  leader_phone: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminTeamWritePayload {
  name: string;
  department: number | null;
  pastor: number | null;
  leader_phone: string;
}

export interface AdminBuilding {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminBuildingWritePayload {
  name: string;
  description: string | null;
}

export interface AdminSpaceBuilding {
  id: number;
  name: string;
  description: string | null;
}

export interface AdminSpace {
  id: number;
  building: AdminSpaceBuilding;
  name: string;
  floor: number | null;
  capacity: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminSpaceWritePayload {
  building: number;
  name: string;
  floor: number | null;
  capacity: number | null;
  description: string | null;
}
