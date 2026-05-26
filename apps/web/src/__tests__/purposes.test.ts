import { describe, it, expect } from 'vitest';
import { PURPOSE_OPTIONS, getPurposeLabelById } from '../data/purposes';

describe('PURPOSE_OPTIONS', () => {
  it('최소 1개 이상의 옵션이 존재한다', () => {
    expect(PURPOSE_OPTIONS.length).toBeGreaterThan(0);
  });

  it('각 옵션은 id, label, icon 필드를 가진다', () => {
    for (const opt of PURPOSE_OPTIONS) {
      expect(opt).toHaveProperty('id');
      expect(opt).toHaveProperty('label');
      expect(opt).toHaveProperty('icon');
    }
  });

  it('모든 id는 유일하다', () => {
    const ids = PURPOSE_OPTIONS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('기타(직접 입력) 옵션이 존재한다', () => {
    const etc = PURPOSE_OPTIONS.find((o) => o.id === 'etc');
    expect(etc).toBeDefined();
  });
});

describe('getPurposeLabelById', () => {
  it('존재하는 id로 label을 반환한다', () => {
    expect(getPurposeLabelById('worship')).toBe('예배 / 기도회');
  });

  it('존재하지 않는 id는 undefined를 반환한다', () => {
    expect(getPurposeLabelById('nonexistent')).toBeUndefined();
  });
});
