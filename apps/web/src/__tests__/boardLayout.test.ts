import { describe, it, expect } from 'vitest';
import {
  axisStart,
  axisTicks,
  blockGeometry,
  floorLabel,
  formatClock,
  locationLabel,
  nowLeftPercent,
  pageCount,
  pageSlice,
} from '../lib/boardLayout';

describe('floorLabel / locationLabel', () => {
  it('층을 F/B 표기로 변환한다', () => {
    expect(floorLabel(2)).toBe('2F');
    expect(floorLabel(-1)).toBe('B1');
    expect(floorLabel(null)).toBe('');
  });

  it('건물 + 층을 합친다', () => {
    expect(locationLabel('본당', 2)).toBe('본당 2F');
    expect(locationLabel('가나안홀', -1)).toBe('가나안홀 B1');
    expect(locationLabel('무지개홀', null)).toBe('무지개홀');
  });
});

describe('axisStart', () => {
  it('현재 시각을 정시로 내린다', () => {
    const start = axisStart(new Date(2026, 5, 8, 13, 38, 42));
    expect(start.getHours()).toBe(13);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
  });
});

describe('blockGeometry', () => {
  const axisMs = new Date(2026, 5, 8, 13, 0, 0).getTime(); // 축 13:00~17:00(4h)

  it('축 내 예약의 left/width(%)를 계산한다 (13:00–14:30 → 0%, 37.5%)', () => {
    const geo = blockGeometry(
      new Date(2026, 5, 8, 13, 0, 0).toISOString(),
      new Date(2026, 5, 8, 14, 30, 0).toISOString(),
      axisMs,
    );
    expect(geo).toEqual({ left: 0, width: 37.5 });
  });

  it('축 시작 이전은 0%로 클리핑한다 (12:00–13:30 → 0%, 12.5%)', () => {
    const geo = blockGeometry(
      new Date(2026, 5, 8, 12, 0, 0).toISOString(),
      new Date(2026, 5, 8, 13, 30, 0).toISOString(),
      axisMs,
    );
    expect(geo).toEqual({ left: 0, width: 12.5 });
  });

  it('축을 벗어난 예약은 null', () => {
    const geo = blockGeometry(
      new Date(2026, 5, 8, 18, 0, 0).toISOString(),
      new Date(2026, 5, 8, 19, 0, 0).toISOString(),
      axisMs,
    );
    expect(geo).toBeNull();
  });
});

describe('nowLeftPercent', () => {
  it('13:38 → 15.8%(=38/240)', () => {
    const axisMs = new Date(2026, 5, 8, 13, 0, 0).getTime();
    const pct = nowLeftPercent(new Date(2026, 5, 8, 13, 38, 0), axisMs);
    expect(pct).toBeCloseTo((38 / 240) * 100, 5);
  });
});

describe('axisTicks', () => {
  it('30분 간격 8칸, 정시 플래그', () => {
    const ticks = axisTicks(new Date(2026, 5, 8, 13, 0, 0));
    expect(ticks).toHaveLength(8);
    expect(ticks[0]).toEqual({ label: '13:00', isHour: true });
    expect(ticks[1]).toEqual({ label: '13:30', isHour: false });
    expect(ticks[7]).toEqual({ label: '16:30', isHour: false });
  });
});

describe('pageCount / pageSlice', () => {
  it('페이지 수 (6개 기준)', () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(6)).toBe(1);
    expect(pageCount(7)).toBe(2);
    expect(pageCount(13)).toBe(3);
  });

  it('페이지 슬라이스', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(pageSlice(items, 0)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pageSlice(items, 1)).toEqual([7, 8]);
  });
});

describe('formatClock', () => {
  it('오전/오후 H:MM:SS', () => {
    expect(formatClock(new Date(2026, 5, 8, 13, 38, 42))).toBe('오후 1:38:42');
    expect(formatClock(new Date(2026, 5, 8, 0, 5, 3))).toBe('오전 12:05:03');
    expect(formatClock(new Date(2026, 5, 8, 12, 0, 0))).toBe('오후 12:00:00');
  });
});
