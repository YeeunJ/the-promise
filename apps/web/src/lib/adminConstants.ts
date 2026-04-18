export interface BuildingColor {
  main: string;
  bg: string;
  border: string;
}

export const BUILDING_COLORS: Record<string, BuildingColor> = {
  '본당': { main: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  '가나안홀': { main: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  '무지개홀': { main: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
};

export const DEFAULT_BUILDING_COLOR: BuildingColor = {
  main: '#6B7280',
  bg: '#F9FAFB',
  border: '#E5E7EB',
};

export function getBuildingColor(buildingName: string): BuildingColor {
  return BUILDING_COLORS[buildingName] ?? DEFAULT_BUILDING_COLOR;
}
