import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BoardTimeline } from '../components/board/BoardTimeline';
import { axisTicks, type BoardRowItem } from '../lib/boardLayout';

const axisStartMs = new Date(2026, 5, 8, 13, 0, 0).getTime();
const ticks = axisTicks(new Date(2026, 5, 8, 13, 0, 0));
const noop = (): void => {};

function makeRow(over: Partial<BoardRowItem> = {}): BoardRowItem {
  return {
    id: 1,
    spaceName: '그루터기홀',
    locationLabel: '본당 2F',
    state: 'live',
    startISO: new Date(2026, 5, 8, 13, 0, 0).toISOString(),
    endISO: new Date(2026, 5, 8, 14, 30, 0).toISOString(),
    team: '청년부',
    applicantName: '김믿음',
    purpose: '정기모임',
    ...over,
  };
}

describe('BoardTimeline', () => {
  it('예약이 있으면 공간·팀·예약자·시간축을 렌더한다', () => {
    render(
      <BoardTimeline
        ticks={ticks}
        nowLeft={15.8}
        axisStartMs={axisStartMs}
        rows={[makeRow()]}
        isEmpty={false}
        emptyKind="building"
        emptyBuildingName=""
        onMouseEnter={noop}
        onMouseLeave={noop}
      />,
    );
    expect(screen.getByText('그루터기홀')).toBeInTheDocument();
    expect(screen.getByText('본당 2F')).toBeInTheDocument();
    expect(screen.getByText('청년부')).toBeInTheDocument();
    expect(screen.getByText('김믿음')).toBeInTheDocument();
    expect(screen.getByText('13:00')).toBeInTheDocument();
  });

  it('live 예약 블록은 primary 배경 클래스를 가진다', () => {
    const { container } = render(
      <BoardTimeline
        ticks={ticks}
        nowLeft={15.8}
        axisStartMs={axisStartMs}
        rows={[makeRow({ state: 'live' })]}
        isEmpty={false}
        emptyKind="building"
        emptyBuildingName=""
        onMouseEnter={noop}
        onMouseLeave={noop}
      />,
    );
    expect(container.querySelector('.bg-primary')).toBeTruthy();
  });

  it('upcoming 예약 블록은 accent 배경 클래스를 가진다', () => {
    const { container } = render(
      <BoardTimeline
        ticks={ticks}
        nowLeft={15.8}
        axisStartMs={axisStartMs}
        rows={[makeRow({ state: 'upcoming' })]}
        isEmpty={false}
        emptyKind="building"
        emptyBuildingName=""
        onMouseEnter={noop}
        onMouseLeave={noop}
      />,
    );
    expect(container.querySelector('.bg-accent')).toBeTruthy();
  });

  it('전체 0건이면 전체 빈 상태 안내를 보여준다', () => {
    render(
      <BoardTimeline
        ticks={ticks}
        nowLeft={15.8}
        axisStartMs={axisStartMs}
        rows={[]}
        isEmpty
        emptyKind="all"
        emptyBuildingName=""
        onMouseEnter={noop}
        onMouseLeave={noop}
      />,
    );
    expect(screen.getByText(/진행 중이거나 곧 시작하는 예약이 없습니다/)).toBeInTheDocument();
  });

  it('건물 0건이면 건물명을 포함한 안내를 보여준다', () => {
    render(
      <BoardTimeline
        ticks={ticks}
        nowLeft={15.8}
        axisStartMs={axisStartMs}
        rows={[]}
        isEmpty
        emptyKind="building"
        emptyBuildingName="가나안홀"
        onMouseEnter={noop}
        onMouseLeave={noop}
      />,
    );
    expect(screen.getByText('가나안홀')).toBeInTheDocument();
    expect(screen.getByText(/현재·예정 예약이 없습니다/)).toBeInTheDocument();
  });
});
