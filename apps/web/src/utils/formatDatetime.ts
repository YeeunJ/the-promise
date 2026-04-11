const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** 기본 시간 표시 범위 (HH:MM) */
export const DEFAULT_START_TIME = '07:00';
export const DEFAULT_END_TIME = '22:00';

/**
 * ISO 8601 문자열을 Date 객체로 파싱
 */
function parseISOString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * ISO 8601 문자열을 "2026-04-10 (금)" 형식으로 변환 (KST 기준)
 */
export function formatDate(isoString: string): string {
  const date = parseISOString(isoString);
  // UTC 기준에서 +9 적용하여 KST 날짜 계산
  const kstDate = new Date(date.getTime() + KST_OFFSET_MS);
  const year = kstDate.getUTCFullYear();
  const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getUTCDate()).padStart(2, '0');
  const dayLabel = DAY_LABELS[kstDate.getUTCDay()];
  return `${year}-${month}-${day} (${dayLabel})`;
}

/**
 * ISO 8601 문자열을 "10:00" (HH:mm) 형식으로 변환 (KST 기준)
 */
export function formatTime(isoString: string): string {
  const date = parseISOString(isoString);
  const kstDate = new Date(date.getTime() + KST_OFFSET_MS);
  const hours = String(kstDate.getUTCHours()).padStart(2, '0');
  const minutes = String(kstDate.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 시작/종료 ISO 8601 문자열을 "2026-04-10 (금) 10:00 ~ 12:00" 형식으로 변환
 */
export function formatDatetimeRange(start: string, end: string): string {
  const datePart = formatDate(start);
  const startTime = formatTime(start);
  const endTime = formatTime(end);
  return `${datePart} ${startTime} ~ ${endTime}`;
}

/**
 * 날짜 문자열("YYYY-MM-DD")을 받아 00:00 ~ 23:30, 30분 단위 ISO 8601 배열 반환 (KST +09:00)
 * 예: ["2026-04-10T00:00:00+09:00", "2026-04-10T00:30:00+09:00", ...]
 * 총 48개 슬롯 반환
 */
export function generateTimeSlots(date: string): string[] {
  const slots: string[] = [];
  for (let i = 0; i < 48; i++) {
    const totalMinutes = i * 30;
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    slots.push(`${date}T${hours}:${minutes}:00+09:00`);
  }
  return slots;
}

/**
 * "YYYY-MM-DD" 문자열을 "2026-04-10 (금)" 형식으로 변환
 */
export function formatDateStr(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  const dayLabel = DAY_LABELS[date.getDay()];
  return `${yearStr}-${monthStr}-${dayStr} (${dayLabel})`;
}

/**
 * ISO 8601 문자열에서 날짜 부분("YYYY-MM-DD")만 추출
 * 예: "2026-04-10T13:00:00+09:00" → "2026-04-10"
 */
export function extractDateStr(isoString: string): string {
  return isoString.slice(0, 10);
}

/**
 * 현재 KST 날짜를 "YYYY-MM-DD" 형식으로 반환
 * UTC 기준 toISOString() 대신 KST(+09:00) 기준으로 계산하여
 * 자정 전후의 날짜 오차를 방지한다.
 */
export function getKSTDateString(): string {
  return new Date(Date.now() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * ISO 8601 문자열에서 시간 부분("HH:MM")을 추출한다.
 * 예: "2026-04-10T07:30:00+09:00" → "07:30"
 */
export function extractTimeHHMM(isoString: string): string {
  return isoString.slice(11, 16);
}
