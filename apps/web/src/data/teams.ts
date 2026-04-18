export interface Pastor {
  name: string;
  title: string;
}

export interface Team {
  id: string;
  name: string;
  pastor: Pastor;
}

export interface Department {
  id: string;
  name: string;
  teams: Team[];
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'youth',
    name: '청년부',
    teams: [
      { id: 'youth-1', name: '1청년부', pastor: { name: '김요셉', title: '전도사' } },
      { id: 'youth-2', name: '2청년부', pastor: { name: '이다윗', title: '전도사' } },
      { id: 'youth-3', name: '3청년부', pastor: { name: '박믿음', title: '전도사' } },
    ],
  },
  {
    id: 'adult',
    name: '장년부',
    teams: [
      { id: 'adult-1', name: '1구역', pastor: { name: '최바울', title: '목사' } },
      { id: 'adult-2', name: '2구역', pastor: { name: '최바울', title: '목사' } },
      { id: 'adult-3', name: '3구역', pastor: { name: '정모세', title: '목사' } },
    ],
  },
  {
    id: 'children',
    name: '어린이부',
    teams: [
      { id: 'children-kindergarten', name: '유치부', pastor: { name: '한한나', title: '전도사' } },
      { id: 'children-elementary', name: '초등부', pastor: { name: '오나다', title: '전도사' } },
    ],
  },
  {
    id: 'worship',
    name: '찬양팀',
    teams: [
      { id: 'worship-sunday', name: '주일찬양팀', pastor: { name: '강다비드', title: '목사' } },
      { id: 'worship-special', name: '특별찬양팀', pastor: { name: '강다비드', title: '목사' } },
    ],
  },
  {
    id: 'etc',
    name: '기타',
    teams: [
      { id: 'etc-direct', name: '직접 입력', pastor: { name: '', title: '' } },
    ],
  },
];

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}

export function getTeamById(teamId: string): Team | undefined {
  for (const dept of DEPARTMENTS) {
    const team = dept.teams.find((t) => t.id === teamId);
    if (team) return team;
  }
  return undefined;
}

export function getPastorForTeam(teamId: string): Pastor | undefined {
  const team = getTeamById(teamId);
  return team?.pastor;
}

export function buildPastorDisplay(pastor: Pastor): string {
  if (!pastor.name) return '';
  if (!pastor.title) return pastor.name;
  return `${pastor.name} ${pastor.title}`;
}
