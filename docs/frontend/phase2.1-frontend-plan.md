# Phase 2.1 프론트엔드 구현 플랜 — Progressive Disclosure Booking Wizard

> **목표**: 기존 5단계 수평 탭 위저드(`/booking?step=N`)를 단계가 아래로 누적 공개되는 수직 스크롤 방식으로 전면 교체
> **설계 기준**: `design_handoff_reservation_system/PROGRESSIVE_WIZARD_SPEC.md` v2
> **브랜치**: `feature/progressive-booking-wizard`

---

## 배경 및 동기

| 항목 | 기존 방식 | 신규 방식 |
|------|----------|----------|
| 레이아웃 | 5단계 수평 탭 (`?step=N`) | 수직 누적 공개 (단일 `/booking`) |
| 단계 탐색 | URL 파라미터로 step 이동 | 전진 전용 (뒤로 이동 불가) |
| 이전 단계 | 탭 전환 시 숨김 | 항상 열린 채 유지 |
| URL | `/booking?step=1~5` | `/booking` (쿼리 파라미터 없음) |
| 대상 해상도 | 전체 | 데스크탑 전용 (1200~1440px) |

---

## 아키텍처

### 신규 컴포넌트

| 컴포넌트 | 역할 |
|---------|------|
| `StickyHeader` | 진행 바 + 취소/완료 버튼, `sticky top-0 z-30` |
| `StepPanel` | active/visible 상태 래퍼 (isActive, isFilled 제어) |
| `StepLockedRow` | 미래 단계 1줄 잠금 행 |
| `SummaryRail` | 우측 sticky 사이드바, 5개 항목 실시간 표시 |

### 신규 훅

| 훅 | 역할 |
|----|------|
| `useStepFlow` | `currentStep`(0..4) 전진 전용, `getStepState(i)`, `maxReachedStep` localStorage 동기화 |

### 단계 상태

| 상태 | 조건 | UI |
|------|------|----|
| `active` | `i === currentStep` | primary 테두리 + "입력 중" 배지 + 다음 단계 버튼 |
| `visible` | `i < currentStep` | soft 테두리 + "입력 완료" 배지, 푸터 없음 |
| `locked` | `i > currentStep` | 점선 1줄 행 (`StepLockedRow`) |

---

## Phase 2.1.1 — 신규 레이아웃 셸 구현

### 태스크 목록

| 파일 | 작업 |
|------|------|
| `hooks/useStepFlow.ts` | 신규 생성 |
| `components/booking/StickyHeader.tsx` | 신규 생성 |
| `components/booking/StepLockedRow.tsx` | 신규 생성 |
| `components/booking/StepPanel.tsx` | 신규 생성 |
| `components/booking/SummaryRail.tsx` | 신규 생성 |
| `pages/BookingPage.tsx` | 전면 재작성 (신규 컴포넌트 조합) |
| `__tests__/useStepFlow.test.ts` | 신규 |
| `__tests__/StickyHeader.test.tsx` | 신규 |
| `__tests__/StepLockedRow.test.tsx` | 신규 |
| `__tests__/StepPanel.test.tsx` | 신규 |
| `__tests__/SummaryRail.test.tsx` | 신규 |
| `__tests__/BookingPage.test.tsx` | 전면 재작성 |

### useStepFlow 스펙

```typescript
interface StepFlow {
  currentStep: number;           // 0..4
  draft: BookingDraft;
  isComplete: boolean;
  advance(): void;               // currentStep + 1 (상한: 4)
  clear(): void;
  getStepState(i: number): 'active' | 'visible' | 'locked';
  isStepValid(step: number): boolean;
  updateApplicant(v): void;
  updateSpace(v): void;
  updateHeadcount(v): void;
  updateTimeSlot(v): void;
  updatePurpose(v): void;
}
```

- `maxReachedStep` localStorage 저장 → 새로고침 시 `currentStep = maxReachedStep - 1` 복원
- `useBookingDraft` 래핑

### StickyHeader 스펙

- Props: `currentStep`, `totalSteps?=5`, `isComplete`, `onCancel`, `onComplete`
- 라벨: `"5단계 중 N단계 진행 · X% 완료"` (`pct = round(currentStep / totalSteps * 100)`)
- 완료 버튼: `isComplete=false` 시 `disabled`

### SummaryRail 스펙

- `sticky top-[110px] w-[280px]`
- 5개 항목: 신청자 정보 / 장소 / 인원 / 날짜 및 시간 / 사용 목적
- 미입력: "선택 전" 표시
- 우측 상단: 채워진 항목 수 `N/5`
- `filledCount === 0`: 안내 텍스트 표시

---

## Phase 2.1.2 — 구 컴포넌트 삭제

삭제 대상 (Phase 1 완료 후 진행):

```
src/components/booking/
  BookingLayout.tsx
  BottomBar.tsx
  StepHeader.tsx
  SummarySidebar.tsx

src/utils/
  buildCompletedSteps.ts

src/__tests__/
  BookingLayout.test.tsx
  BottomBar.test.tsx
  StepHeader.test.tsx
  SummarySidebar.test.tsx
  buildCompletedSteps.test.ts
```

---

## Phase 2.1.3 — UX 개선 (스크롤 자동 이동)

- "다음 단계" 버튼 클릭 시 새로 열리는 단계 패널로 자동 smooth scroll
- Sticky 헤더 높이(90px) 오프셋 적용
- 구현: `BookingPage`에 `stepRefs` + `requestAnimationFrame` 사용

---

## 제약 사항

- 기존 5단계 폼 컴포넌트(`ApplicantStep`, `SpaceStep`, `HeadcountStep`, `DateTimeStep`, `PurposeStep`) 무변경 재사용
- 레이아웃 셸만 교체
- URL `/booking/confirm` (완료 페이지) 무변경

---

## 관련 파일 경로 요약

```
apps/web/src/
├── hooks/
│   └── useStepFlow.ts                           (신규)
├── components/booking/
│   ├── StickyHeader.tsx                         (신규)
│   ├── StepPanel.tsx                            (신규)
│   ├── StepLockedRow.tsx                        (신규)
│   ├── SummaryRail.tsx                          (신규)
│   ├── BookingLayout.tsx                        (삭제)
│   ├── BottomBar.tsx                            (삭제)
│   ├── StepHeader.tsx                           (삭제)
│   └── SummarySidebar.tsx                       (삭제)
├── pages/
│   └── BookingPage.tsx                          (재작성)
└── utils/
    └── buildCompletedSteps.ts                   (삭제)
```
