/**
 * 숫자만 있는 문자열을 "010-XXXX-XXXX" 형식으로 변환
 * 입력: "01012345678" → 출력: "010-1234-5678"
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

/**
 * 입력 이벤트용 실시간 하이픈 삽입
 * 사용자가 타이핑하는 도중 자연스럽게 하이픈이 붙도록 처리
 * 예: "0101234" → "010-1234", "01012345678" → "010-1234-5678"
 */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}
