import {
  BookOpen,
  Coffee,
  GraduationCap,
  Heart,
  Music,
  PartyPopper,
  Pencil,
  SquarePen,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface PurposeOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const PURPOSE_OPTIONS: PurposeOption[] = [
  { id: "regular-meeting", label: "구역 모임", icon: SquarePen },
  { id: "worship", label: "예배 / 기도회", icon: Heart },
  { id: "bible-study", label: "성경 공부", icon: BookOpen },
  { id: "choir-practice", label: "찬양 연습", icon: Music },
  { id: "seminar", label: "세미나 / 강의", icon: GraduationCap },
  { id: "fellowship", label: "친교 / 식사", icon: Coffee },
  { id: "committee", label: "위원회 / 회의", icon: Users },
  { id: "event", label: "행사 / 특별 집회", icon: PartyPopper },
  { id: "etc", label: "기타 (직접 입력)", icon: Pencil },
];

export function getPurposeLabelById(id: string): string | undefined {
  return PURPOSE_OPTIONS.find((o) => o.id === id)?.label;
}
