# Phase 2.1 Frontend Report — Progressive Disclosure Booking Wizard

> **기간**: 2026-05-22
> **범위**: `apps/web/src/**`
> **백엔드**: 무변경
> **브랜치**: `feature/progressive-booking-wizard`

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 기존 5단계 수평 탭 위저드(`/booking?step=N`)는 이전 단계를 숨기고 URL 파라미터로 단계를 전환하는 구조 — 누적 컨텍스트를 한눈에 볼 수 없고 단계 간 이동이 직관적이지 않음 |
| **Solution** | `design_handoff_reservation_system/PROGRESSIVE_WIZARD_SPEC.md` v2 기준으로 수직 누적 공개(Progressive Disclosure) 방식으로 전면 교체 — 이전 단계는 항상 열린 채 유지, 미래 단계는 1줄 잠금 행 표시 |
| **Outcome** | `StickyHeader` + `StepPanel` + `StepLockedRow` + `SummaryRail` + `useStepFlow` 신규 구현 / 구 컴포넌트 10개 삭제 / 다음 단계 클릭 시 smooth scroll 자동 이동 |
| **Quality** | Vitest **632/632** 통과 · TypeScript (tsc -b) 성공 · Production build 성공 |

---

## 1. 작업 단계 요약

### Phase 2.1.1 — 신규 레이아웃 셸 구현

| 파일 | 작업 |
|------|------|
| `hooks/useStepFlow.ts` | 신규 생성 — `currentStep`(0..4) 전진 전용, `maxReachedStep` localStorage 동기화, `useBookingDraft` 래핑 |
| `components/booking/StickyHeader.tsx` | 신규 생성 — 진행 바 + 취소/완료 버튼, `sticky top-0 z-30` |
| `components/booking/StepLockedRow.tsx` | 신규 생성 — 미래 단계 1줄 잠금 행 (점선 스타일) |
| `components/booking/StepPanel.tsx` | 신규 생성 — active/visible 상태 래퍼 (isActive, isFilled 제어) |
| `components/booking/SummaryRail.tsx` | 신규 생성 — 우측 sticky 사이드바, 5개 항목 실시간 표시 |
| `pages/BookingPage.tsx` | 전면 재작성 — 신규 컴포넌트 조합, 취소 confirm 다이얼로그 |
| `__tests__/useStepFlow.test.ts` | 신규 — 전진 전용 흐름, localStorage 동기화, 유효성 검사 |
| `__tests__/StickyHeader.test.tsx` | 신규 — 진행률 표시, 완료 버튼 disabled 조건 |
| `__tests__/StepPanel.test.tsx` | 신규 — active/visible 상태 스타일, 다음 단계 버튼 |
| `__tests__/StepLockedRow.test.tsx` | 신규 — 잠금 행 렌더링, 단계 번호·제목 표시 |
| `__tests__/SummaryRail.test.tsx` | 신규 — 미입력 "선택 전", 채워진 항목 수 N/5 |
| `__tests__/BookingPage.test.tsx` | 전면 재작성 — 신규 컴포넌트 기반 통합 테스트 |

### Phase 2.1.2 — 구 컴포넌트 삭제

| 파일 | 작업 |
|------|------|
| `components/booking/BookingLayout.tsx` | 삭제 |
| `components/booking/BottomBar.tsx` | 삭제 |
| `components/booking/StepHeader.tsx` | 삭제 |
| `components/booking/SummarySidebar.tsx` | 삭제 |
| `utils/buildCompletedSteps.ts` | 삭제 |
| `__tests__/BookingLayout.test.tsx` | 삭제 |
| `__tests__/BottomBar.test.tsx` | 삭제 |
| `__tests__/StepHeader.test.tsx` | 삭제 |
| `__tests__/SummarySidebar.test.tsx` | 삭제 |
| `__tests__/buildCompletedSteps.test.ts` | 삭제 |

### Phase 2.1.3 — 자동 스크롤 UX 개선

| 파일 | 작업 |
|------|------|
| `pages/BookingPage.tsx` | `stepRefs` + `requestAnimationFrame`으로 다음 단계 smooth scroll 구현 |

---

## 2. 핵심 컴포넌트 구조

### useStepFlow (`src/hooks/useStepFlow.ts`)

```
인터페이스:
  currentStep: number           // 0..4
  draft: BookingDraft
  isComplete: boolean
  advance(): void               // currentStep + 1 (상한 4)
  clear(): void
  getStepState(i): 'active' | 'visible' | 'locked'
  isStepValid(step: number): boolean
  updateApplicant(v): void
  updateSpace(v): void
  updateHeadcount(v): void
  updateTimeSlot(v): void
  updatePurpose(v): void

동작:
  - maxReachedStep → localStorage 동기화
  - 새로고침 시 currentStep = maxReachedStep 복원
  - useBookingDraft 래핑
```

### StickyHeader (`src/components/booking/StickyHeader.tsx`)

```
Props: currentStep, totalSteps?=5, isComplete, onCancel, onComplete

라벨: "5단계 중 N단계 진행 · X% 완료"
진행 바: pct = round(currentStep / totalSteps * 100)
완료 버튼: isComplete=false 시 disabled
position: sticky top-0 z-30, 높이 ~90px
```

### StepPanel (`src/components/booking/StepPanel.tsx`)

```
Props: stepNumber, title, isActive, isFilled, canAdvance, isLastStep, onAdvance, children

active 상태:  primary 테두리 + "입력 중" 배지 + 다음 단계 / 완료 버튼
visible 상태: soft 테두리 + "입력 완료" 배지, 푸터 없음
```

### StepLockedRow (`src/components/booking/StepLockedRow.tsx`)

```
Props: stepNumber, title

미래 단계 — 점선 테두리 1줄 행
텍스트: "{stepNumber}단계 · {title}"
```

### SummaryRail (`src/components/booking/SummaryRail.tsx`)

```
Props: draft: BookingDraft, isStepValid: (step: number) => boolean

position: sticky top-[110px] w-[280px]
5개 항목: 신청자 정보 / 장소 / 인원 / 날짜 및 시간 / 사용 목적
미입력 → "선택 전" 표시
우측 상단: 채워진 항목 수 N/5
filledCount === 0 → 안내 텍스트 표시
```

### BookingPage — 자동 스크롤 (`src/pages/BookingPage.tsx`)

```
stepRefs = useRef<(HTMLDivElement | null)[]>([])

handleAdvance(stepIndex):
  if stepIndex === 4 → handleComplete()
  else:
    flow.advance()
    requestAnimationFrame(() => {
      el = stepRefs.current[stepIndex + 1]
      top = el.getBoundingClientRect().top + window.scrollY - 90  // 90px = StickyHeader 오프셋
      window.scrollTo({ top, behavior: 'smooth' })
    })

레이아웃: grid-cols-[1fr_280px] gap-7
```

---

## 3. 단계 상태 매핑

| 상태 | 조건 | UI |
|------|------|----|
| `active` | `i === currentStep` | primary 테두리 + "입력 중" 배지 + 다음 단계 버튼 |
| `visible` | `i < currentStep` | soft 테두리 + "입력 완료" 배지, 푸터 없음 |
| `locked` | `i > currentStep` | 점선 1줄 행 (`StepLockedRow`) |

---

## 4. 신규 파일

| 파일 | 역할 |
|------|------|
| `src/hooks/useStepFlow.ts` | 전진 전용 스텝 흐름 관리, localStorage 동기화 |
| `src/components/booking/StickyHeader.tsx` | 상단 고정 진행 헤더 |
| `src/components/booking/StepPanel.tsx` | active/visible 상태 스텝 컨테이너 |
| `src/components/booking/StepLockedRow.tsx` | 미래 단계 잠금 행 |
| `src/components/booking/SummaryRail.tsx` | 우측 스티키 요약 사이드바 |
| `src/__tests__/useStepFlow.test.ts` | useStepFlow 단위 테스트 |
| `src/__tests__/StickyHeader.test.tsx` | StickyHeader 단위 테스트 |
| `src/__tests__/StepPanel.test.tsx` | StepPanel 단위 테스트 |
| `src/__tests__/StepLockedRow.test.tsx` | StepLockedRow 단위 테스트 |
| `src/__tests__/SummaryRail.test.tsx` | SummaryRail 단위 테스트 |
| `src/__tests__/BookingPage.test.tsx` | BookingPage 통합 테스트 (전면 재작성) |

---

## 5. 삭제된 파일

| 파일 | 이유 |
|------|------|
| `src/components/booking/BookingLayout.tsx` | 구 수평 탭 레이아웃 셸 — 신규 구조로 대체 |
| `src/components/booking/BottomBar.tsx` | 구 스텝 하단 탐색 바 — StepPanel 내부 버튼으로 대체 |
| `src/components/booking/StepHeader.tsx` | 구 스텝 헤더 — StepPanel에 통합 |
| `src/components/booking/SummarySidebar.tsx` | 구 요약 사이드바 — SummaryRail로 대체 |
| `src/utils/buildCompletedSteps.ts` | 구 완료 단계 배열 빌더 — useStepFlow.getStepState로 대체 |
| `src/__tests__/BookingLayout.test.tsx` | 대응 컴포넌트 삭제 |
| `src/__tests__/BottomBar.test.tsx` | 대응 컴포넌트 삭제 |
| `src/__tests__/StepHeader.test.tsx` | 대응 컴포넌트 삭제 |
| `src/__tests__/SummarySidebar.test.tsx` | 대응 컴포넌트 삭제 |
| `src/__tests__/buildCompletedSteps.test.ts` | 대응 유틸 삭제 |

---

## 6. 품질 게이트

| 항목 | 결과 |
|------|------|
| Vitest | **632/632** 통과 (74개 테스트 파일) |
| TypeScript build (tsc -b) | 성공 |
| Vite production build | 성공 |
| 수동 UI 확인 | dev server(5173) 실행 후 전체 예약 플로우 확인 |

---

## 7. 핵심 결정 사항

| 영역 | 결정 | 근거 |
|------|------|------|
| 레이아웃 전환 방식 | 구 컴포넌트 완전 삭제 + 신규 컴포넌트 교체 | 점진적 마이그레이션 없이 단일 교체 — 기존 5개 step 폼 컴포넌트는 무변경 재사용 |
| URL 구조 | `/booking` (쿼리 파라미터 제거) | 수직 누적 방식에서 step 번호를 URL에 노출할 이유 없음; `/booking/confirm` 완료 URL 유지 |
| 자동 스크롤 타이밍 | `requestAnimationFrame` | React 리렌더 직후 DOM 반영 보장; `setTimeout(0)` 대비 신뢰성 높음 |
| StickyHeader 오프셋 | 90px | StickyHeader 실제 높이 ~90px — 스크롤 후 패널이 헤더에 가리지 않도록 보정 |
| localStorage 복원 | `currentStep = maxReachedStep` | 새로고침 시 마지막 진행 위치로 즉시 복원, 처음부터 다시 입력 방지 |
| SummaryRail 너비 | 고정 280px | 데스크탑 전용(1200~1440px) 대상 — 좌측 콘텐츠와 `grid-cols-[1fr_280px]` 분할 |
| 기존 step 폼 재사용 | `ApplicantStep` / `SpaceStep` / `HeadcountStep` / `DateTimeStep` / `PurposeStep` 무변경 | 레이아웃 셸만 교체 — 폼 로직·유효성 검사 중복 없음 |

---

## 8. 후속 작업 후보

1. **모바일 반응형 대응** — 현재 데스크탑 전용(1200~1440px); 태블릿/모바일 레이아웃 검토 필요
2. **SummaryRail 수정 기능** — 현재 읽기 전용; 완료된 단계 항목 클릭 시 해당 단계로 재활성화 검토
3. **localStorage 초기화 정책** — `clear()` 외에 세션 만료나 7일 TTL 등 자동 초기화 기준 정의
4. **React Router v7 future flag 마이그레이션** — `v7_startTransition` / `v7_relativeSplatPath` 경고 잔존

---

## Appendix — 관련 문서

| 문서 | 경로 |
|------|------|
| Phase 2.1 구현 플랜 | `docs/frontend/phase2.1-frontend-plan.md` |
| Phase 2 UI/UX 리포트 (이전 단계) | `docs/frontend/phase2-frontend-report.md` |
| Progressive Wizard 디자인 스펙 | `design_handoff_reservation_system/PROGRESSIVE_WIZARD_SPEC.md` |

> Phase 2.1 구현 플랜(`phase2.1-frontend-plan.md`)에 기술된 전체 태스크가 본 report에서 완료 처리됨.
