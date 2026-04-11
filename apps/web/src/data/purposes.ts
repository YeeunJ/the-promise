export interface PurposeOption {
  id: string;
  label: string;
  icon: string;
}

export const PURPOSE_OPTIONS: PurposeOption[] = [
  { id: 'regular-meeting', label: '정기 모임', icon: '📋' },
  { id: 'worship', label: '예배 / 기도회', icon: '🙏' },
  { id: 'bible-study', label: '성경 공부', icon: '📖' },
  { id: 'choir-practice', label: '찬양 연습', icon: '🎵' },
  { id: 'seminar', label: '세미나 / 강의', icon: '🎓' },
  { id: 'fellowship', label: '친교 / 식사', icon: '🍽️' },
  { id: 'committee', label: '위원회 / 회의', icon: '🤝' },
  { id: 'event', label: '행사 / 특별 집회', icon: '🎉' },
  { id: 'etc', label: '기타 (직접 입력)', icon: '✏️' },
];

export function getPurposeLabelById(id: string): string | undefined {
  return PURPOSE_OPTIONS.find((o) => o.id === id)?.label;
}
