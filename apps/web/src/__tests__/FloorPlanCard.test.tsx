import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FloorPlanCard } from '../components/booking/floorplan/FloorPlanCard';
import type { SpaceSelection } from '../types/booking';

const mainHall: SpaceSelection = {
  id: 1,
  buildingName: '본당',
  floor: 1,
  spaceName: '자람뜰홀',
};

describe('FloorPlanCard', () => {
  it('본당 1층은 평면도(SVG)를 렌더한다', () => {
    render(<FloorPlanCard space={mainHall} />);
    expect(screen.getByRole('img', { name: '본당 1층 평면도' })).toBeInTheDocument();
    expect(screen.getByText('본당 · 1F 평면도')).toBeInTheDocument();
  });

  it('선택한 방만 강조 표시(data-selected)된다', () => {
    const { container } = render(<FloorPlanCard space={mainHall} />);
    const selected = container.querySelector('[data-room="자람뜰홀"]');
    const other = container.querySelector('[data-room="사랑방"]');
    expect(selected?.getAttribute('data-selected')).toBe('true');
    expect(other?.getAttribute('data-selected')).toBe('false');
  });

  it('등록된 평면도가 없는 건물/층은 "평면도 준비중입니다"를 표시한다', () => {
    const space: SpaceSelection = {
      id: 9,
      buildingName: '가나안홀',
      floor: -1,
      spaceName: '에벤에셀홀',
    };
    render(<FloorPlanCard space={space} />);
    expect(screen.getByText('평면도 준비중입니다')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // 헤더는 선택한 건물/층에 맞춰 표시
    expect(screen.getByText('가나안홀 · 지하1F 평면도')).toBeInTheDocument();
  });
});
