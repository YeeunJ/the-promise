import type { BoardBuilding, BoardReservation, BoardState } from '../types';

// 타임라인 축: 현재 정시부터 4시간(30분 8칸)
export const AXIS_HOURS = 4;
export const AXIS_COLS = 8;
export const PAGE_SIZE = 6;

const AXIS_MS = AXIS_HOURS * 60 * 60 * 1000;
const HALF_HOUR_MS = 30 * 60 * 1000;

export interface BoardRowItem {
  id: number;
  spaceName: string;
  locationLabel: string; // 예: "본당 2F"
  state: BoardState;
  startISO: string;
  endISO: string;
  team: string;
  applicantName: string;
  purpose: string;
}

export function floorLabel(floor: number | null): string {
  if (floor === null) return '';
  if (floor < 0) return `B${-floor}`;
  return `${floor}F`;
}

export function locationLabel(buildingName: string, floor: number | null): string {
  const f = floorLabel(floor);
  return f ? `${buildingName} ${f}` : buildingName;
}

export function toRowItem(reservation: BoardReservation, buildingName: string): BoardRowItem {
  return {
    id: reservation.id,
    spaceName: reservation.space.name,
    locationLabel: locationLabel(buildingName, reservation.space.floor),
    state: reservation.state,
    startISO: reservation.start_datetime,
    endISO: reservation.end_datetime,
    team: reservation.applicant_team,
    applicantName: reservation.applicant_name,
    purpose: reservation.purpose,
  };
}

export function rowsForBuilding(building: BoardBuilding): BoardRowItem[] {
  return building.reservations.map((r) => toRowItem(r, building.name));
}

export function rowsForAll(buildings: readonly BoardBuilding[]): BoardRowItem[] {
  return buildings.flatMap((b) => rowsForBuilding(b));
}

// 축 시작 = now 를 정시(시)로 내림
export function axisStart(now: Date): Date {
  const d = new Date(now.getTime());
  d.setMinutes(0, 0, 0);
  return d;
}

export interface BlockGeometry {
  left: number;
  width: number;
}

/** 예약 블록의 left/width(%) — 축 밖은 클리핑, 보이지 않으면 null */
export function blockGeometry(startISO: string, endISO: string, axisStartMs: number): BlockGeometry | null {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  const left = clampPercent(((start - axisStartMs) / AXIS_MS) * 100);
  const right = clampPercent(((end - axisStartMs) / AXIS_MS) * 100);
  const width = right - left;
  if (width <= 0) return null;
  return { left, width };
}

export function nowLeftPercent(now: Date, axisStartMs: number): number {
  return clampPercent(((now.getTime() - axisStartMs) / AXIS_MS) * 100);
}

export interface AxisTick {
  label: string;
  isHour: boolean;
}

export function axisTicks(start: Date): AxisTick[] {
  const ticks: AxisTick[] = [];
  for (let i = 0; i < AXIS_COLS; i += 1) {
    const t = new Date(start.getTime() + i * HALF_HOUR_MS);
    const mm = t.getMinutes();
    ticks.push({ label: `${pad2(t.getHours())}:${pad2(mm)}`, isHour: mm === 0 });
  }
  return ticks;
}

export function pageCount(total: number, pageSize: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function pageSlice<T>(items: readonly T[], pageIdx: number, pageSize: number = PAGE_SIZE): T[] {
  const start = pageIdx * pageSize;
  return items.slice(start, start + pageSize);
}

/** "오후 1:38:42" 형식 (로컬 시각 기준) */
export function formatClock(d: Date): string {
  const h24 = d.getHours();
  const ampm = h24 < 12 ? '오전' : '오후';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${ampm} ${h12}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
