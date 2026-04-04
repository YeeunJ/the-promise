import { useState } from 'react';
import axios, { isAxiosError } from 'axios';
import type { AdminLoginRequest, AdminLoginResponse } from '../types';
import { ADMIN_TOKEN_KEY } from '../types';

interface AdminLoginFormProps {
  onLoginSuccess: () => void;
}

function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const body: AdminLoginRequest = { username, password };
      const response = await axios.post<AdminLoginResponse>(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/login/`,
        body
      );
      localStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
      onLoginSuccess();
    } catch (error) {
      if (isAxiosError(error)) {
        setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FEFAE0] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] w-full max-w-sm px-8 py-10">
        <h1 className="text-2xl font-black text-black text-center mb-8">관리자 로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-black">
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20 transition-colors duration-200"
              autoComplete="username"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-black">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20 transition-colors duration-200"
              autoComplete="current-password"
              required
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-[#DC2626]">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#008F49] px-4 py-3 text-base font-bold text-white hover:bg-[#AAA014] disabled:bg-[#E5E7EB] disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginForm;
