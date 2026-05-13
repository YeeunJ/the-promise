# Phase 1.5.1 Frontend Report — Refined Sage 디자인 전면 적용

> **기간**: 2026-05-12 ~ 2026-05-13
> **범위**: `apps/web/src/**` + `apps/web/tailwind.config.js` + `apps/web/index.html` + `apps/web/admin.html`
> **백엔드**: 무변경 (보완 항목 14건 별도 todo 문서로 인계)

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 기존 UI 는 형광 초록 + cream 톤의 임시 디자인 / 5단계 신청 흐름이 모달 5개로 분산 / 디자인 토큰 시스템 부재 |
| **Solution** | 디자인 핸드오프 패키지 (Refined Sage) 의 토큰·14 화면 명세·인터랙션 규칙을 6 phase (P0~P6) 점진 적용 + 후속 5 단계 (F2~F5) 정제 |
| **Outcome** | 디자인 토큰 100% 적용 / 5단계 단일 페이지 / 라우트 4개 분리 / Atom 컴포넌트 7개 재사용 / 어드민 콘솔 두 뷰 (달력·리스트) 디자인안 일치 |
| **Quality** | Vitest **628/628 통과** · Production build **성공** · Playwright 풀 종단 시각 검증 완료 |
| **Backend dependency** | 디자인 의도 100% 구현을 위한 백엔드 보완 14 항목 → `docs/backend/todo-design-required-data.md` 단일 문서로 통합 인계 |

---

## 1. 작업 단계 요약

### Phase 2 본 작업 (P0~P6)

| Phase | 목표 | 산출 |
|-------|------|------|
| **P0** | 디자인 토큰 이식 | `src/styles/tokens.css` 신규, Tailwind flat color keys + boxShadow / Pretendard CDN / lucide-react@^0.460 추가 |
| **P1** | 공용 Atom 7개 | `src/components/ui/{Button, Card, Input, Chip, StatusPill, Eyebrow, KpiCard}.tsx` + 42 unit 테스트 |
| **P2** | 라우트 분리 + AppShell | `App.tsx` 4 라우트 (/, /booking, /my/login, /my), 신규 `AppShell.tsx` / `LandingPage.tsx` / `LookupLoginPage.tsx` / `useLookupCredentials` hook |
| **P3** | 5단계 모달 → 단일 페이지 | `BookingPage` state hub + `StepHeader` chip nav (자유 점프 + maxReachedStep 시각화) + 5 step component + `useBookingDraft` localStorage / 레거시 `ReservationForm` + 5 popup + StepPopup 삭제 |
| **P4** | My Reservations | `MyKpiRow` (4 KPI) + `UserReservationDetailModal` (헤더 배너 + 3 섹션) + `MyReservationsPage` |
| **P5** | Admin Console | `AdminTopNav` + `AdminKpiRow` + `AdminSideRail` + `ReservationsSection` 통합 + `TeamsSection` 부서 chip 필터 |
| **P6** | 백엔드 보완 todo 문서 | `docs/backend/todo-design-required-data.md` 작성 (당시 7 항목) |

### 후속 정제 (F2~F5)

| 단계 | 목표 | 결과 |
|------|------|------|
| **F2** | `brand-*` legacy alias 마이그레이션 | 30 파일 PowerShell 일괄 치환 (`brand-primary` → `primary`, `brand-secondary` → `primary-dark`, `brand-accent` → `accent`, `brand-cream` → `canvas`) + `tailwind.config.js` legacy alias 블록 제거. 잔여 `brand-*` 0건 |
| **F3** | 백엔드 풀 종단 시각 검증 | 도커 컨테이너 (db/redis/api/worker) 기동 후 Playwright 6 시나리오 골든패스: booking 5 step + POST 201 + /my + /admin 모두 정상. 발견 이슈 7건 분류 (F4 5건 즉시 / 6번 별도 / 7번 의도) |
| **F4** | 마이너 디자인 폴리시 | F3 발견 이슈 처리: (1) DetailModal `applicant_team` 사용으로 부서/팀 빈 칸 버그 수정 (admin/user 양쪽) + types 정합 (2) 사용자 측 취소 inline confirm dialog 추가 (3) PurposeStep 이모지 → lucide-react 컴포넌트 (디자인안 매핑 9 아이콘) (4) "기타" textarea aria-hidden / tabIndex 안전 처리 (5) Landing "24" 하드코딩 → `/api/v1/spaces/` fetch 동적 카운트 |
| **F5** | 어드민 예약 관리 디자인 재구성 | 디자인안 `option-a.jsx A_Admin` (달력) + `option-a-more.jsx A_AdminList` (리스트) 완전 일치 — View toggle 헤더 우측 이동, CalendarSidePanel 제거 → SideRail 통합, 캘린더 내부 헤더 ("5월" + nav + 이벤트 카운터), 리스트 뷰 KPI·SideRail 숨김, 220px Filter Sidebar, admin `ReservationDetailModal` 에 "예약 취소" 버튼 추가, CalendarGrid chip `<span>` → `<button>` (키보드 접근성), 컨텍스트 라인 "2026년 5월 · 오늘 5월 13일 (수)" 형식 |

### 문서 정리

- `todo-admin-reservation-filter.md` (별도 4 항목) 를 `todo-design-required-data.md` §11~§14 로 머지 + 원본 파일 삭제. 백엔드 todo 14 항목을 단일 문서로 통합 추적.

---

## 2. 핵심 컴포넌트 구조

### Atom (`src/components/ui/`)

```
Button         - variant: primary | ghost | danger / size: md | sm / iconLeft·Right
Card           - selected? / as: div | button / onClick
Input          - iconLeft·Right / valid? / error?
Chip           - active? / onClick
StatusPill     - status: ReservationStatus / size: sm | md
Eyebrow        - color: accent | mute
KpiCard        - label / value / icon? / delta?
```

### Booking (`src/components/booking/`, `src/pages/Booking*`)

```
BookingPage (state hub via useBookingDraft)
└─ BookingLayout (2컬럼)
   ├─ StepHeader (chip nav, data-state: current | reached-valid | reached-invalid | unreached)
   ├─ [Step Content]
   │  ├─ ApplicantStep / SpaceStep / HeadcountStep / DateTimeStep (6열 히트맵) / PurposeStep (lucide 9 아이콘)
   ├─ SummarySidebar (280px, buildCompletedSteps)
   └─ BottomBar (이전 200px + 다음 flex-1)

ConfirmationPage  - 티켓 카드 + 신청
BookingSuccessPage - 체크 아이콘 + 두 CTA
```

### My (`src/components/my/`, `src/pages/MyReservationsPage.tsx`)

```
MyReservationsPage (credentials guard → /my/login redirect)
├─ MyKpiRow (예정/확정/대기/취소)
├─ ReservationTable (StatusPill, onRowClick)
└─ UserReservationDetailModal (3 섹션 + inline cancel confirm)
```

### Admin (`src/components/admin/`, `src/pages/AdminPage.tsx`)

```
AdminPage
├─ AdminTopNav (Logo + ADMIN 뱃지 + 4 탭 + role=search disabled 통합검색 + 로그아웃)
└─ ReservationsSection (예약)
   ├─ [calendar mode]
   │  ├─ AdminKpiRow (4 KPI: 이번주/대기/가동률—/인기—)
   │  ├─ SectionHeader (컨텍스트 라인 + View toggle + 설정 + CSV)
   │  ├─ CalendarGrid (내부 헤더: 월 + nav + 이벤트 stats / chip → DetailModal)
   │  └─ AdminSideRail (340px: 오늘 + 확정 대기 카드)
   └─ [list mode]
      ├─ SectionHeader (View toggle 동일 위치)
      └─ grid: Filter Sidebar (220px: 기간 / 상태 / 장소 / 1주 이내 / 담당교역자 disabled / 검색)
                + ListTable (9 컬럼) + Pagination

ReservationDetailModal (chip 클릭 진입, 닫기 + 예약 취소 → CancelDialog)
TeamsSection / BuildingsSection / SpacesSection
```

---

## 3. 품질 게이트

| 항목 | 결과 |
|------|------|
| Vitest | **628/628** 통과 (F5 후 CalendarSidePanel.test.tsx 14건 삭제 반영) |
| TypeScript build (tsc -b) | 성공 |
| Vite production build | 성공 (2820 modules, admin chunk 70.78 kB / main 146.73 kB / reservationUtils 207.91 kB) |
| 잔여 `brand-*` grep | 0건 |
| Playwright 시각 검증 | 풀 종단 6 시나리오 + F4 변경 화면 + F5 두 뷰 모두 디자인안 일치 |
| 잔여 콘솔 에러 | 0건 (React Router v7 future flag 경고만 — 별도 작업) |

---

## 4. 핵심 결정 사항

| 영역 | 결정 | 근거 |
|------|------|------|
| 5단계 UI | **모달 → 단일 페이지 + Step Header chip nav** | 사용자 결정 2026-05-13 |
| Chip 가드 정책 | **자유 점프 + maxReachedStep 시각화** (절충) | chip 클릭은 가드 없음, "다음" 만 max 증가. 4가지 `data-state` (`current` / `reached-valid` / `reached-invalid` / `unreached`) |
| 라우트 구조 | `/`, `/booking?step=N`, `/booking/confirm`, `/booking/success`, `/my/login`, `/my`, `/admin.html` 유지 | 분리 권장 |
| 공간 사진 | placeholder SVG (백엔드 `photo_url` todo §2) | 운영 사진 정책 미정 |
| 아이콘 라이브러리 | **lucide-react** | 이모지 → 일관된 컴포넌트 |
| Tailwind 색상 키 | **flat key 통일** (`primary`, `primary-dark`, `primary-100`) | Vite dev 모드의 nested DEFAULT 이슈 회피 + 명료성 |
| `text` / `border` / `bg` 토큰 명 | **`ink` / `edge` / `canvas`** | Tailwind 유틸 충돌 회피 |
| 회귀 방지 alias | P3 까지 `brand-*` 보존 → F2 에서 일괄 제거 | 30+ 파일 영향, 단계적 마이그레이션 |
| 사용자 측 취소 | DetailModal 내 **inline confirm** ("예, 취소합니다" / "아니오") | nested modal 회피, Esc 시 confirm 만 해제 |
| Admin DetailModal | 취소 버튼 추가 (CalendarSidePanel 액션 진입점 사라진 보완) | F5 chip 클릭 → 모달 → 취소 흐름 |
| AdminTopNav 검색바 | `<div role="search">` + disabled visual | 통합 검색 API 미구현 + jsdom getByRole(textbox) 충돌 회피 |
| 담당교역자 필터 | UI placeholder + 백엔드 todo §10 | 백엔드 API 미지원, disabled 안내 |
| 단일 커밋 전략 | Phase 2 + F2 + F4 + F5 모두 한 묶음으로 | 의미 단위 묶음, PR 리뷰 자연스러움 |

---

## 5. 백엔드 보완 사항 (별도 작업자 인계)

`docs/backend/todo-design-required-data.md` 단일 문서로 통합. **14 항목**.

| § | 항목 | 우선순위 |
|---|------|---------|
| 1 | 통합 검색 API `/api/v1/admin/search/` (별도 엔드포인트) | 높음 |
| 2 | `Space.photo_url` | 중 |
| 3 | 관리자 주간 KPI 집계 API | 중 |
| 4 | 팀 응답에 `pastor.phone` 노출 | 중 |
| 5 | 공간 가동률 집계 | 낮음 |
| 6 | 인기 공간 집계 | 낮음 |
| 7 | `Space.weekly_count` | 낮음 |
| 8 | 예약 응답에 `department_name` | 중 |
| 9 | `Team.leader_phone` 데이터 정합성 | 데이터 이슈 |
| 10 | admin reservations `?pastor_id=` 필터 | 중 |
| 11 | admin reservations 검색 범위 확장 (`team__name` / `purpose` 등) | 높음 |
| 12 | admin reservations 정렬 컬럼 확장 | 중 |
| 13 | admin reservations 전화번호 검색 정규화 | 중 |
| 14 | admin reservations 검색어 trim 가드 | 낮음 |

본 14 항목 해소 시 프론트의 `// TODO(backend):` 주석 (디자인안 의도 미달 영역) 도 단계적으로 정리 가능.

---

## 6. 환경 노트

- **백엔드 이미지 재빌드 필요**: `requirements.txt` 의 `qrcode[pil]` 이 기존 이미지에 미포함이라 첫 기동 실패. `DOCKER_BUILDKIT=0 docker compose -f infra/docker-compose.yml build api worker` 후 정상 (buildkit 자체 EOF 에러로 legacy 빌더 강제 필요)
- **Dev DB 포트 5433**: Windows native postgresql 서비스가 5433 점유하면 docker compose `db` 컨테이너와 충돌. native 서비스 disable 필요
- **Dev 서버 좀비 정리**: Vite dev 비정상 종료 시 포트 5173 좀비 점유. PC 재부팅 또는 `netstat -ano | findstr :5173` 로 프로세스 확인 후 종료

---

## 7. 후속 작업 후보

1. **백엔드 todo 14 항목** — 별도 작업자 인계 (`docs/backend/todo-design-required-data.md`)
2. **React Router v7 future flag 마이그레이션** — F3 발견 #6 (`v7_startTransition` / `v7_relativeSplatPath`)
3. **백엔드 §10 해소 후** — `ListFilterBar` 담당교역자 disabled 해제 + `pastorOptions` prop 연결
4. **백엔드 §11~§14 해소 후** — `ListTable` 정렬 컬럼 확장 + 검색 placeholder "이름·전화 검색" → "이름·부서·목적·전화 검색"
5. **운영 데이터 정리 후 시각 재검증** — `Team.leader_phone` 정합 + `Pastor.phone` 적용 시 DetailModal 표시 재확인

---

## Appendix A — 디자인 자료 참조 위치

| 자산 | 경로 |
|------|------|
| 디자인 명세 | `design_handoff_reservation_system/README.md` |
| CSS 토큰 | `design_handoff_reservation_system/tokens.css` |
| 시각 프로토타입 (booking + my) | `design_handoff_reservation_system/option-a.jsx` |
| 시각 프로토타입 (admin + step1·3·5 + detail modal) | `design_handoff_reservation_system/option-a-more.jsx` |
| 아이콘 SVG 참조 | `design_handoff_reservation_system/shared.jsx` → lucide-react 매핑 |

## Appendix B — 관련 문서

- 백엔드 보완 todo (14 항목): `docs/backend/todo-design-required-data.md`
- 디자인 핸드오프 패키지: `design_handoff_reservation_system/` (README + tokens.css + option-a.jsx + option-a-more.jsx + shared.jsx)

> 작업 진행 중 사용된 historical 문서 3건 (`phase2-design-overhaul-plan.md`, `phase2-progress.md`, `phase2-follow-up-plan.md`) 은 본 report 로 흡수 후 정리. 본 report 가 최종 단일 소스.
