import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FloorPlanCard } from '../components/booking/floorplan/FloorPlanCard';

describe('FloorPlanCard', () => {
  it('본당 1층은 평면도(SVG)를 렌더한다', () => {
    render(<FloorPlanCard buildingName="본당" floor={1} selectedSpaceName="자람뜰홀" />);
    expect(screen.getByRole('img', { name: '본당 1층 평면도' })).toBeInTheDocument();
    expect(screen.getByText('본당 · 1F 평면도')).toBeInTheDocument();
  });

  it('selectedSpaceName 으로 지정한 방만 강조 표시(data-selected)된다', () => {
    const { container } = render(
      <FloorPlanCard buildingName="본당" floor={1} selectedSpaceName="자람뜰홀" />,
    );
    const selected = container.querySelector('[data-room="자람뜰홀"]');
    const other = container.querySelector('[data-room="사랑방"]');
    expect(selected?.getAttribute('data-selected')).toBe('true');
    expect(other?.getAttribute('data-selected')).toBe('false');
  });

  it('selectedSpaceName 이 없으면 어떤 방도 강조하지 않는다', () => {
    const { container } = render(<FloorPlanCard buildingName="본당" floor={1} />);
    const rooms = container.querySelectorAll('[data-room]');
    expect(rooms.length).toBeGreaterThan(0);
    rooms.forEach((room) => {
      expect(room.getAttribute('data-selected')).toBe('false');
    });
  });

  it('등록된 평면도가 없는 건물/층은 "평면도 준비중입니다"를 표시한다', () => {
    render(<FloorPlanCard buildingName="가나안홀" floor={-1} />);
    expect(screen.getByText('평면도 준비중입니다')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // 헤더는 현재 보고 있는 건물/층에 맞춰 표시
    expect(screen.getByText('가나안홀 · 지하1F 평면도')).toBeInTheDocument();
  });
});
