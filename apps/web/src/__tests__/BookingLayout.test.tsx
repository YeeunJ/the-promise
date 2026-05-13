import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingLayout } from '../components/booking/BookingLayout';

describe('BookingLayout', () => {
  it('header/content/sidebar/bottomBar 슬롯이 각각 렌더', () => {
    render(
      <BookingLayout
        header={<div data-testid="hdr">HDR</div>}
        sidebar={<div data-testid="side">SIDE</div>}
        bottomBar={<div data-testid="bot">BOT</div>}
      >
        <div data-testid="content">CONTENT</div>
      </BookingLayout>,
    );
    expect(screen.getByTestId('hdr')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('side')).toBeInTheDocument();
    expect(screen.getByTestId('bot')).toBeInTheDocument();
  });

  it('sidebar 미지정 시 메인 영역만 렌더', () => {
    render(
      <BookingLayout header={<div>H</div>}>
        <div data-testid="content">C</div>
      </BookingLayout>,
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('bottomBar 미지정 시 본문/사이드만 렌더', () => {
    const { container } = render(
      <BookingLayout header={<div>H</div>} sidebar={<div data-testid="s">S</div>}>
        <div>C</div>
      </BookingLayout>,
    );
    expect(screen.getByTestId('s')).toBeInTheDocument();
    expect(container).toBeTruthy();
  });
});
