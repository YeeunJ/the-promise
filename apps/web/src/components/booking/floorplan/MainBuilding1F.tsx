import type { FloorPlanProps } from './floorPlanRegistry';

/**
 * 본당 1F 평면도 (읽기 전용 표시).
 * 좌표계는 viewBox 1000x957 기준이며, 만들어진 평면도 시안의 방 배치를 따른다.
 * 선택된 방(selectedSpaceName)만 sage green 으로 강조한다. 클릭/선택 상호작용은 없다.
 */

// 색상 상수 — Refined Sage 토큰 계열 (SVG 내부는 className 대신 명시 색상 사용)
const WALL = '#2A2A28';
const CORRIDOR = '#F4F1E8'; // token: canvas
const ROOM_HALL = '#EAE1CF'; // 베이지 (홀/쉼터)
const ROOM_OFFICE = '#E3E0D6'; // 회베이지 (사무 공간)
const ROOM_SELECTED = '#A9C9B6'; // 진한 sage green (선택 강조)
const LABEL_HALL = '#3A3833';
const LABEL_OFFICE = '#8E8A7C';
const LABEL_SELECTED = '#123D2D'; // 진한 sage green (primary #1F5F4A 보다 어둡게 강조)
const ENTRANCE = '#6F6A5C';

type RoomTone = 'hall' | 'office';

interface FloorPlanRoom {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: RoomTone;
}

const MAIN_1F_ROOMS: readonly FloorPlanRoom[] = [
  { name: '쉴만한물가', x: 10, y: 10, w: 303, h: 505, tone: 'hall' },
  { name: '자람뜰홀', x: 461, y: 10, w: 526, h: 475, tone: 'hall' },
  { name: '교역자실', x: 666, y: 504, w: 321, h: 156, tone: 'office' },
  { name: '사무실', x: 590, y: 665, w: 400, h: 282, tone: 'office' },
  { name: '사랑방', x: 124, y: 585, w: 313, h: 359, tone: 'hall' },
];

function roomFill(tone: RoomTone, isSelected: boolean): string {
  if (isSelected) return ROOM_SELECTED;
  return tone === 'hall' ? ROOM_HALL : ROOM_OFFICE;
}

function labelColor(tone: RoomTone, isSelected: boolean): string {
  if (isSelected) return LABEL_SELECTED;
  return tone === 'hall' ? LABEL_HALL : LABEL_OFFICE;
}

export function MainBuilding1F({ selectedSpaceName }: FloorPlanProps): JSX.Element {
  return (
    <svg
      viewBox="-10 -58 1020 1086"
      className="w-full h-auto"
      role="img"
      aria-label="본당 1층 평면도"
    >
      {/* 복도 배경 + 외곽 벽 */}
      <rect x={0} y={0} width={1000} height={957} rx={4} fill={CORRIDOR} />
      <rect
        x={0}
        y={0}
        width={1000}
        height={957}
        rx={4}
        fill="none"
        stroke={WALL}
        strokeWidth={16}
      />

      {/* 방 */}
      {MAIN_1F_ROOMS.map((room) => {
        const isSelected = room.name === selectedSpaceName;
        const cx = room.x + room.w / 2;
        const cy = room.y + room.h / 2;
        const fontSize = room.tone === 'office' ? 27 : 34;
        return (
          <g key={room.name} data-room={room.name} data-selected={isSelected}>
            <rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              rx={3}
              fill={roomFill(room.tone, isSelected)}
              stroke={WALL}
              strokeWidth={13}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fontWeight={isSelected ? 700 : 600}
              fill={labelColor(room.tone, isSelected)}
            >
              {room.name}
            </text>
          </g>
        );
      })}

      {/* 입구 (상단) */}
      <g aria-hidden="true">
        <path
          d="M138 -26 L155 -10 L172 -26"
          fill="none"
          stroke={ENTRANCE}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x={155} y={-38} textAnchor="middle" fontSize={24} fill={ENTRANCE}>
          입구
        </text>
      </g>

      {/* 입구 (하단) */}
      <g aria-hidden="true">
        <path
          d="M495 983 L512 967 L529 983"
          fill="none"
          stroke={ENTRANCE}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x={512} y={1010} textAnchor="middle" fontSize={24} fill={ENTRANCE}>
          입구
        </text>
      </g>
    </svg>
  );
}
