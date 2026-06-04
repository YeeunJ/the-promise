import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BookingFailedPage } from '../pages/BookingFailedPage';

function renderAt(state?: { reason?: 'conflict' | 'error' }): void {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/booking/failed', state }]}>
      <Routes>
        <Route path="/booking/failed" element={<BookingFailedPage />} />
        <Route path="/booking" element={<div>BookingPage</div>} />
        <Route path="/" element={<div>Landing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BookingFailedPage', () => {
  it('실패 제목을 항상 표시', () => {
    renderAt();
    expect(screen.getByText('예약을 완료하지 못했습니다')).toBeInTheDocument();
  });

  it('reason=conflict 면 시간 충돌 안내 문구 표시', () => {
    renderAt({ reason: 'conflict' });
    expect(screen.getByText(/이미 다른 예약이 등록/)).toBeInTheDocument();
  });

  it('"시간·장소 다시 선택" 클릭 → /booking 으로 이동', async () => {
    const user = userEvent.setup();
    renderAt({ reason: 'conflict' });
    await user.click(screen.getByRole('button', { name: '시간·장소 다시 선택' }));
    expect(screen.getByText('BookingPage')).toBeInTheDocument();
  });

  it('"처음 화면으로" 클릭 → / 로 이동', async () => {
    const user = userEvent.setup();
    renderAt();
    await user.click(screen.getByRole('button', { name: '처음 화면으로' }));
    expect(screen.getByText('Landing')).toBeInTheDocument();
  });
});
