import { describe, it, expect } from 'vitest';
import { ADMIN_TOKEN_KEY } from '../types';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  UpdateReservationStatusPayload,
} from '../types';

describe('ADMIN_TOKEN_KEY', () => {
  it("값이 'admin_token'이다 (happy path)", () => {
    expect(ADMIN_TOKEN_KEY).toBe('admin_token');
  });

  it('문자열 타입이다', () => {
    expect(typeof ADMIN_TOKEN_KEY).toBe('string');
  });

  it('빈 문자열이 아니다 (boundary case)', () => {
    expect(ADMIN_TOKEN_KEY).not.toBe('');
  });
});

describe('AdminLoginRequest 타입 구조', () => {
  it('username과 password 필드를 가지는 객체를 생성할 수 있다 (happy path)', () => {
    const request: AdminLoginRequest = {
      username: 'admin',
      password: 'secret',
    };
    expect(request.username).toBe('admin');
    expect(request.password).toBe('secret');
  });

  it('빈 문자열 값을 허용한다 (boundary case)', () => {
    const request: AdminLoginRequest = {
      username: '',
      password: '',
    };
    expect(request.username).toBe('');
    expect(request.password).toBe('');
  });
});

describe('AdminLoginResponse 타입 구조', () => {
  it('token 필드를 가지는 객체를 생성할 수 있다 (happy path)', () => {
    const response: AdminLoginResponse = {
      token: 'abc123xyz',
    };
    expect(response.token).toBe('abc123xyz');
  });

  it('긴 토큰 문자열을 허용한다 (boundary case)', () => {
    const longToken = 'a'.repeat(200);
    const response: AdminLoginResponse = { token: longToken };
    expect(response.token).toHaveLength(200);
  });
});

describe('UpdateReservationStatusPayload 타입 구조', () => {
  it("status가 'confirmed'인 페이로드를 생성할 수 있다 (happy path)", () => {
    const payload: UpdateReservationStatusPayload = {
      status: 'confirmed',
    };
    expect(payload.status).toBe('confirmed');
    expect(payload.admin_note).toBeUndefined();
  });

  it("status가 'rejected'이고 admin_note를 포함할 수 있다", () => {
    const payload: UpdateReservationStatusPayload = {
      status: 'rejected',
      admin_note: '공간 사용 불가',
    };
    expect(payload.status).toBe('rejected');
    expect(payload.admin_note).toBe('공간 사용 불가');
  });

  it("status가 'cancelled'인 페이로드를 생성할 수 있다", () => {
    const payload: UpdateReservationStatusPayload = {
      status: 'cancelled',
    };
    expect(payload.status).toBe('cancelled');
  });

  it('admin_note가 선택적 필드여서 생략 가능하다 (boundary case)', () => {
    const payload: UpdateReservationStatusPayload = {
      status: 'confirmed',
    };
    expect('admin_note' in payload).toBe(false);
  });

  it('admin_note가 빈 문자열일 수 있다 (boundary case)', () => {
    const payload: UpdateReservationStatusPayload = {
      status: 'cancelled',
      admin_note: '',
    };
    expect(payload.admin_note).toBe('');
  });
});
