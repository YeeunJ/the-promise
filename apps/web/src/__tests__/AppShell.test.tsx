import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell, deriveActiveTab } from '../components/AppShell';
import { LOOKUP_CREDENTIALS_STORAGE_KEY } from '../hooks/useLookupCredentials';

function renderWith(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<div data-testid="landing">L</div>} />
          <Route path="/booking" element={<div data-testid="booking">B</div>} />
          <Route path="/my" element={<div data-testid="my">M</div>} />
          <Route path="/my/login" element={<div data-testid="login">Login</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('deriveActiveTab', () => {
  it('returns null on Landing', () => {
    expect(deriveActiveTab('/')).toBeNull();
  });
  it('returns booking on /booking', () => {
    expect(deriveActiveTab('/booking')).toBe('booking');
    expect(deriveActiveTab('/booking?step=2')).toBe('booking');
  });
  it('returns lookup on /my and /my/login', () => {
    expect(deriveActiveTab('/my')).toBe('lookup');
    expect(deriveActiveTab('/my/login')).toBe('lookup');
  });
});

describe('AppShell', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders header brand label and current outlet child', () => {
    renderWith('/');
    expect(screen.getByText('가나안교회')).toBeInTheDocument();
    expect(screen.getByText('장소 사용 신청')).toBeInTheDocument();
    expect(screen.getByTestId('landing')).toBeInTheDocument();
  });

  it('booking tab is active on /booking', () => {
    renderWith('/booking');
    const bookingTab = screen.getByRole('button', { name: '예약 신청' });
    expect(bookingTab.getAttribute('aria-current')).toBe('page');
  });

  it('lookup tab is active on /my', () => {
    renderWith('/my');
    const lookupTab = screen.getByRole('button', { name: '내 예약 조회' });
    expect(lookupTab.getAttribute('aria-current')).toBe('page');
  });

  it('clicking 예약 신청 navigates to /booking', async () => {
    renderWith('/');
    await userEvent.click(screen.getByRole('button', { name: '예약 신청' }));
    expect(screen.getByTestId('booking')).toBeInTheDocument();
  });

  it('clicking 내 예약 조회 without creds navigates to /my/login', async () => {
    renderWith('/');
    await userEvent.click(screen.getByRole('button', { name: '내 예약 조회' }));
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('clicking 내 예약 조회 always navigates to /my/login and clears prior creds (공용 PC 다중 사용자 대응)', async () => {
    // 같은 컴퓨터에서 여러 명이 조회하므로, 저장된 creds 가 있어도 매번 재로그인을 강제하고
    // 이전 사용자의 creds 를 제거한다. (의도된 설계 — '/my' 직행은 추가하지 않는다)
    sessionStorage.setItem(
      LOOKUP_CREDENTIALS_STORAGE_KEY,
      JSON.stringify({ name: '홍길동', phone: '010-1234-5678' }),
    );
    renderWith('/');
    await userEvent.click(screen.getByRole('button', { name: '내 예약 조회' }));
    expect(screen.getByTestId('login')).toBeInTheDocument();
    expect(sessionStorage.getItem(LOOKUP_CREDENTIALS_STORAGE_KEY)).toBeNull();
  });
});
