# Phase 2.3 Frontend Report — 실시간 예약 현황 보드 (Now & Next)

> **기간**: 2026-06-08
> **범위**: `apps/web/src/**`
> **데이터 소스**: `GET /api/v1/reservations/board/` ([docs/backend/phase2.3-report.md](../backend/phase2.3-report.md))
> **브랜치**: `develop`

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 지금 어떤 방이 쓰이는지/곧 쓰일지 한눈에 보는 화면 부재 |
| **Solution** | 전체화면 공개 페이지 `/board` 신규 — 공간별 타임라인(간트)으로 현재/다가올 예약 표시 |
| **Outcome** | 건물 5초 자동 전환 · 6행 페이지 자동 넘김 · 서버 기준 초 단위 시각 · live/upcoming 색 구분 · 현재/다가올 빈 상태 |
| **Quality** | Vitest **723/723** 통과 (보드 20개 신규) · TypeScript(tsc -b) 성공 · Production build 성공 |

---

## 1. 작업 단계 요약

### Phase 2.3.2 — 타입·훅·유틸

| 파일 | 작업 |
|------|------|
| `types/index.ts` | `BoardState`·`BoardReservation`·`BoardBuilding`·`BoardResponse` 추가 |
| `hooks/useBoardData.ts` | 신규 — 60초 폴링, AbortController, 오류 시 직전 데이터 유지 |
| `hooks/useBoardClock.ts` | 신규 — 서버 now seed → 1초 진행, 폴링 시 재동기화 |
| `lib/boardLayout.ts` | 신규 — 축·블록 위치·now 위치·페이지 분할·시계 포맷 (순수 함수) |
| `__tests__/boardLayout.test.ts` · `__tests__/useBoardData.test.ts` | 신규 |

### Phase 2.3.3 — UI·라우트

| 파일 | 작업 |
|------|------|
| `components/board/BoardTimeline.tsx` | 신규 — 시간축 헤더(now 라벨)·고정높이 본문 |
| `components/board/BoardRow.tsx` | 신규 — 공간 행(라벨 + 트랙 + 블록 + now 라인) |
| `components/board/BuildingTabs.tsx` | 신규 — 건물 탭·자동전환·dots·페이지 네비·`●실시간`·시각 칩 |
| `components/board/BoardEmpty.tsx` | 신규 — 건물별/전체 빈 상태 |
| `pages/BoardPage.tsx` | 신규 — 건물 순환·페이지네이션·hover 정지 오케스트레이션 |
| `App.tsx` | `/board` 라우트 추가 (AppShell 바깥 전체화면) |
| `__tests__/BoardTimeline.test.tsx` | 신규 |

---

## 2. 핵심 구조

### boardLayout (`src/lib/boardLayout.ts`) — 순수 함수

```
axisStart(now)                  now 정시 내림
blockGeometry(start,end,axisMs) 블록 left/width(%) · 축 밖 클리핑 · 안 보이면 null
nowLeftPercent(now,axisMs)      now 라인 위치(%)
axisTicks(start)                30분 8칸 라벨
pageCount / pageSlice           PAGE_SIZE=6 페이지 분할
formatClock(date)               "오후 1:38:42"
rowsForBuilding / rowsForAll    BoardReservation → BoardRowItem
```

### BoardPage 상태 (`src/pages/BoardPage.tsx`)

```
useBoardData() → data(60초 폴링) ·  useBoardClock(data.now) → 초 단위 시계
선택: selIdx(-1=전체, 0..n=건물), pageIdx, autoOn, paused
자동 전환(5초): 같은 건물 다음 페이지 있으면 page+1, 없으면 다음 건물·page0
  (인터벌 stale closure 방지 위해 selIdx/pageIdx/buildings를 ref로 참조)
hover → paused, 탭/페이지 수동 조작 → autoOn=false
```

### 시각/축 처리

```
서버 now → useBoardClock 초 단위 진행 → axisStart(정시 내림)·now 라인 위치 계산
디스플레이 로컬 시계가 아닌 서버 기준 — 폴링 60초마다 재동기화
```

---

## 3. 신규 파일

| 파일 | 역할 |
|------|------|
| `src/pages/BoardPage.tsx` | 보드 페이지 오케스트레이션 |
| `src/components/board/BoardTimeline.tsx` | 시간축 + 본문 |
| `src/components/board/BoardRow.tsx` | 공간 행 + 예약 블록 |
| `src/components/board/BuildingTabs.tsx` | 건물 탭·자동전환·페이지 네비·시각 |
| `src/components/board/BoardEmpty.tsx` | 빈 상태 |
| `src/hooks/useBoardData.ts` | 60초 폴링 데이터 훅 |
| `src/hooks/useBoardClock.ts` | 서버 기준 초 단위 시계 훅 |
| `src/lib/boardLayout.ts` | 레이아웃 순수 함수 |
| `src/__tests__/boardLayout.test.ts` | 레이아웃 단위 테스트 |
| `src/__tests__/useBoardData.test.ts` | 데이터 훅 테스트 |
| `src/__tests__/BoardTimeline.test.tsx` | 타임라인 컴포넌트 테스트 |

---

## 4. 품질 게이트

| 항목 | 결과 |
|------|------|
| Vitest | **723/723** 통과 (보드 20개 신규, 82개 테스트 파일) |
| TypeScript build (tsc -b) | 성공 |
| Vite production build | 성공 (2843 모듈) |
| 수동 UI 확인 | dev 서버(api 8000 + web) + 시드 예약으로 자동전환·페이지 넘김·초 단위 시각 확인 |

---

## 5. 핵심 결정 사항

| 영역 | 결정 | 근거 |
|------|------|------|
| 디자인 방향 | 공간별 타임라인(간트)안 채택 | 카드/테이블/사이니지/건물그룹 등 5종 비교 — "누가 언제 어디" 한눈 파악에 가장 강함 |
| `/board` 위치 | AppShell 바깥 전체화면 | 로비 디스플레이용 — 헤더/네비 불필요 |
| 시각 계산 | 서버 `now` 기준 초 단위 진행 | 디스플레이 로컬 시계 오차 무관 |
| 자동전환 인터벌 | selIdx/pageIdx를 ref로 참조 | setInterval stale closure 방지 (의존성에 넣으면 매초 리셋) |
| 고정 높이 본문 | 6행 기준 고정 | 페이지 넘김 시 카드 높이 출렁임 방지 |
| 폴링 60초 | 데이터 변경 빈도 낮음 | 부하·최신성 균형 |

---

## 6. 후속 작업 후보

1. **반응형/대형 디스플레이 대응** — TV 해상도별 행 높이·페이지 크기 조정
2. **"다가올" 창 UI 조정** — `window_minutes`를 화면에서 1/2/3시간 토글
3. **E2E** — `/board` 자동전환·페이지 넘김·빈 상태 Playwright 시나리오 (이번 세션엔 도구 이슈로 수동 확인)

---

## Appendix — 관련 문서

| 문서 | 경로 |
|------|------|
| Phase 2.3 프론트 플랜 | `docs/frontend/phase2.3-frontend-plan.md` |
| Phase 2.3 백엔드 플랜/리포트 | `docs/backend/phase2.3-plan.md` · `phase2.3-report.md` |
| 프로젝트 구조(페이지·컴포넌트·라우팅) | `docs/03-project-structure.md` |

> Phase 2.3 프론트 플랜(`phase2.3-frontend-plan.md`)에 기술된 전체 태스크가 본 report에서 완료 처리됨.
> 디자인 탐색용 목업 HTML(board-01~05)은 실 구현으로 대체되어 제거됨.
