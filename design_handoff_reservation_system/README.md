# 핸드오프: 가나안교회 장소 사용 신청 시스템 리디자인

## Overview

가나안교회의 기존 **장소 사용 신청(예약) 시스템** UI 전체 리디자인 패키지입니다. 신청자 5단계 흐름, 내 예약 조회, 관리자 콘솔까지 14개 주요 화면이 포함되어 있습니다.

- **디자인 방향**: Refined Sage — 기존 브랜드 초록(#1F5F4A)을 살리되, 따뜻한 아이보리(#F4F1E8) 배경 + 황동(#B8956A) 액센트로 격을 높인 프리미엄 안
- **인상**: Toss / Naver Works 수준의 정돈된 인터랙션 + 교회의 정서적 무게감 유지
- **타이포**: Pretendard (한글 가독성 최상)
- **언어**: 한국어 UI

## About the Design Files

이 폴더에 동봉된 `.html` / `.jsx` 파일은 **디자인 레퍼런스**입니다 — HTML+React로 제작한 시각 프로토타입으로, 의도된 모양·레이아웃·인터랙션을 보여주기 위한 것입니다.

작업 목표는 **기존 코드베이스의 환경(React/Vue/Next.js 등)에 맞게 이 디자인을 다시 구현**하는 것입니다. HTML 파일을 그대로 배포하는 것이 아닙니다. 기존 프로젝트에 이미 사용하고 있는 패턴·라이브러리·라우팅을 따라 컴포넌트화하세요. (만약 신규 프로젝트라면 React + Tailwind 또는 React + CSS Modules 조합을 권장합니다.)

## Fidelity

**하이파이(High-fidelity)** — 컬러, 타이포그래피, 간격, 그림자, 라운드 모두 최종값입니다. 픽셀 정확도로 재현하는 것을 권장합니다.

다만 다음은 **placeholder**이므로 실제 자산으로 교체 필요:
- 공간 사진(자람뜰홀, 사랑방 등): 현재 그라데이션 + 아키텍처 실루엣 SVG로 대체. 실제 공간 사진으로 교체 권장.
- 사용자 아바타: 현재 이니셜 원형. 실제 프로필 사진 시스템이 있다면 연결.

---

## Design Tokens

### Colors (Refined Sage palette)

```css
/* Base */
--color-bg:           #F4F1E8;  /* page background — warm ivory */
--color-surface:      #FFFFFF;  /* card / panel background */
--color-surface-2:    #FBF9F2;  /* subtle inset (input, disabled bg) */

/* Brand */
--color-primary:      #1F5F4A;  /* deep moss — primary actions, brand */
--color-primary-dark: #16493A;  /* hover/pressed primary */
--color-primary-50:   rgba(31, 95, 74, 0.06);   /* faint tint */
--color-primary-100:  rgba(31, 95, 74, 0.10);   /* light tint (selected bg, ghost button) */

/* Accent */
--color-accent:        #B8956A;  /* brass — section eyebrows, premium accent */
--color-accent-soft:   #E8D9BD;  /* brass tinted bg (admin badge, dept chip) */

/* Text */
--color-text:          #161A18;  /* primary text */
--color-text-soft:     #5B6360;  /* secondary text */
--color-text-mute:     #9AA29D;  /* tertiary / placeholder */

/* Borders */
--color-border:        #E5E0D2;  /* default border */
--color-border-soft:   #F0EBDB;  /* card / divider border */

/* Status */
--color-danger:        #B84A3E;  /* destructive / cancel */
--color-warn:          #C68A3A;  /* pending / warning */

/* Status pill backgrounds */
--status-confirmed-bg:   rgba(31, 95, 74, 0.10);
--status-confirmed-fg:   #1F5F4A;
--status-pending-bg:     rgba(184, 138, 58, 0.18);
--status-pending-fg:     #8C6428;
--status-canceled-bg:    #F0EBDB;
--status-canceled-fg:    #9AA29D;
```

### Typography

- Font family: **Pretendard** (한글 우선, 영문도 동일 패밀리)
  - CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css`
- Weights used: 400, 500, 600, 700, 800
- `font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`

| Role | Size | Weight | Letter-spacing |
|---|---|---|---|
| Display (랜딩 헤드라인) | 48px | 800 | -0.035em |
| Page title (`<h1>`) | 26px | 800 | -0.025em |
| Section title (`<h2>`) | 18-22px | 800 | -0.02em |
| Card title | 15-17px | 700-800 | -0.02em |
| Body | 14px | 400-500 | normal |
| Small / meta | 12-13px | 500-600 | -0.01em |
| Caption / chip | 10-11px | 700-800 | 0.04-0.08em (uppercase eyebrows) |

Numbers: always use `font-variant-numeric: tabular-nums` for amounts, dates, times, phone numbers.

### Spacing

8px-based scale. Common values:

| Token | Value | Use |
|---|---|---|
| xs  | 4px  | gap between icon and label |
| sm  | 6-8px | inner padding small chips |
| md  | 12px | gap between cards in a row |
| lg  | 16-18px | section gap |
| xl  | 24-28px | between major regions, h1 below |
| 2xl | 36-40px | landing hero gap |

Page container: `max-width: 1180px; padding: 40px 40px 32px;` (centered).

### Border radius

| Token | Value | Use |
|---|---|---|
| sm  | 6-8px   | small chips, tags |
| md  | 10-12px | inputs, buttons |
| lg  | 14-16px | cards |
| xl  | 18-22px | major panels, modals |
| pill | 999px  | status pills, step chips, segmented controls |

### Shadow

```css
--shadow-md: 0 1px 2px rgba(20,30,25,0.04), 0 8px 28px rgba(20,30,25,0.05);
--shadow-lg: 0 2px 4px rgba(20,30,25,0.04), 0 24px 64px rgba(20,30,25,0.08);

/* Primary button glow */
box-shadow: 0 8px 20px rgba(31, 95, 74, 0.25);
```

### Iconography

- Style: **Lucide-like stroke icons**, `stroke-width: 1.6-1.8`, `stroke-linecap: round`, `stroke-linejoin: round`
- Sizes: 11px (chip), 13-14px (button), 16-18px (card), 22-26px (hero)
- See `shared.jsx` for the full inline SVG icon set used. Replace with `lucide-react` or equivalent in your stack.

---

## Component Specs

### Top Bar (`AShell` header)

- Height: ~62px
- Background: white, `border-bottom: 1px solid var(--color-border-soft)`
- Padding: `18px 40px`
- Contents (left → right):
  1. Logo mark (28×28, primary bg, rounded 7px, white building icon)
  2. **가나안교회** label (700, 17px, primary color)
  3. Vertical divider (1×16, border color)
  4. Page subtitle "장소 사용 신청" (14px, text-soft)
  5. Spacer
  6. Tab pill group (예약 신청 / 내 예약 조회) — segmented control style
     - Background: bg color, padding 4px, border-radius 999px
     - Active item: white bg, primary text, slight shadow
     - Inactive item: transparent, text-soft

### Step Header (`AStepHeader`)

**Title row:**
- `<h1>` (26px, 800, -0.025em) with step name (예: "장소 선택")
- Step pill badge: `N / 5`, brass-tinted bg, 800 weight, monospace numbers
- Right side: **취소** (danger button) + **완료** button (primary if all fields filled, disabled-gray otherwise)

**Chip nav (below title):**
- Horizontal flow of step chips with chevron separators between
- Each chip has a circular number badge (22×22) + label
- States:
  - **Done** (completed previous step): `--color-primary-50` bg, primary text, primary circle with white checkmark
  - **Current**: solid primary bg, white text, white-translucent circle, subtle shadow
  - **Pending**: transparent bg, mute text, outlined empty circle
- All chips clickable (cursor pointer). Clicking jumps directly to that step.

**Key UX**: 완료 button activates the moment all required fields across all steps are filled, regardless of current step. Step chips are always navigable. This avoids forcing the user to walk linearly back through steps to make a small edit.

### Bottom Bar (`ABottomBar`)

- Positioned absolute bottom inside the content container
- Padding 20px 40px, light gradient fade for visual separation from content
- Two buttons: **이전** (outlined ghost, 200px wide) and **다음** (filled primary, flex-1, with arrow-right icon)
- On Step 5: only **이전** shown (since 완료 is in the header)

### Buttons

```css
/* Primary */
.btn-primary {
  padding: 16px 24px;
  border-radius: 14px;
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: -0.01em;
  box-shadow: 0 8px 20px rgba(31,95,74,0.25);
}

/* Smaller primary (header CTA) */
.btn-primary-sm { padding: 9px 22px; border-radius: 10px; font-size: 13px; }

/* Outlined / ghost */
.btn-ghost {
  padding: 16px 24px;
  border-radius: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-weight: 600;
}

/* Danger (취소) */
.btn-danger {
  background: var(--color-danger);
  color: white;
  box-shadow: 0 2px 6px rgba(184,74,62,0.18);
}

/* Disabled */
.btn-disabled {
  background: var(--color-border-soft);
  color: var(--color-text-mute);
  cursor: not-allowed;
}
```

### Card

```css
.card {
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border-soft);
  box-shadow: var(--shadow-md);
}

.card.selected {
  border: 2px solid var(--color-primary);
  box-shadow: 0 4px 16px rgba(31,95,74,0.14);
}
```

### Input

```css
.input {
  padding: 13px 16px;
  border-radius: 11px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  font-size: 14px;
  font-family: Pretendard;
}

.input:focus, .input.valid {
  border: 1.5px solid var(--color-primary);
  background: var(--color-surface-2);
}
```

### Chip (selection chip / tag)

```css
.chip {
  padding: 7px 13px;
  border-radius: 999px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-soft);
  color: var(--color-text-soft);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.chip.active {
  background: var(--color-primary);
  color: white;
  border: none;
}
```

### Status pill

Small inline tag for reservation status. See colors in tokens section.

```css
.status-pill {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
```

### KPI Card (admin dashboard)

- White card, 16-18px padding, rounded 14px
- Layout: row with `<label + value>` on left, icon square on right
- Label: 11px, text-mute, weight 600
- Value: 22-28px, weight 800, letterSpacing -0.02em
- Delta line below: 11px, primary color (good) / accent color (warning), with TrendUp icon

### Summary Sidebar (`ASummary` — right column on flow screens)

- Width 280px, white card, 16-18px radius
- Eyebrow: "신청 현황" in brass (11px, 0.08em letter spacing)
- Items in a flex column with gap 16px, each:
  - Label (11px, mute, 500)
  - Value (14px, 600, primary text)
- Footer help block: brass sparkle icon + helper text in subtle inset card

### Step Chip Nav — see Step Header section above

### Room Card (장소 선택)

- Horizontal layout: 130px wide photo on left, content on right
- Photo: gradient background + repeating dot texture + simple architectural arch silhouette (placeholder until real photos)
- "인기" badge (top-left, semi-translucent white pill, 8px brass text)
- Selected state: 2px primary border + green-tinted shadow + filled checkmark circle in top-right of content
- Unselected: 1px border, plus icon in outlined circle
- Content: floor eyebrow (10px brass, uppercase), name (17px, 800), capacity + duration line, tag chips, divider, "이번 주 N회 예약됨" footer with availability dot

### Calendar (date picker on Step 4)

- 7-column grid, gap 2px
- Day name headers (일~토) — 11px, 700, color-coded (red Sun, blue Sat, mute weekdays)
- Day cells: aspect-ratio 1, rounded 8px
- Selected day: filled primary, white text, weight 800
- Today (not selected): primary-100 bg + 1.5px primary border
- Inactive days outside month: transparent text
- Below: a small "선택한 날짜" inset showing the readable date

### Time Slot Grid (heatmap)

- 6 columns, 30-min slot pills
- States:
  - **Selected**: primary filled, white text, 700 weight
  - **Available**: primary-100 tint, dark text
  - **Booked**: border-soft bg, mute text, line-through, not-allowed cursor
- Legend below shows all three states

### Modal

- Backdrop: `rgba(20,30,25,0.40)`
- Modal container: max-width 460-520px, white, rounded 20px, shadow-lg
- Optional banner header (primary green bg, white text) for branded modals
- Footer: light bg, right-aligned actions

### Admin Top Nav

- White header bar, similar to user-side but includes:
  - Logo + "가나안교회" + "ADMIN" badge (brass-tinted bg)
  - Tab list: 예약 / 팀 / 건물 / 공간 (active tab has primary-100 bg, primary text)
  - Search bar with ⌘K hint
  - Logout button

### View Toggle (admin 달력/리스트)

- Always in the same position: **page header top-right**, just before Settings/CSV buttons
- Segmented control style with icons: 📅 달력 / 📋 리스트
- Active: primary bg, white text. Inactive: transparent, text-soft

---

## Screens (14 screens, 4 groups)

### Group 1: Sign-up Entry (2 screens)

#### 1.1 Landing — `/`
- Hero section, two columns (1:1)
- Left: eyebrow tag, 3-line headline (48px 800), one-line description, primary CTA "장소 사용 신청하기" + secondary "내 예약 조회"
- Below stats row: `24 예약 가능 공간` · `평균 90초` · `약 2시간 확정 알림`
- Right: tilted backplate (primary-100 bg rotated -1.2°) + main card showing 5-step list with building icon

#### 1.2 My Reservation Login — `/my/login`
- Centered card, max-width 440px
- Card has tilted primary-100 backplate (rotated -1.5°) for visual interest
- Clipboard icon hero, title "내 예약 조회", description
- Two inputs: 이름, 연락처 (`010-`)
- Primary CTA: "예약 조회하기" with Search icon
- Helper note at bottom in subtle inset

### Group 2: 5-Step Booking Flow (6 screens)

#### 2.1 Step 1 — 신청자 정보 — `/booking/step-1`
- 2-column layout
- **Left card**: 기본 정보 (이름 — valid state with green border + check icon; 연락처 — neutral state with phone icon)
- **Right card**: 단체
  - 부서 선택 chips: 1교구 ~ 6교구, 청년부, 교회학교, 어와나, 기타 (10 chips)
  - 소그룹 선택 chips: 퍼글스, 커비단, 스팍스, 티엔티, 저니, 트렉
  - 담당 교역자 inset card with avatar circle + name + phone

#### 2.2 Step 2 — 장소 선택 — `/booking/step-2`
- Main content + right summary sidebar (280px)
- Building tabs (3): 본당 / 가나안홀 / 무지개홀 — boxy outlined cards with active state primary border + dot indicator
- Floor segmented control (전체/1F/2F/3F) + result count
- Room card grid (2 columns) — see Room Card spec above

#### 2.3 Step 3 — 인원 선택 — `/booking/step-3`
- Helper notice card at top (sparkle icon + recommended capacity warning)
- 6-option grid (3 columns × 2 rows):
  - ~10명 / ~20명 / ~30명 / ~50명 / ~100명 (selected) / 100명 이상
- Each: icon square top-left (size scales with capacity), large number (22px, 800), subtitle
- Selected: 2px primary border + filled circle checkmark top-right

#### 2.4 Step 4 — 날짜 및 시간 — `/booking/step-4`
- 2-column main: Calendar (300px) + Time grid (flex)
- Calendar (see spec)
- Time grid (see spec): 6×N slots from 07:00 to 21:30
- Title shows current selected range as pill: "11:30 — 15:00 · 3h 30m"

#### 2.5 Step 5 — 사용 목적 — `/booking/step-5`
- 9-option grid (3 columns × 3 rows): 정기 모임 / 예배·기도회 / 성경 공부 / 찬양 연습 / 세미나·강의 / 친교·식사 / 위원회·회의 / 행사·특별 집회 / 기타 (직접 입력) — selected by default
- Each card: icon square + label, horizontal layout
- Custom textarea below (highlighted with primary border when "기타" selected)
- Character counter (0 / 200)
- Bottom bar shows only **이전** (no 다음 — submission via header 완료)

#### 2.6 Confirmation — `/booking/confirm`
- Two-column hero
- **Left**: "마지막 단계" eyebrow, 2-line title, description, mini step checklist with green checkmark circles
- **Right**: Ticket-style card with:
  - Primary green header bar (RESERVATION SUMMARY + 신청 내용 확인 + ticket icon)
  - Body: 6 rows of (icon + label + value + subnote), dashed dividers
  - Perforated edge (CSS radial gradient pattern)
  - Footer: 수정하기 (ghost) + 신청하기 (primary, full width)

### Group 3: My Reservations (2 screens)

#### 3.1 My Reservations List — `/my`
- Header: "염시온님의 예약 내역" h1 + counts subtitle + "다시 조회" button (top-right)
- 4 KPI mini-cards: 예정 4건 / 확정 2건 / 대기 1건 / 취소 1건
- Main reservation table with columns: 번호 / 공간 / 날짜·시간 / 인원 / 사용 목적 / 상태 / 액션
- Each row 16px vertical padding
- Status pill in 상태 column
- Action buttons: 티켓 다운로드 (ghost) + 취소 (danger-tinted)
- Below the upcoming rows: full-width toggle "▼ 지난 내역 숨기기 · 12건" button (surface-2 bg, 700 weight)
- Past entries shown dimmed (opacity 0.55) when expanded

#### 3.2 Reservation Detail Modal — overlay on 3.1
- Backdrop + modal centered
- Modal: 520px wide, white, rounded 20px
- Header banner: primary bg, "RESERVATION · #N" eyebrow + "예약 상세" title + status pill + X button
- Body: 3 sections (장소 및 일시 / 신청자 정보 / 예약 정보), each with brass eyebrow + key-value rows separated by light dividers
- Footer: light bg, right-aligned "닫기" button

### Group 4: Admin Console (5 screens)

#### 4.1 Admin Login — `/admin/login`
- Centered card 420px
- Decorative shapes: large primary-100 circle top-left, brass accent-soft circle bottom-right
- Card: logo + "가나안교회 ADMIN CONSOLE" + h1 + description + 2 inputs + 로그인 button

#### 4.2 Admin Dashboard (달력 view) — `/admin`
- Top admin nav (see spec)
- Page header: "예약 관리" + date subtitle + **view toggle (달력/리스트)** + 설정 + CSV
- 4 KPI cards row (이번 주 예약 37 / 확정 대기 8 / 가동률 64% / 인기 공간 자람뜰홀)
- Main grid: calendar (flex) + right rail (340px)
- Calendar: 7-column event grid, each cell up to 2-3 event chips
- Right rail: 오늘 card (date + empty state if no events) + 확정 대기 card with avatar-and-action rows

#### 4.3 Admin Reservation List — `/admin/list`
- Same admin nav + header (with **view toggle** in same position, 리스트 active)
- 2-column layout: filter sidebar 220px + table
- Sidebar sections: 기간 구분 (예정/지난) / 상태 (chips) / 필터 (장소, 1주 이내, 담당교역자 dropdowns + 검색)
- Table: detailed columns with color bar accent left
- Action buttons per row: 상세 / 확정 (대기 only) / 취소 (확정 only)

#### 4.4 Team Management — `/admin/teams`
- Admin nav with 팀 tab active
- Header: "팀 관리" + count + "+ 팀 추가" button (primary)
- Department filter chips (전체 / 1교구 / 2교구 / ... / 어와나) — 어와나 highlighted in brass tint
- Team table: 팀명 / 부서 / 담당 교역자 / 연락처 / 관리 (수정 / 삭제)
- Each row: avatar circle (brass-tinted, initial letter) + team name

#### 4.5 Add Team Modal — overlay on 4.4
- 460px modal, white, rounded 20px
- Header: "NEW TEAM" eyebrow + "팀 추가" h2 + X button
- 4 fields: 팀명 (text, required) / 부서 (select, required) / 담당 교역자 (select) / 연락처 (text, required)
- Required marker: red asterisk
- Footer: 닫기 (ghost) + "팀 추가하기" (primary, 2x flex)

---

## Interactions & Behavior

### Step navigation (Group 2)

- Step chips are clickable at all times; clicking jumps to that step
- 완료 button in the header is enabled only when all 5 steps' required fields are valid
- 다음 button moves linearly to the next step (helpful for first-time users)
- 이전 button moves back one step
- 취소 button discards the in-progress booking and returns to landing

**Critical UX**: After completing all 5 steps, the user can edit any earlier step via chip click and immediately submit via 완료 — they don't need to walk through steps 2→3→4→5→confirm again.

### Form validation

- Real-time validation. Field shows "valid" state (green border + check icon) when filled correctly.
- 010-XXXX-XXXX format enforced on phone fields (auto-formatting recommended)
- 이름 required (any 한글 입력 OK, minimum 1 char)

### Time slot drag-select

- Click a slot to start a range, click another to end. Range fills between.
- Booked slots are not selectable.
- Optional: support drag-to-select for faster selection.

### Reservation list expand

- "지난 내역 숨기기" / "지난 내역 보기" toggle expands a section of past (chronologically older) reservations
- Past entries are dimmed and show only the 티켓 button (no 취소)

### Admin view toggle

- 달력 / 리스트 toggle in page header top-right
- Both views share the same data, just different layouts
- State should persist across navigations (or per-tab in URL)

### Modal behavior

- Click backdrop to close
- ESC to close
- Body scroll lock when open

---

## State Management

Minimal expected client state:

```ts
// Booking flow
type BookingDraft = {
  applicant: { name: string; phone: string; dept: string; subgroup?: string; pastor?: { name: string; phone: string } };
  place: { building: string; floor: string; room: string; roomId: string; capacity: number };
  people: '~10' | '~20' | '~30' | '~50' | '~100' | '100+';
  date: string;           // YYYY-MM-DD
  timeStart: string;      // HH:mm
  timeEnd: string;        // HH:mm
  purpose: string;
  purposeNote?: string;
  step: 1 | 2 | 3 | 4 | 5 | 'confirm';
};

// My reservations
type Reservation = {
  id: number;
  building: string; floor: string; room: string;
  date: string; timeStart: string; timeEnd: string;
  people: number;
  purpose: string;
  status: '확정' | '대기' | '취소' | '거절';
  createdAt: string;
};

// Admin
type AdminView = '달력' | '리스트';
type AdminFilters = {
  period: '예정' | '지난';
  status: ('전체' | '확정' | '대기' | '취소' | '거절')[];
  building?: string;
  range?: '1주' | '1개월' | '3개월';
  search?: string;
};
```

The booking draft should persist to localStorage so users can resume mid-flow.

---

## Backend / API hints

Likely endpoints to support:

```
GET    /api/buildings                   — list buildings + spaces + capacities
GET    /api/teams                       — list teams (dept, pastor, phone)
GET    /api/availability?room&date      — return booked slots for a date
POST   /api/reservations                — create reservation
GET    /api/reservations?name&phone     — my reservations lookup
DELETE /api/reservations/:id            — cancel
GET    /api/admin/reservations?...      — admin list with filters
POST   /api/admin/reservations/:id/confirm
POST   /api/admin/teams                 — create team
PATCH  /api/admin/teams/:id             — edit
DELETE /api/admin/teams/:id             — delete
GET    /api/admin/stats?week            — weekly KPI numbers
```

---

## Assets

### Required real assets (please obtain)
- 공간(room) photos: 자람뜰홀, 사랑방, 믿음방, 소망방, 드림홀, 카페, 에벤에셀홀, 물댄동산방, 그릿시내홀 등
- 가나안교회 official logo (if you'd like a wordmark/logotype instead of the current building-icon mark)

### Provided as placeholders
- Stylized gradient + architectural silhouette per room (`RoomPhoto` component in `shared.jsx`)
- Inline SVG icon set (Lucide-style strokes) — see `shared.jsx`. Recommend replacing with `lucide-react` (or your stack's equivalent) in production.

### Fonts
- Pretendard via CDN (already linked in `index.html`). For production, self-host the woff2 files from the same repo or use a package like `pretendard` on npm.

---

## Files in this bundle

| File | Purpose |
|---|---|
| `index.html` | Entry point — boots React + Pretendard + the JSX files |
| `shared.jsx` | Icon set + `RoomPhoto` placeholder + utilities |
| `option-a.jsx` | Tokens (`A`), shell components (`AShell`, `AStepHeader`, `ABottomBar`, `ASummary`), and screens: Landing, PlaceSelect (Step 2), DateTime (Step 4), Confirm, MyReservations, Admin (달력) |
| `option-a-more.jsx` | Additional screens: Step 1/3/5, MyLogin, DetailModal, AdminLogin, AdminTeam, AdminList, AddTeamModal |
| `main.jsx` | Composes the design-canvas wrapper. **Not needed for production** — it's only the canvas presentation for review. Implementers should look at the screen functions inside `option-a*.jsx` instead. |
| `design-canvas.jsx` | Pan/zoom presentation wrapper. **Not needed for production**. |
| `option-b.jsx` / `option-c.jsx` | Alternative design directions (Toss Indigo, Warm Walnut). Reference only — chosen direction is A. |

To run locally:
```bash
# Just open index.html in a browser. No build step.
# Or: npx serve .
```

---

## Implementation Tips

1. **Start with the tokens.** Add the color, type, spacing variables to your design system / theme file first. Get them consistent before building components.

2. **Build components bottom-up**: Button → Chip → Card → Input → then composite screens. Most screens reuse 5-7 atoms.

3. **Booking flow as a single route with internal step state**, not 5 separate routes. This makes step-chip jumping trivial. The URL can carry `?step=2` for back/forward support.

4. **The Step Header pattern is the heart of the booking UX.** Get it right (clickable chips + always-visible 취소/완료) and the rest follows.

5. **Replace room placeholders with real photos** as a final pass. The current gradient cards work as a fallback but real photos significantly elevate the feeling.

6. **Mobile**: The current designs are desktop-first (1280px). Mobile should stack the flow into a single column, replace the right summary sidebar with a collapsible top section or sticky-bottom summary, and convert the 2-column step cards to single-column. The step chip nav becomes a horizontal scroll.

7. **Accessibility**:
   - Step chips should be `<button>` elements with proper ARIA labels
   - Time slots should be a proper grid with keyboard nav
   - All status pills should have screen-reader text since color alone shouldn't convey status
   - Modal needs focus trap + restore focus on close

---

## Questions for the implementer to confirm

- What's the existing stack? (React / Vue / Next / SvelteKit / vanilla?)
- Existing component library? (shadcn/ui, MUI, Ant Design, none?)
- Routing convention (Next.js app router, React Router, etc.)?
- Auth approach for the admin section?
- Where do the room photos come from? Will the admin upload them, or are they static assets?

If you (the developer) are using Claude Code to implement this, you can paste this README alongside the HTML files and say:

> "이 폴더의 디자인을 우리 [React + Next.js + Tailwind] 프로젝트에 구현해줘. README.md에 토큰과 컴포넌트 명세가 다 있어. /pages/booking 디렉토리에 5단계 흐름부터 만들기 시작해줘."

Claude Code will do the rest.
