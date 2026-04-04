import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AdminLoginForm from '../components/AdminLoginForm';
import { ADMIN_TOKEN_KEY } from '../types';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('AdminLoginForm', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('"관리자 로그인" 제목을 렌더링한다 (happy path)', () => {
    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);
    expect(screen.getByText('관리자 로그인')).toBeInTheDocument();
  });

  it('아이디와 비밀번호 입력 필드를 렌더링한다', () => {
    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);
    expect(screen.getByLabelText('아이디')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
  });

  it('"로그인" 버튼을 렌더링한다', () => {
    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('비밀번호 필드의 type이 password이다', () => {
    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);
    const passwordInput = screen.getByLabelText('비밀번호');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('로그인 성공 시 onLoginSuccess 콜백이 호출된다 (happy path)', async () => {
    const user = userEvent.setup();
    const onLoginSuccess = vi.fn();
    const token = 'valid-token-abc123';

    mockedAxios.post = vi.fn().mockResolvedValueOnce({ data: { token } });

    render(<AdminLoginForm onLoginSuccess={onLoginSuccess} />);

    await user.type(screen.getByLabelText('아이디'), 'admin');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('로그인 성공 시 토큰이 localStorage에 저장된다 (happy path)', async () => {
    const user = userEvent.setup();
    const token = 'valid-token-abc123';

    mockedAxios.post = vi.fn().mockResolvedValueOnce({ data: { token } });

    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('아이디'), 'admin');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBe(token);
    });
  });

  it('로그인 실패 시 에러 메시지를 표시한다 (error case)', async () => {
    const user = userEvent.setup();
    const axiosError = { isAxiosError: true, response: { status: 401 } };
    mockedAxios.post = vi.fn().mockRejectedValueOnce(axiosError);

    // isAxiosError를 true로 반환하도록 mock
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('아이디'), 'wrong');
    await user.type(screen.getByLabelText('비밀번호'), 'wrong');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(
        screen.getByText('아이디 또는 비밀번호가 올바르지 않습니다.')
      ).toBeInTheDocument();
    });
  });

  it('로그인 실패 시 localStorage에 토큰이 저장되지 않는다 (error case)', async () => {
    const user = userEvent.setup();
    mockedAxios.post = vi.fn().mockRejectedValueOnce(new Error('Network Error'));

    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('아이디'), 'wrong');
    await user.type(screen.getByLabelText('비밀번호'), 'wrong');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
    });
  });

  it('로그인 진행 중 버튼이 "로그인 중..." 텍스트로 변경된다', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockedAxios.post = vi.fn().mockReturnValueOnce(pendingPromise);

    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('아이디'), 'admin');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인 중...' })).toBeInTheDocument();
    });

    // 정리: promise resolve
    resolveLogin!({ data: { token: 'tok' } });
  });

  it('로그인 진행 중 버튼이 disabled 상태가 된다', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockedAxios.post = vi.fn().mockReturnValueOnce(pendingPromise);

    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('아이디'), 'admin');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인 중...' })).toBeDisabled();
    });

    resolveLogin!({ data: { token: 'tok' } });
  });

  it('아이디와 비밀번호 필드가 빈 값이면 기본 HTML required 검증이 작동한다 (boundary case)', () => {
    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);
    const usernameInput = screen.getByLabelText('아이디');
    const passwordInput = screen.getByLabelText('비밀번호');
    expect(usernameInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('초기 상태에서 에러 메시지가 표시되지 않는다 (boundary case)', () => {
    render(<AdminLoginForm onLoginSuccess={vi.fn()} />);
    expect(
      screen.queryByText('아이디 또는 비밀번호가 올바르지 않습니다.')
    ).not.toBeInTheDocument();
  });
});
