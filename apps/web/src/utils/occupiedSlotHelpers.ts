import type { OccupiedSlot } from '../types';

export function isSlotOccupied(
  slot: string,
  occupiedSlots: ReadonlyArray<OccupiedSlot>,
): boolean {
  const slotMs = new Date(slot).getTime();
  const end = new Date(slotMs + 1).toISOString();
  return hasOccupiedBetween(slot, end, occupiedSlots);
}

export function hasOccupiedBetween(
  start: string,
  end: string,
  occupiedSlots: ReadonlyArray<OccupiedSlot>,
): boolean {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return occupiedSlots.some(
    ({ start_datetime, end_datetime }) => {
      const occStart = new Date(start_datetime).getTime();
      const occEnd = new Date(end_datetime).getTime();
      return occEnd > startMs && occStart < endMs;
    },
  );
}

export function validateOccupiedSlots(data: unknown): OccupiedSlot[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is OccupiedSlot =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.start_datetime === 'string' &&
      typeof item.end_datetime === 'string' &&
      !Number.isNaN(new Date(item.start_datetime).getTime()) &&
      !Number.isNaN(new Date(item.end_datetime).getTime()),
  );
}
