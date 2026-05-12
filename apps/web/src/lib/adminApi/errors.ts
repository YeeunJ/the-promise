import axios from 'axios';

interface AdminErrorBody {
  error?: string;
  message?: string;
}

/**
 * Admin API 의 표준 에러 응답 `{error, message}` 에서 한국어 메시지를 추출한다.
 * - axios 에러가 아닌 경우, message 가 없는 경우 fallback 사용
 */
export function getAdminErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as AdminErrorBody | undefined;
    if (data && typeof data.message === 'string' && data.message.length > 0) {
      return data.message;
    }
  }
  return fallback;
}

/**
 * 401 인증 만료 여부 판정. AdminPage 의 로그아웃 흐름과 연결 가능.
 */
export function isAdminAuthError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
