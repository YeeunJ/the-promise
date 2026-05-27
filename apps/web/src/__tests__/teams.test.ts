import { describe, it, expect } from 'vitest';
import {
  DEPARTMENTS,
  getDepartmentById,
  getTeamById,
  getPastorForTeam,
  buildPastorDisplay,
} from '../data/teams';

describe('DEPARTMENTS', () => {
  it('부서 목록이 최소 1개 이상이다', () => {
    expect(DEPARTMENTS.length).toBeGreaterThan(0);
  });

  it('각 부서는 id, name, teams 필드를 가진다', () => {
    for (const dept of DEPARTMENTS) {
      expect(dept).toHaveProperty('id');
      expect(dept).toHaveProperty('name');
      expect(dept).toHaveProperty('teams');
      expect(Array.isArray(dept.teams)).toBe(true);
    }
  });

  it('각 소그룹은 id, name, pastor 필드를 가진다', () => {
    for (const dept of DEPARTMENTS) {
      for (const team of dept.teams) {
        expect(team).toHaveProperty('id');
        expect(team).toHaveProperty('name');
        expect(team).toHaveProperty('pastor');
        expect(team.pastor).toHaveProperty('name');
        expect(team.pastor).toHaveProperty('title');
      }
    }
  });

  it('모든 팀 id는 전체에서 유일하다', () => {
    const ids = DEPARTMENTS.flatMap((d) => d.teams.map((t) => t.id));
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('getDepartmentById', () => {
  it('존재하는 id로 부서를 반환한다', () => {
    const dept = getDepartmentById('youth');
    expect(dept).toBeDefined();
    expect(dept?.name).toBe('청년부');
  });

  it('존재하지 않는 id로 undefined를 반환한다', () => {
    expect(getDepartmentById('nonexistent')).toBeUndefined();
  });
});

describe('getTeamById', () => {
  it('존재하는 팀 id로 팀을 반환한다', () => {
    const team = getTeamById('youth-1');
    expect(team).toBeDefined();
    expect(team?.name).toBe('1청년부');
  });

  it('존재하지 않는 id로 undefined를 반환한다', () => {
    expect(getTeamById('nonexistent')).toBeUndefined();
  });
});

describe('getPastorForTeam', () => {
  it('팀 id로 담당 교역자를 반환한다', () => {
    const pastor = getPastorForTeam('youth-1');
    expect(pastor).toBeDefined();
    expect(pastor?.name).toBe('김요셉');
    expect(pastor?.title).toBe('전도사');
  });

  it('기타/직접입력 팀은 빈 이름의 교역자를 반환한다', () => {
    const pastor = getPastorForTeam('etc-direct');
    expect(pastor).toBeDefined();
    expect(pastor?.name).toBe('');
  });

  it('존재하지 않는 id로 undefined를 반환한다', () => {
    expect(getPastorForTeam('nonexistent')).toBeUndefined();
  });
});

describe('buildPastorDisplay', () => {
  it('이름과 직책이 있으면 "이름 직책" 형식으로 반환한다', () => {
    expect(buildPastorDisplay({ name: '김요셉', title: '전도사' })).toBe('김요셉 전도사');
  });

  it('이름이 비어있으면 빈 문자열을 반환한다', () => {
    expect(buildPastorDisplay({ name: '', title: '' })).toBe('');
  });

  it('직책이 비어있으면 이름만 반환한다', () => {
    expect(buildPastorDisplay({ name: '홍길동', title: '' })).toBe('홍길동');
  });
});
