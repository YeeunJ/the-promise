/**
 * 서버 검증 에러 메시지의 키워드를 기준으로 어느 step 으로 돌아가야 할지 결정한다.
 * BookingPage 의 5단계: 1=applicant, 2=space, 3=headcount, 4=datetime, 5=purpose.
 *
 * 키워드 우선순위는 datetime → space → headcount → purpose → 기본(applicant).
 * 같은 메시지에 여러 키워드가 포함되어도 가장 먼저 매칭되는 것을 채택한다.
 */
export function resolveEditTarget(errorMessage: string | null): number {
  if (!errorMessage) return 1;
  if (errorMessage.includes('과거') || errorMessage.includes('시간') || errorMessage.includes('날짜')) {
    return 4;
  }
  if (errorMessage.includes('공간') || errorMessage.includes('장소')) {
    return 2;
  }
  if (errorMessage.includes('인원')) {
    return 3;
  }
  if (errorMessage.includes('목적')) {
    return 5;
  }
  return 1;
}
