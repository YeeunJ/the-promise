import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import { LOOKUP_CREDENTIALS_STORAGE_KEY } from '../hooks/useLookupCredentials';

function renderLanding(): void {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<div data-testid="booking">Booking</div>} />
        <Route path="/my" element={<div data-testid="my">My</div>} />
        <Route path="/my/login" element={<div data-testid="login">Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders the headline with brand emphasis', () => {
    renderLanding();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/교회 공간을/);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/5단계로 간편하게/);
  });

  it('renders ONLINE BOOKING eyebrow', () => {
    renderLanding();
    expect(screen.getByText('ONLINE BOOKING')).toBeInTheDocument();
  });

  it('renders 5 step rows', () => {
    renderLanding();
    expect(screen.getByText('신청자 정보 입력')).toBeInTheDocument();
    expect(screen.getByText('장소 선택')).toBeInTheDocument();
    expect(screen.getByText('인원 선택')).toBeInTheDocument();
    expect(screen.getByText('날짜·시간 선택')).toBeInTheDocument();
    expect(screen.getByText('사용 목적 입력')).toBeInTheDocument();
  });

  it('renders stats (예약 가능 공간, 신청 소요시간)', () => {
    renderLanding();
    expect(screen.getByText('예약 가능 공간')).toBeInTheDocument();
    expect(screen.getByText('신청 소요시간')).toBeInTheDocument();
  });

  it('primary CTA navigates to /booking', async () => {
    renderLanding();
    await userEvent.click(screen.getByRole('button', { name: /장소 사용 신청하기/ }));
    expect(screen.getByTestId('booking')).toBeInTheDocument();
  });

  it('secondary CTA without creds navigates to /my/login', async () => {
    renderLanding();
    await userEvent.click(screen.getByRole('button', { name: '내 예약 조회' }));
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('secondary CTA with creds navigates to /my', async () => {
    sessionStorage.setItem(
      LOOKUP_CREDENTIALS_STORAGE_KEY,
      JSON.stringify({ name: '홍길동', phone: '010-1234-5678' }),
    );
    renderLanding();
    await userEvent.click(screen.getByRole('button', { name: '내 예약 조회' }));
    expect(screen.getByTestId('my')).toBeInTheDocument();
  });
});
