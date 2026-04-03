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
  applicant_team: string;
  leader_phone: string;
  headcount: number;
  purpose: string;
  start_datetime: string;
  end_datetime: string;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface TimeSlotValue {
  date: string;
  startTime: string;
  endTime: string;
}
