import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LookupLoginPage from '../pages/LookupLoginPage';
import { LOOKUP_CREDENTIALS_STORAGE_KEY } from '../hooks/useLookupCredentials';

vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

function renderPage(): void {
  render(
    <MemoryRouter initialEntries={['/my/login']}>
      <Routes>
        <Route path="/my/login" element={<LookupLoginPage />} />
        <Route path="/my" element={<div data-testid="my-target">My</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LookupLoginPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: { count: 1, results: [] } });
  });

  it('renders heading and helper note', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: '내 예약 조회' })).toBeInTheDocument();
    expect(screen.getByText(/예약 신청 시 입력한 이름과 연락처/)).toBeInTheDocument();
  });

  it('renders name and phone inputs', () => {
    renderPage();
    expect(screen.getByLabelText(/이름/)).toBeInTheDocument();
    expect(screen.getByLabelText(/연락처/)).toBeInTheDocument();
  });

  it('shows error when name is empty', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /예약 조회하기/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('이름을 입력해주세요.');
  });

  it('shows error when phone is empty', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/이름/), '홍길동');
    await userEvent.click(screen.getByRole('button', { name: /예약 조회하기/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('연락처를 입력해주세요.');
  });

  it('on successful submit, saves credentials and navigates to /my', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/이름/), '홍길동');
    await userEvent.type(screen.getByLabelText(/연락처/), '01012345678');
    await userEvent.click(screen.getByRole('button', { name: /예약 조회하기/ }));
    await waitFor(() => expect(screen.getByTestId('my-target')).toBeInTheDocument());
    const stored = sessionStorage.getItem(LOOKUP_CREDENTIALS_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored ?? '{}') as { name: string; phone: string };
    expect(parsed.name).toBe('홍길동');
    expect(parsed.phone).toMatch(/^010-?\d{4}-?\d{4}$/);
  });
});
