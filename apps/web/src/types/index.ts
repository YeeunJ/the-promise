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
  team: ApiTeam | null;
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

export interface OccupiedSlot {
  start_datetime: string;
  end_datetime: string;
}

export interface TimeSlotValue {
  date: string;
  startTime: string;
  endTime: string;
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
