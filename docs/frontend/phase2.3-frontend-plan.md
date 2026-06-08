# Phase 2.3 프론트엔드 구현 플랜 — 실시간 예약 현황 보드 (Now & Next)

> **목표**: 현재 진행 중 + 앞으로 2시간 내 시작 예약을 건물·공간별 타임라인으로 보여주는 전체화면 공개 페이지 `/board` 신규
> **설계 기준**: 디자인 시안 — 타임라인(간트)안 (5종 목업 비교 후 채택)
> **데이터 소스**: `GET /api/v1/reservations/board/` — [phase2.3-plan.md (백엔드)](../backend/phase2.3-plan.md)
> **브랜치**: `develop`

---

## 배경 및 동기

| 항목 | 내용 |
|------|------|
| 용도 | 로비/안내데스크 무인 디스플레이 또는 운영자 모니터 — 비로그인 공개 |
| 범위 한정 | 월/주 캘린더 불필요. "현재 / 다가올(2시간)" 구간만. 데스크탑 와이드(1180px) |
| 강조점 | 공간별 타임라인, 현재/다가올 시각 구분, 한눈 가독성 |

---

## 아키텍처

### 신규 컴포넌트

| 컴포넌트 | 역할 |
|---------|------|
| `BoardTimeline` | 시간축 헤더(now 라벨/라인) + 고정높이 본문 |
| `BoardRow` | 공간 1행: 라벨(공간/건물·층) + 트랙 + 예약 블록 |
| `BuildingTabs` | 건물 탭·자동전환 토글·dots·페이지 네비·`●실시간`·시각 칩 |
| `BoardEmpty` | 건물별 0건 / 전체 0건 빈 상태 |

### 신규 훅·유틸

| 파일 | 역할 |
|------|------|
| `useBoardData` | 보드 데이터 60초 폴링 (AbortController, 오류 시 직전 데이터 유지) |
| `useBoardClock` | 서버 `now` seed → 1초 진행, 폴링 시 재동기화 |
| `lib/boardLayout` | 축 범위·블록 위치(%)·now 위치·페이지 분할·시계 포맷 (순수 함수) |

### 타입 (`types/index.ts`)

`BoardState`('live'\|'upcoming'), `BoardReservation`, `BoardBuilding`, `BoardResponse`

### 핵심 동작

| 동작 | 사양 |
|------|------|
| 축 | `now` 정시 내림 → +4시간(30분 8칸). 블록은 축에 클리핑, 빨간 now 라인 |
| 색 | `live`=primary(초록), `upcoming`=accent(골드) |
| 건물 자동 전환 | 5초 간격. 같은 건물 다음 페이지 있으면 페이지 넘김, 없으면 다음 건물 |
| 페이지네이션 | `PAGE_SIZE=6`, 6행 초과 시 분할 + `‹ n/m ›` (고정 높이로 출렁임 방지) |
| 일시정지 | 타임라인 hover 시 자동전환 정지. 탭/페이지 수동 조작 시 자동전환 끔 |
| 빈 상태 | 건물 0건 → 건물 안내, 전체 0건 → 전체 안내 |
| 시각 | 서버 now 기준 초 단위 갱신 + `●실시간` |
| 폴링 | 60초 |

---

## 태스크 목록

### Phase 2.3.2 — 타입·훅·유틸

| 파일 | 작업 |
|------|------|
| `types/index.ts` | 보드 타입 4종 추가 |
| `hooks/useBoardData.ts` · `hooks/useBoardClock.ts` | 신규 |
| `lib/boardLayout.ts` | 신규 (순수 함수) |
| `__tests__/boardLayout.test.ts` · `__tests__/useBoardData.test.ts` | 신규 |

### Phase 2.3.3 — UI·라우트

| 파일 | 작업 |
|------|------|
| `components/board/BoardTimeline.tsx` · `BoardRow.tsx` · `BuildingTabs.tsx` · `BoardEmpty.tsx` | 신규 |
| `pages/BoardPage.tsx` | 신규 (오케스트레이션) |
| `App.tsx` | `/board` 라우트 (AppShell 바깥 전체화면) |
| `__tests__/BoardTimeline.test.tsx` | 신규 |

> 백엔드 엔드포인트 추가는 Phase 2.3.1 — [docs/backend/phase2.3-plan.md](../backend/phase2.3-plan.md).

---

## 제약 사항

- 기존 사용자/관리자 앱 무변경 — `/board`는 독립 전체화면 라우트 (`AppShell` 미적용)
- 인라인 CSS 대신 기존 Tailwind 토큰 클래스 사용 (`bg-surface`, `text-primary`, `border-edge-soft`, `bg-accent`, `shadow-design-lg` 등)
- "다가올" 창은 우선 2시간 고정

---

## 확정된 결정 사항

| 영역 | 결정 |
|------|------|
| `/board` 노출 | 완전 공개 (비로그인, AppShell 바깥) |
| 다가올 창 | 2시간 고정 |
| 폴링 주기 | 60초 |
| 실시간 표시 | 시각 칩 옆 `●실시간` (상대시간 문구 없음) |
| 빈방 표시 | 예약 있는 방만 표시 |
| 표시 정보 | 공간·건물/층·시간·부서·목적·예약자명 (인원·전화 제외) |

---

## 관련 파일 경로 요약

```
apps/web/src/
├── pages/BoardPage.tsx             (신규)
├── components/board/
│   ├── BoardTimeline.tsx           (신규)
│   ├── BoardRow.tsx                (신규)
│   ├── BuildingTabs.tsx            (신규)
│   └── BoardEmpty.tsx              (신규)
├── hooks/useBoardData.ts           (신규)
├── hooks/useBoardClock.ts          (신규)
├── lib/boardLayout.ts              (신규)
├── types/index.ts                  (보드 타입 추가)
├── App.tsx                         (/board 라우트 추가)
└── __tests__/
    ├── boardLayout.test.ts         (신규)
    ├── useBoardData.test.ts        (신규)
    └── BoardTimeline.test.tsx      (신규)
```
