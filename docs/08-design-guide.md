# ThePromise 디자인 가이드

> 유저 신청서 페이지 및 어드민 전체 조회 페이지를 위한 HTML/CSS 디자인 기준 문서

---

## 1. 디자인 시스템

### 1.1 컬러 팔레트

| 토큰 | Hex | 용도 |
|------|-----|------|
| `--color-primary` | `#008F49` | 주요 버튼, 활성 테두리, 강조 라인, 확정 상태 |
| `--color-secondary` | `#AAA014` | 호버 효과, 내비게이션 테두리, 보조 강조 |
| `--color-accent` | `#BC8A5F` | 보조 라벨, 연도 텍스트, 아이콘 |
| `--color-bg` | `#FEFAE0` | 전체 페이지 배경 |
| `--color-text` | `#000000` | 기본 본문 텍스트 |
| `--color-surface` | `#FFFFFF` | 카드, 입력창 배경 |
| `--color-border` | `#E5E7EB` | 기본 테두리 (gray-200 상당) |
| `--color-error` | `#DC2626` | 오류 메시지, 거절 상태 |
| `--color-warning` | `#CA8A04` | 대기 상태 배지 |

```css
:root {
  --color-primary:   #008F49;
  --color-secondary: #AAA014;
  --color-accent:    #BC8A5F;
  --color-bg:        #FEFAE0;
  --color-text:      #000000;
  --color-surface:   #FFFFFF;
  --color-border:    #E5E7EB;
  --color-error:     #DC2626;
  --color-warning:   #CA8A04;
}
```

> **기존 코드 마이그레이션**: 현재 `blue-600` 계열로 작성된 Tailwind 클래스를 위 팔레트로 교체한다.
> - `bg-blue-600` → `bg-[#008F49]`
> - `focus:ring-blue-400` → `focus:ring-[#008F49]`
> - `border-blue-500` → `border-[#008F49]`
> - `border-blue-600` → `border-[#008F49]`
> - `bg-blue-500` → `bg-[#008F49]`

---

### 1.2 타이포그래피

| 역할 | 폰트 | 굵기 | 크기 | 정렬 |
|------|------|------|------|------|
| Page Title | Noto Sans KR / Inter | 700 (Bold) | 20px (`text-xl`) | 좌측 |
| Section Heading | Noto Sans KR / Inter | 700 (Bold) | 18px (`text-lg`) | 좌측 |
| Calendar Month | Noto Sans KR / Inter | 900 (Black) | 36px+ | 좌측 |
| Calendar Year | Noto Sans KR / Inter | 400 (Regular) | 20px | 좌측, `--color-accent` |
| Label | Noto Sans KR / Inter | 500 (Medium) | 14px (`text-sm`) | 좌측 |
| Input Text | Noto Sans KR / Inter | 400 (Regular) | 16px (`text-base`) | 좌측 |
| Caption / Badge | Noto Sans KR / Inter | 500 (Medium) | 12px (`text-xs`) | - |

```css
body {
  font-family: 'Noto Sans KR', 'Inter', sans-serif;
  color: var(--color-text);
  background-color: var(--color-bg);
}
```

---

### 1.3 간격 시스템

| 용도 | 값 |
|------|-----|
| 섹션 간 간격 | `gap-6` / `24px` |
| 라벨-입력창 간격 | `mb-1` / `4px` |
| 입력창 내부 패딩 | `px-4 py-3` / `12px 16px` |
| 카드 내부 패딩 | `px-6 py-5` / `20px 24px` |
| 버튼 높이 | `py-3` / `48px~54px` |
| 셀 내부 패딩 (캘린더) | `6px~8px` |

---

### 1.4 테두리·그림자

| 용도 | 값 |
|------|-----|
| 기본 입력창 radius | `rounded-xl` / `12px` |
| 버튼 radius | `rounded-xl` / `12px` |
| 카드 radius | `rounded-xl` |
| 캘린더 Nav 버튼 radius | `rounded-[14px]` / `14px` |
| 카드 그림자 | `shadow-md` |
| 입력창 기본 테두리 | `1px solid var(--color-border)` |
| 입력창 포커스 테두리 | `1px solid var(--color-primary)` + ring |

---

## 2. 공통 컴포넌트

### 2.1 Input Field

```html
<!-- 기본 입력창 -->
<div class="flex flex-col gap-1">
  <label class="text-sm font-medium text-black">
    신청자 이름 <span class="text-[#DC2626]">*</span>
  </label>
  <input
    type="text"
    placeholder="홍길동"
    class="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base
           focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/30
           transition-colors duration-200"
  />
</div>

<!-- 에러 상태 -->
<input
  class="... border-[#DC2626] bg-red-50 focus:border-[#DC2626] focus:ring-[#DC2626]/30"
/>
<p class="text-xs text-[#DC2626] mt-1">이름을 입력해주세요.</p>
```

```css
/* 순수 CSS */
.input-field {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 12px 16px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 143, 73, 0.2);
}
.input-field.error {
  border-color: var(--color-error);
  background: #FEF2F2;
}
```

---

### 2.2 Submit Button

```html
<!-- 기본 제출 버튼 -->
<button
  type="submit"
  class="w-full rounded-xl bg-[#008F49] px-4 py-3 text-base font-bold text-white
         hover:bg-[#AAA014] active:bg-[#007A3D]
         disabled:bg-[#E5E7EB] disabled:cursor-not-allowed
         transition-colors duration-300"
>
  장소 사용 신청
</button>
```

```css
/* 순수 CSS */
.btn-primary {
  width: 100%;
  border-radius: 12px;
  background-color: var(--color-primary);
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-primary:hover {
  background-color: var(--color-secondary);
}
.btn-primary:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
}
```

---

### 2.3 Status Badge

예약 상태(`pending` / `confirmed` / `rejected` / `cancelled`)를 나타내는 인라인 배지.

```html
<!-- 확정 -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium
             bg-[#008F49]/10 text-[#008F49] border border-[#008F49]/30">
  확정
</span>

<!-- 대기 -->
<span class="... bg-[#AAA014]/10 text-[#AAA014] border-[#AAA014]/30">대기</span>

<!-- 거절 -->
<span class="... bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30">거절</span>

<!-- 취소 -->
<span class="... bg-[#E5E7EB] text-gray-600 border-gray-300">취소</span>
```

```css
/* 순수 CSS - 공통 */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}
.badge-confirmed { background: rgba(0,143,73,0.1); color: #008F49; border-color: rgba(0,143,73,0.3); }
.badge-pending   { background: rgba(170,160,20,0.1); color: #AAA014; border-color: rgba(170,160,20,0.3); }
.badge-rejected  { background: rgba(220,38,38,0.1); color: #DC2626; border-color: rgba(220,38,38,0.3); }
.badge-cancelled { background: #F3F4F6; color: #6B7280; border-color: #D1D5DB; }
```

---

### 2.4 Card

```html
<div class="bg-white rounded-xl shadow-md border border-[#E5E7EB] overflow-hidden">
  <div class="px-6 py-5">
    <!-- 카드 내용 -->
  </div>
</div>
```

---

### 2.5 건물/층/공간 선택 버튼 (SpaceSelector)

```html
<!-- 비활성 -->
<button class="rounded-xl px-4 py-2 text-sm font-medium
               bg-[#E5E7EB] text-[#374151] hover:bg-[#D1D5DB]
               transition-colors duration-200">
  본당
</button>

<!-- 활성 (선택됨) -->
<button class="rounded-xl px-4 py-2 text-sm font-medium
               bg-[#008F49] text-white">
  가나안홀
</button>
```

---

### 2.6 시간 슬롯 버튼 (TimeSlotPicker)

```html
<!-- 기본 -->
<button class="px-2 py-1 text-sm rounded-lg border border-[#E5E7EB] bg-white text-gray-700
               hover:bg-gray-50 transition-colors duration-150">
  09:00
</button>

<!-- 시작 시간 선택 -->
<button class="... bg-[#008F49] text-white border-[#008F49]">09:00</button>

<!-- 범위 내 슬롯 -->
<button class="... bg-[#008F49]/10 text-[#008F49] border-[#008F49]/30">09:30</button>

<!-- 종료 시간 선택 -->
<button class="... bg-[#007A3D] text-white border-[#007A3D]">10:00</button>

<!-- 비활성 (선택 불가) -->
<button class="... bg-[#F9FAFB] text-gray-400 border-[#E5E7EB] cursor-not-allowed" disabled>
  08:30
</button>
```

---

## 3. 유저 신청서 페이지 (`ReservationPage`)

### 3.1 페이지 구조

```
┌─────────────────────────────────────────────────────┐
│ HEADER  │ 장소 사용 신청                              │
├─────────────────────────────────────────────────────┤
│ TAB NAV │  [예약 신청]   내 예약 조회                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│   max-w-[600px]  mx-auto  px-4  py-6               │
│   ┌───────────────────────────────────────────┐     │
│   │  FORM CONTENT                             │     │
│   └───────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- 전체 배경: `bg-[#FEFAE0]`
- 헤더: `bg-white border-b border-[#E5E7EB]`
- 탭 네비게이션: `bg-white border-b border-[#E5E7EB]`
- 콘텐츠 최대 너비: `max-w-[600px]`

```html
<div class="min-h-screen bg-[#FEFAE0]">

  <!-- 헤더 -->
  <header class="bg-white border-b border-[#E5E7EB]">
    <div class="max-w-[600px] mx-auto px-4 py-5">
      <h1 class="text-xl font-bold text-black">장소 사용 신청</h1>
    </div>
  </header>

  <!-- 탭 네비게이션 -->
  <div class="bg-white border-b border-[#E5E7EB]">
    <div class="max-w-[600px] mx-auto px-4">
      <nav class="flex">
        <!-- 활성 탭 -->
        <button class="px-4 py-3 text-sm font-semibold border-b-2
                       border-[#008F49] text-[#008F49]">
          예약 신청
        </button>
        <!-- 비활성 탭 -->
        <button class="px-4 py-3 text-sm font-medium border-b-2
                       border-transparent text-gray-500 hover:text-[#008F49]
                       transition-colors duration-200">
          내 예약 조회
        </button>
      </nav>
    </div>
  </div>

  <!-- 콘텐츠 -->
  <main class="max-w-[600px] mx-auto px-4 py-6">
    <!-- 폼 또는 조회 영역 -->
  </main>

</div>
```

---

### 3.2 예약 신청 폼 (`ReservationForm`)

2컬럼 그리드를 적용하는 필드 쌍:
- **신청자 이름** + **연락처**
- **단체명** + **책임자 연락처**

나머지 필드(장소, 인원, 일시, 사용 목적)는 1컬럼 전체 너비.

```html
<form class="space-y-6">

  <!-- 2컬럼: 신청자 이름 + 연락처 -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-black">
        신청자 이름 <span class="text-[#DC2626]">*</span>
      </label>
      <input type="text" placeholder="홍길동"
        class="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base
               focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20
               transition-colors duration-200" />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-black">
        연락처 <span class="text-[#DC2626]">*</span>
      </label>
      <input type="tel" placeholder="010-0000-0000"
        class="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base
               focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20
               transition-colors duration-200" />
    </div>
  </div>

  <!-- 2컬럼: 단체명 + 책임자 연락처 -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-black">
        단체명 <span class="text-[#DC2626]">*</span>
      </label>
      <input type="text" placeholder="청년부"
        class="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base
               focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20
               transition-colors duration-200" />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-black">
        책임자 연락처 <span class="text-[#DC2626]">*</span>
      </label>
      <input type="tel" placeholder="010-0000-0000"
        class="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base
               focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20
               transition-colors duration-200" />
    </div>
  </div>

  <!-- 장소 선택 (SpaceSelector) -->
  <div class="flex flex-col gap-1">
    <p class="text-sm font-medium text-black">
      장소 <span class="text-[#DC2626]">*</span>
    </p>
    <!-- SpaceSelector 컴포넌트 삽입 위치 -->
  </div>

  <!-- 인원 -->
  <div class="flex flex-col gap-1">
    <label class="text-sm font-medium text-black">
      인원 <span class="text-[#DC2626]">*</span>
    </label>
    <select class="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base
                   focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20
                   transition-colors duration-200">
      <option value="">인원을 선택해주세요</option>
    </select>
  </div>

  <!-- 일시 (TimeSlotPicker) -->
  <div class="flex flex-col gap-1">
    <p class="text-sm font-medium text-black">
      일시 <span class="text-[#DC2626]">*</span>
    </p>
    <!-- TimeSlotPicker 컴포넌트 삽입 위치 -->
  </div>

  <!-- 사용 목적 -->
  <div class="flex flex-col gap-1">
    <label class="text-sm font-medium text-black">
      사용 목적 <span class="text-[#DC2626]">*</span>
    </label>
    <textarea rows="3" placeholder="예: 청년부 정기모임"
      class="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base resize-none
             focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20
             transition-colors duration-200">
    </textarea>
  </div>

  <!-- 에러 배너 -->
  <div class="rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 p-3 text-sm text-[#DC2626]">
    예약 신청 중 오류가 발생했습니다. 다시 시도해주세요.
  </div>

  <!-- 제출 버튼 -->
  <button type="submit"
    class="w-full rounded-xl bg-[#008F49] px-4 py-3 text-base font-bold text-white
           hover:bg-[#AAA014] active:bg-[#007A3D]
           disabled:bg-[#E5E7EB] disabled:cursor-not-allowed
           transition-colors duration-300">
    장소 사용 신청
  </button>

</form>
```

---

### 3.3 신청 결과 요약 (`ReservationSummary`)

신청 완료 후 표시되는 확인 카드.

```html
<div class="max-w-[600px] mx-auto p-4">

  <!-- 상태 배너 -->
  <!-- 확정 -->
  <div class="rounded-xl px-4 py-3 mb-6 text-center font-semibold text-base
              bg-[#008F49]/10 text-[#008F49] border border-[#008F49]/30">
    예약이 확정되었습니다
  </div>
  <!-- 거절 -->
  <div class="... bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30">
    시간 충돌로 예약이 거절되었습니다
  </div>

  <!-- 요약 카드 -->
  <div class="bg-white rounded-xl shadow-md border border-[#E5E7EB] overflow-hidden">
    <div class="px-6 py-5">
      <h2 class="text-lg font-bold text-black mb-4">신청 내용 요약</h2>
      <dl class="space-y-3">
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">신청 번호</dt>
          <dd class="text-sm font-medium text-black">42</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">신청자 이름</dt>
          <dd class="text-sm font-medium text-black">홍길동</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">단체명</dt>
          <dd class="text-sm font-medium text-black">청년부</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">공간</dt>
          <dd class="text-sm font-medium text-black">가나안홀 2층 에벤에셀홀</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">날짜·시간</dt>
          <dd class="text-sm font-medium text-black">2026년 4월 10일 (금) 14:00 ~ 16:00</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">인원</dt>
          <dd class="text-sm font-medium text-black">50명</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">사용 목적</dt>
          <dd class="text-sm font-medium text-black">청년부 정기모임</dd>
        </div>
      </dl>
    </div>
    <div class="px-6 pb-5">
      <button type="button"
        class="w-full rounded-xl bg-[#008F49] px-4 py-3 text-base font-bold text-white
               hover:bg-[#AAA014] transition-colors duration-300">
        새 신청하기
      </button>
    </div>
  </div>

</div>
```

> **포인트**: `dt` 레이블 컬러를 `text-[#BC8A5F]`(Accent)로 적용하여 데이터 레이블과 값 사이의 시각적 구분을 자연스럽게 구현.

---

### 3.4 내 예약 조회 (`LookupForm` + `ReservationTable`)

```html
<!-- 조회 폼 -->
<form class="space-y-4">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-black">이름</label>
      <input type="text" placeholder="신청자 이름"
        class="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base
               focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20
               transition-colors duration-200" />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-black">연락처</label>
      <input type="tel" placeholder="010-0000-0000"
        class="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base
               focus:outline-none focus:border-[#008F49] focus:ring-2 focus:ring-[#008F49]/20
               transition-colors duration-200" />
    </div>
  </div>
  <button type="submit"
    class="w-full rounded-xl bg-[#008F49] px-4 py-3 text-base font-bold text-white
           hover:bg-[#AAA014] transition-colors duration-300">
    예약 조회
  </button>
</form>

<!-- 조회 결과 - 모바일 카드 -->
<div class="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm space-y-2">
  <div class="flex items-center justify-between">
    <span class="text-xs text-[#BC8A5F]">No. 42</span>
    <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium
                 bg-[#008F49]/10 text-[#008F49] border border-[#008F49]/30">확정</span>
  </div>
  <div>
    <p class="text-sm font-medium text-black">가나안홀 2층 에벤에셀홀</p>
    <p class="text-sm text-gray-600 mt-0.5">2026년 4월 10일 (금) 14:00 ~ 16:00</p>
  </div>
  <div class="flex items-center gap-4 text-sm text-gray-600">
    <span>50명</span>
    <span class="truncate">청년부 정기모임</span>
  </div>
</div>
```

---

## 4. 어드민 전체 조회 페이지 (`AdminPage`)

### 4.1 페이지 구조

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER  │ 어드민 대시보드                      [로그아웃]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ CALENDAR HEADER ──────────────────────────────────────────┐ │
│  │  April                  2026          [◀]  [▶]             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─ CALENDAR GRID (7열 × 6행) ────────────────────────────────┐ │
│  │  일   월   화   수   목   금   토                           │ │
│  │  ┌───┬───┬───┬───┬───┬───┬───┐                            │ │
│  │  │   │   │   │ 1 │ 2 │ 3 │ 4 │  ← 약 145px 높이          │ │
│  │  │   │   │   │●칩│●칩│   │   │                            │ │
│  │  └───┴───┴───┴───┴───┴───┴───┘                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.2 전체 레이아웃 HTML

```html
<div class="min-h-screen bg-[#FEFAE0]">

  <!-- 헤더 -->
  <header class="bg-white border-b border-[#E5E7EB]">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-black">어드민 대시보드</h1>
      <button class="rounded-xl px-4 py-2 text-sm font-medium border-2 border-[#AAA014]
                     text-[#AAA014] hover:bg-[#AAA014] hover:text-white
                     transition-colors duration-200">
        로그아웃
      </button>
    </div>
  </header>

  <!-- 달력 영역 -->
  <main class="max-w-7xl mx-auto px-6 py-6">

    <!-- 달력 헤더 -->
    <div class="flex items-end justify-between mb-6">
      <div>
        <span class="block text-5xl font-black text-black leading-none">April</span>
        <span class="block text-xl font-normal text-[#BC8A5F] mt-1">2026</span>
      </div>
      <div class="flex gap-2">
        <!-- 이전 달 버튼 -->
        <button class="w-12 h-12 rounded-[14px] border-2 border-[#AAA014] text-[#AAA014]
                       flex items-center justify-center
                       hover:bg-[#AAA014] hover:text-white
                       transition-colors duration-200">
          ◀
        </button>
        <!-- 다음 달 버튼 -->
        <button class="w-12 h-12 rounded-[14px] border-2 border-[#AAA014] text-[#AAA014]
                       flex items-center justify-center
                       hover:bg-[#AAA014] hover:text-white
                       transition-colors duration-200">
          ▶
        </button>
      </div>
    </div>

    <!-- 달력 그리드 -->
    <div class="bg-white rounded-xl shadow-md border border-[#E5E7EB] overflow-hidden">

      <!-- 요일 헤더 -->
      <div class="grid grid-cols-7 border-b border-[#E5E7EB]">
        <div class="py-3 text-center text-sm font-semibold text-[#DC2626]">일</div>
        <div class="py-3 text-center text-sm font-semibold text-black">월</div>
        <div class="py-3 text-center text-sm font-semibold text-black">화</div>
        <div class="py-3 text-center text-sm font-semibold text-black">수</div>
        <div class="py-3 text-center text-sm font-semibold text-black">목</div>
        <div class="py-3 text-center text-sm font-semibold text-black">금</div>
        <div class="py-3 text-center text-sm font-semibold text-[#3B82F6]">토</div>
      </div>

      <!-- 날짜 셀 그리드 (6행) -->
      <div class="grid grid-cols-7 divide-x divide-y divide-[#E5E7EB]">

        <!-- 빈 셀 (이전 달) -->
        <div class="min-h-[145px] p-2 bg-[#FAFAF8]"></div>

        <!-- 일반 날짜 셀 -->
        <div class="min-h-[145px] p-2 flex flex-col gap-1.5">
          <span class="text-sm font-medium text-black self-start">1</span>
          <!-- 일정 칩 (최대 3개) -->
          <div class="event-chip">청년부 정기모임</div>
          <div class="event-chip">어린이부 예배</div>
          <!-- 4개 이상: more 배지 -->
          <span class="text-xs text-[#BC8A5F] font-medium pl-1">+ 2 more</span>
        </div>

        <!-- 오늘 날짜 셀 -->
        <div class="min-h-[145px] p-2 flex flex-col gap-1.5 bg-[#008F49]/5 ring-1 ring-inset ring-[#008F49]/30">
          <span class="text-sm font-bold text-[#008F49] self-start
                       w-7 h-7 flex items-center justify-center rounded-full
                       bg-[#008F49] text-white">
            3
          </span>
          <div class="event-chip">구역예배</div>
        </div>

      </div>
    </div>

  </main>
</div>
```

---

### 4.3 Event Chip (일정 칩)

```html
<!-- 일정 칩 -->
<div class="event-chip
            flex items-center gap-1.5
            px-2.5 py-1
            rounded-md
            bg-[#008F49]/10
            border-l-[3px] border-[#008F49]
            text-xs font-medium text-[#008F49]
            truncate
            cursor-pointer
            hover:bg-[#008F49]/20
            transition-colors duration-150">
  청년부 정기모임
</div>
```

```css
/* 순수 CSS */
.event-chip {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 6px;
  background: rgba(0, 143, 73, 0.1);
  border-left: 4px solid var(--color-primary);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.event-chip:hover {
  background: rgba(0, 143, 73, 0.2);
}
```

> **상태별 칩 색상**:
> - 대기(`pending`): `border-[#AAA014]`, `bg-[#AAA014]/10`, `text-[#AAA014]`
> - 확정(`confirmed`): `border-[#008F49]`, `bg-[#008F49]/10`, `text-[#008F49]`
> - 거절(`rejected`): `border-[#DC2626]`, `bg-[#DC2626]/10`, `text-[#DC2626]`
> - 취소(`cancelled`): `border-gray-400`, `bg-gray-100`, `text-gray-500`

---

### 4.4 Navigation Button

```css
/* 순수 CSS */
.nav-btn {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 2px solid var(--color-secondary); /* #AAA014 */
  background: transparent;
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.nav-btn:hover {
  background: var(--color-secondary);
  color: white;
}
```

---

### 4.5 예약 상세 모달 (드릴다운)

달력 칩 클릭 시 표시되는 예약 상세 오버레이.

```html
<!-- 모달 오버레이 -->
<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">

    <!-- 모달 헤더 -->
    <div class="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
      <h3 class="text-base font-bold text-black">예약 상세</h3>
      <button class="text-gray-400 hover:text-black transition-colors">✕</button>
    </div>

    <!-- 모달 본문 -->
    <div class="px-6 py-5">
      <dl class="space-y-3">
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">신청자</dt>
          <dd class="text-sm font-medium text-black">홍길동</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">단체명</dt>
          <dd class="text-sm font-medium text-black">청년부</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">공간</dt>
          <dd class="text-sm font-medium text-black">가나안홀 에벤에셀홀</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">일시</dt>
          <dd class="text-sm font-medium text-black">4월 10일 14:00 ~ 16:00</dd>
        </div>
        <div class="flex">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">인원</dt>
          <dd class="text-sm font-medium text-black">50명</dd>
        </div>
        <div class="flex items-center">
          <dt class="w-28 flex-shrink-0 text-sm text-[#BC8A5F]">상태</dt>
          <dd>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium
                         bg-[#AAA014]/10 text-[#AAA014] border border-[#AAA014]/30">
              대기
            </span>
          </dd>
        </div>
      </dl>
    </div>

    <!-- 모달 액션 -->
    <div class="px-6 pb-5 flex gap-3">
      <button class="flex-1 rounded-xl bg-[#008F49] py-2.5 text-sm font-bold text-white
                     hover:bg-[#007A3D] transition-colors duration-200">
        승인
      </button>
      <button class="flex-1 rounded-xl bg-[#DC2626] py-2.5 text-sm font-bold text-white
                     hover:bg-[#B91C1C] transition-colors duration-200">
        거절
      </button>
      <button class="flex-1 rounded-xl border-2 border-[#E5E7EB] py-2.5 text-sm font-medium
                     text-gray-600 hover:bg-gray-50 transition-colors duration-200">
        취소
      </button>
    </div>

  </div>
</div>
```

---

## 5. 반응형 분기점

| 분기점 | 적용 화면 |
|--------|----------|
| `< sm (640px)` | 단일 컬럼 폼, 카드 리스트 형태 조회 결과, 달력 셀 높이 축소 |
| `sm ~ md (640~768px)` | 2컬럼 그리드 폼 필드 표시 |
| `≥ md (768px)` | 달력 풀 그리드, 테이블 형태 조회 결과 |

```css
/* 달력 셀 반응형 */
.calendar-cell {
  min-height: 145px;
}
@media (max-width: 640px) {
  .calendar-cell {
    min-height: 80px;
  }
  .event-chip {
    display: none; /* 모바일에서는 점(dot) 인디케이터로 대체 */
  }
}
```

---

## 6. 컴포넌트 파일별 마이그레이션 체크리스트

| 파일 | 교체 대상 | 교체 후 |
|------|-----------|---------|
| `ApplicantFields.tsx` | `focus:ring-blue-400`, `border-red-400`, `bg-red-50` | `focus:ring-[#008F49]/20`, `border-[#DC2626]`, `bg-[#DC2626]/5` |
| `SpaceSelector.tsx` | `bg-blue-600`, `hover:bg-gray-200`, `border-blue-600 bg-blue-50` | `bg-[#008F49]`, `hover:bg-[#E5E7EB]`, `border-[#008F49] bg-[#008F49]/5` |
| `TimeSlotPicker.tsx` | `bg-blue-500`, `bg-blue-700`, `bg-blue-100 text-blue-700`, `focus:ring-blue-400` | `bg-[#008F49]`, `bg-[#007A3D]`, `bg-[#008F49]/10 text-[#008F49]`, `focus:ring-[#008F49]/20` |
| `ReservationForm.tsx` | `bg-blue-600`, `hover:bg-blue-700`, `disabled:bg-blue-300`, `focus:ring-blue-400` | `bg-[#008F49]`, `hover:bg-[#AAA014]`, `disabled:bg-[#E5E7EB]`, `focus:ring-[#008F49]/20` |
| `ReservationSummary.tsx` | `bg-green-100 text-green-800 border-green-300`, `bg-blue-600` | `bg-[#008F49]/10 text-[#008F49] border-[#008F49]/30`, `bg-[#008F49]` |
| `ReservationTable.tsx` | `bg-green-100 text-green-800`, `bg-yellow-100 text-yellow-800` | `bg-[#008F49]/10 text-[#008F49]`, `bg-[#AAA014]/10 text-[#AAA014]` |
| `LookupForm.tsx` | `focus:ring-blue-500`, `bg-blue-600`, `hover:bg-blue-700` | `focus:ring-[#008F49]/20`, `bg-[#008F49]`, `hover:bg-[#AAA014]` |
| `ReservationPage.tsx` | `border-blue-500 text-blue-600` | `border-[#008F49] text-[#008F49]` |
| 전체 페이지 배경 | `bg-gray-50` | `bg-[#FEFAE0]` |
