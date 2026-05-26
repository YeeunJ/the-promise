import { describe, it, expect } from 'vitest';
import {
  BUILDING_COLORS,
  DEFAULT_BUILDING_COLOR,
  getBuildingColor,
} from '../lib/adminConstants';
import type { BuildingColor } from '../lib/adminConstants';

describe('BUILDING_COLORS', () => {
  it('본당 컬러가 명세 값과 일치한다', () => {
    const color: BuildingColor = BUILDING_COLORS['본당'];
    expect(color).toEqual({
      main: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
    });
  });

  it('가나안홀 컬러가 명세 값과 일치한다', () => {
    const color: BuildingColor = BUILDING_COLORS['가나안홀'];
    expect(color).toEqual({
      main: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
    });
  });

  it('무지개홀 컬러가 명세 값과 일치한다', () => {
    const color: BuildingColor = BUILDING_COLORS['무지개홀'];
    expect(color).toEqual({
      main: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
    });
  });

  it('정확히 3개 건물만 정의되어 있다', () => {
    expect(Object.keys(BUILDING_COLORS)).toHaveLength(3);
  });
});

describe('DEFAULT_BUILDING_COLOR', () => {
  it('기본 컬러가 회색 계열 명세 값과 일치한다', () => {
    expect(DEFAULT_BUILDING_COLOR).toEqual({
      main: '#6B7280',
      bg: '#F9FAFB',
      border: '#E5E7EB',
    });
  });
});

describe('getBuildingColor', () => {
  it('등록된 건물명에 대해 해당 컬러를 반환한다', () => {
    expect(getBuildingColor('본당')).toEqual(BUILDING_COLORS['본당']);
    expect(getBuildingColor('가나안홀')).toEqual(BUILDING_COLORS['가나안홀']);
    expect(getBuildingColor('무지개홀')).toEqual(BUILDING_COLORS['무지개홀']);
  });

  it('알 수 없는 건물명에 대해 기본값을 반환한다', () => {
    expect(getBuildingColor('교육관')).toEqual(DEFAULT_BUILDING_COLOR);
  });

  it('빈 문자열에 대해 기본값을 반환한다', () => {
    expect(getBuildingColor('')).toEqual(DEFAULT_BUILDING_COLOR);
  });
});
