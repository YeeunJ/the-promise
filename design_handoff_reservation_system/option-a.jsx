// ============================================================
// OPTION A — Refined Sage
// Brand-respecting, premium ecclesiastical. Deep moss green + warm ivory + brass accent.
// ============================================================

const A = {
  bg:        '#F4F1E8',
  surface:   '#FFFFFF',
  surface2:  '#FBF9F2',
  primary:   '#1F5F4A',
  primaryDk: '#16493A',
  primary50: 'rgba(31,95,74,0.06)',
  primary100:'rgba(31,95,74,0.10)',
  accent:    '#B8956A',
  accentSft: '#E8D9BD',
  text:      '#161A18',
  textSft:   '#5B6360',
  textMute:  '#9AA29D',
  border:    '#E5E0D2',
  borderSft: '#F0EBDB',
  danger:    '#B84A3E',
  warn:      '#C68A3A',
  shadow:    '0 1px 2px rgba(20,30,25,0.04), 0 8px 28px rgba(20,30,25,0.05)',
  shadowLg:  '0 2px 4px rgba(20,30,25,0.04), 0 24px 64px rgba(20,30,25,0.08)',
};

function AShell({ children, tab = '예약 신청', noContainer }) {
  return (
    <div style={{ width: '100%', height: '100%', background: A.bg, fontFamily: 'Pretendard', color: A.text, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: A.surface, borderBottom: `1px solid ${A.borderSft}`, padding: '18px 40px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: A.primary, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <Icon.Building width={16} height={16} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: A.primary }}>가나안교회</span>
        </div>
        <div style={{ width: 1, height: 16, background: A.border }} />
        <span style={{ fontSize: 14, color: A.textSft, letterSpacing: '-0.01em' }}>장소 사용 신청</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4, padding: 4, background: A.bg, borderRadius: 999 }}>
          {['예약 신청', '내 예약 조회'].map(t => (
            <div key={t} style={{
              padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
              background: tab === t ? A.surface : 'transparent',
              color: tab === t ? A.primary : A.textSft,
              boxShadow: tab === t ? '0 1px 2px rgba(20,30,25,0.06)' : 'none',
            }}>{t}</div>
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {noContainer ? children : <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 40px 32px', height: '100%' }}>{children}</div>}
      </div>
    </div>
  );
}

// Step header — interactive chip nav + 취소 / 완료 buttons (always present)
function AStepHeader({ current = 1, submitReady = false, completed }) {
  const titles = ['신청자 정보', '장소 선택', '인원 선택', '날짜 및 시간', '사용 목적'];
  const chips  = ['신청자 정보 입력', '장소 선택', '사용 인원 입력', '날짜 및 시간 선택', '사용 목적 입력'];
  // when everything is filled (submitReady) all chips are marked complete
  completed = completed || Array.from({ length: chips.length }, (_, i) => submitReady || i + 1 < current);

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Title row + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em' }}>
          {titles[current - 1]}
        </h1>
        <span style={{ fontSize: 11, padding: '3px 10px', background: A.accentSft + 'aa', color: '#8C6428', borderRadius: 999, fontWeight: 800, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>
          {current} / {chips.length}
        </span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: A.danger, color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em', cursor: 'pointer', boxShadow: '0 2px 6px rgba(184,74,62,0.18)' }}>
          취소
        </button>
        <button style={{
          padding: '9px 22px', borderRadius: 10, border: 'none',
          background: submitReady ? A.primary : A.borderSft,
          color: submitReady ? '#fff' : A.textMute,
          fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em',
          cursor: submitReady ? 'pointer' : 'not-allowed',
          boxShadow: submitReady ? '0 4px 12px rgba(31,95,74,0.22)' : 'none',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          {submitReady && <Icon.Check width={14} height={14} />}
          완료
        </button>
      </div>

      {/* Clickable step chip nav */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        {chips.map((s, i) => {
          const isDone = completed[i];
          const isCurrent = i + 1 === current;
          const isFilled = isDone || isCurrent;
          return (
            <React.Fragment key={i}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 14px 7px 7px',
                borderRadius: 999,
                background: isCurrent ? A.primary : (isDone ? A.primary50 : 'transparent'),
                border: isCurrent ? 'none' : `1px solid ${isDone ? 'rgba(31,95,74,0.18)' : A.border}`,
                color: isCurrent ? '#fff' : (isDone ? A.primary : A.textMute),
                fontSize: 12,
                fontWeight: isCurrent ? 800 : 700,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                boxShadow: isCurrent ? '0 2px 8px rgba(31,95,74,0.22)' : 'none',
                transition: 'all 0.15s',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: isFilled ? (isCurrent ? 'rgba(255,255,255,0.20)' : A.primary) : A.surface,
                  color: isCurrent ? '#fff' : (isDone ? '#fff' : A.textMute),
                  border: !isFilled ? `1px solid ${A.border}` : 'none',
                  display: 'grid', placeItems: 'center',
                  fontSize: 11, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                }}>{isDone && !isCurrent ? <Icon.Check width={11} height={11}/> : i + 1}</span>
                {s}
              </div>
              {i < chips.length - 1 && <Icon.ChevronRight width={12} height={12} style={{ color: A.textMute, opacity: 0.5 }} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ABottomBar({ next = '다음', prev = '이전', primary = true }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px 40px', background: 'linear-gradient(to top, rgba(244,241,232,0.95), rgba(244,241,232,0))' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', gap: 12 }}>
        {prev && <button style={{ flex: next ? '0 0 200px' : 1, padding: '16px 24px', borderRadius: 14, border: `1px solid ${A.border}`, background: A.surface, fontWeight: 600, fontSize: 14, color: A.text, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon.ArrowLeft width={15} height={15}/>{prev}</button>}
        {next && (
          <button style={{ flex: 1, padding: '16px 24px', borderRadius: 14, border: 'none', background: primary ? A.primary : '#CFC7B0', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {next} <Icon.ArrowRight width={16} height={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// Sidebar showing applicant context (right column on later steps)
function ASummary({ items }) {
  return (
    <aside style={{ width: 280, padding: 24, background: A.surface, borderRadius: 18, border: `1px solid ${A.borderSft}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: A.accent, marginBottom: 14, textTransform: 'uppercase' }}>신청 현황</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((it, i) => (
          <div key={i}>
            <div style={{ fontSize: 11, color: A.textMute, marginBottom: 4, fontWeight: 500 }}>{it.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: A.text, letterSpacing: '-0.01em', lineHeight: 1.4 }}>{it.value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, padding: '12px 14px', background: A.surface2, borderRadius: 10, fontSize: 11, color: A.textSft, lineHeight: 1.5, display: 'flex', gap: 8 }}>
        <Icon.Sparkle width={14} height={14} style={{ flexShrink: 0, marginTop: 1, color: A.accent }} />
        <span>예약은 사용 일자 <b style={{ color: A.text }}>최소 3일 전</b>까지 신청해주세요.</span>
      </div>
    </aside>
  );
}

// ============================================================
// SCREEN 1 — Landing
// ============================================================
function A_Landing() {
  return (
    <AShell tab="예약 신청">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', height: '100%' }}>
        {/* Left: hero copy */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: A.primary100, color: A.primary, borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: A.primary }} /> ONLINE BOOKING
          </div>
          <h1 style={{ margin: 0, fontSize: 48, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.15 }}>
            교회 공간을<br />
            <span style={{ color: A.primary }}>5단계로 간편하게</span><br />
            예약하세요
          </h1>
          <p style={{ marginTop: 18, fontSize: 15, color: A.textSft, lineHeight: 1.6, maxWidth: 420 }}>
            본당·가나안홀·무지개홀의 23개 공간을 누구나 손쉽게 신청할 수 있도록 새롭게 단장했습니다.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button style={{ padding: '14px 24px', borderRadius: 12, border: 'none', background: A.primary, color: '#fff', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 8px 20px rgba(31,95,74,0.25)' }}>
              장소 사용 신청하기 <Icon.ArrowRight width={16} height={16} />
            </button>
            <button style={{ padding: '14px 22px', borderRadius: 12, border: `1px solid ${A.border}`, background: A.surface, color: A.text, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              내 예약 조회
            </button>
          </div>
          <div style={{ marginTop: 36, display: 'flex', gap: 28 }}>
            {[
              { k: '24', v: '예약 가능 공간' },
              { k: '평균 90초', v: '신청 소요시간' },
              { k: '약 2시간', v: '확정 알림' },
            ].map((s,i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: A.primary }}>{s.k}</div>
                <div style={{ fontSize: 11, color: A.textMute, marginTop: 2, fontWeight: 500 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: steps card */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -14, background: A.primary100, borderRadius: 28, transform: 'rotate(-1.2deg)' }} />
          <div style={{ position: 'relative', background: A.surface, borderRadius: 22, padding: 28, boxShadow: A.shadowLg, border: `1px solid ${A.borderSft}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: A.accent, marginBottom: 6 }}>5 STEPS</div>
                <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>신청 절차</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: A.primary, color: '#fff', display: 'grid', placeItems: 'center' }}>
                <Icon.Building width={22} height={22} />
              </div>
            </div>
            {[
              { n: 1, t: '신청자 정보 입력', d: '이름·연락처·소속 부서' },
              { n: 2, t: '장소 선택', d: '건물 → 층 → 공간 순' },
              { n: 3, t: '인원 선택', d: '예상 사용 인원' },
              { n: 4, t: '날짜·시간 선택', d: '30분 단위 시간대' },
              { n: 5, t: '사용 목적 입력', d: '예배·모임·세미나 등' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${A.borderSft}` }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: i === 0 ? A.primary : A.surface2, color: i === 0 ? '#fff' : A.textSft, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>{s.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{s.t}</div>
                  <div style={{ fontSize: 11, color: A.textMute, marginTop: 1 }}>{s.d}</div>
                </div>
                <Icon.ChevronRight width={14} height={14} style={{ color: A.textMute }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AShell>
  );
}

// ============================================================
// SCREEN 2 — Step 2: 장소 선택
// ============================================================
function A_PlaceSelect() {
  const rooms = [
    { name: '자람뜰홀', floor: '1F', cap: 50, selected: true, gradient: 'linear-gradient(135deg, #2D7A5F 0%, #1F5F4A 100%)', icon: <Icon.Door width={18} height={18} />, tags: ['프로젝터', '음향 시설', '의자 배치'], weekly: 12, hot: true },
    { name: '사랑방',   floor: '1F', cap: 20, gradient: 'linear-gradient(135deg, #C9A77B 0%, #A88555 100%)', icon: <Icon.Heart width={18} height={18} />, tags: ['좌식', '다과 가능', '아늑'], weekly: 7 },
    { name: '믿음방',   floor: '2F', cap: 30, gradient: 'linear-gradient(135deg, #4A6B8A 0%, #2F4D6B 100%)', icon: <Icon.Book width={18} height={18} />, tags: ['테이블 6개', '화이트보드'], weekly: 5 },
    { name: '드림홀',   floor: '3F', cap: 80, gradient: 'linear-gradient(135deg, #6E5B85 0%, #443561 100%)', icon: <Icon.Cap width={18} height={18} />, tags: ['단상', '대형 행사', '음향'], weekly: 9, hot: true },
  ];

  return (
    <AShell tab="예약 신청">
      <AStepHeader current={2} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div>
          {/* Building tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { name: '본당',   sub: '8 공간',  active: true },
              { name: '가나안홀', sub: '11 공간', active: false },
              { name: '무지개홀', sub: '5 공간',  active: false },
            ].map((b, i) => (
              <div key={i} style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: 14,
                background: b.active ? A.surface : 'transparent',
                border: b.active ? `1.5px solid ${A.primary}` : `1px solid ${A.border}`,
                position: 'relative',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: b.active ? A.primary : A.text }}>{b.name}</div>
                <div style={{ fontSize: 11, color: A.textMute, marginTop: 2, fontWeight: 500 }}>{b.sub}</div>
                {b.active && <div style={{ position: 'absolute', top: 12, right: 12, width: 6, height: 6, borderRadius: 999, background: A.primary }} />}
              </div>
            ))}
          </div>

          {/* Floor segmented + count */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 11, color: A.textMute, fontWeight: 700, letterSpacing: '0.06em', marginRight: 10 }}>층</span>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: A.surface, borderRadius: 999, border: `1px solid ${A.borderSft}` }}>
              {['전체','1F','2F','3F'].map((f, i) => (
                <div key={f} style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: i === 0 ? A.primary : 'transparent',
                  color: i === 0 ? '#fff' : A.textSft,
                  cursor: 'pointer',
                }}>{f}</div>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 11, color: A.textMute, fontWeight: 600 }}>총 {rooms.length}개 공간 · 가나다순</div>
          </div>

          {/* Room grid — horizontal info cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {rooms.map((r, i) => (
              <div key={i} style={{
                background: A.surface,
                borderRadius: 16,
                border: r.selected ? `2px solid ${A.primary}` : `1px solid ${A.borderSft}`,
                overflow: 'hidden',
                display: 'flex',
                position: 'relative',
                boxShadow: r.selected ? '0 4px 16px rgba(31,95,74,0.14)' : A.shadow,
              }}>
                {/* Image */}
                <div style={{ width: 130, flexShrink: 0, position: 'relative' }}>
                  <RoomPhoto name={r.name} capacity={null} gradient={r.gradient} icon={r.icon} height={185} rounded={0} />
                  {r.hot && <span style={{ position: 'absolute', top: 8, left: 8, padding: '3px 8px', background: 'rgba(255,255,255,0.95)', color: '#8C6428', borderRadius: 999, fontSize: 9, fontWeight: 800, letterSpacing: '0.04em' }}>인기</span>}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, color: A.textMute, fontWeight: 700, letterSpacing: '0.06em' }}>본당 · {r.floor}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 2 }}>{r.name}</div>
                    </div>
                    {r.selected ? (
                      <div style={{ width: 26, height: 26, borderRadius: 999, background: A.primary, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon.Check width={13} height={13} /></div>
                    ) : (
                      <div style={{ width: 26, height: 26, borderRadius: 999, border: `1px solid ${A.border}`, color: A.textMute, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon.Plus width={13} height={13} /></div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: A.textSft, marginTop: 7, fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.Users width={11} height={11} /> 수용 {r.cap}명</span>
                    <span style={{ width: 2, height: 2, borderRadius: 999, background: A.textMute }} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.Clock width={11} height={11} /> 30분 단위</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                    {r.tags.map((t, ti) => (
                      <span key={ti} style={{ fontSize: 10, padding: '3px 8px', background: A.surface2, color: A.textSft, borderRadius: 999, fontWeight: 600 }}>· {t}</span>
                    ))}
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${A.borderSft}` }}>
                    <span style={{ fontSize: 10, color: A.textMute, fontWeight: 600 }}>이번 주 <b style={{ color: A.primary, fontWeight: 800 }}>{r.weekly}회</b> 예약됨</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: A.textSft, fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: r.weekly > 10 ? A.warn : r.weekly > 6 ? A.accent : A.primary }} />
                      {r.weekly > 10 ? '혼잡' : r.weekly > 6 ? '보통' : '여유'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ASummary items={[
          { label: '신청자', value: '염시온 · 어와나 트렉' },
        ]} />
      </div>
      <ABottomBar />
    </AShell>
  );
}

// ============================================================
// SCREEN 3 — Step 4: 날짜·시간 (heatmap)
// ============================================================
function A_DateTime() {
  // generate 30min slots from 07:00 - 22:00
  const slots = [];
  for (let h = 7; h < 22; h++) for (let m = 0; m < 60; m += 30) slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  // selected range: 11:30 - 15:00
  const selStart = slots.indexOf('11:30'), selEnd = slots.indexOf('15:00');
  // booked (other reservations)
  const booked = new Set(['07:30','08:00','09:00','17:00','17:30','20:00','20:30','21:00']);

  // calendar
  const days = Array.from({ length: 35 }, (_, i) => i - 4); // start offset

  return (
    <AShell tab="예약 신청">
      <AStepHeader current={4} submitReady={true} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18 }}>
          {/* Calendar */}
          <div style={{ background: A.surface, borderRadius: 18, border: `1px solid ${A.borderSft}`, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: '0.06em' }}>MAY</div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>2026</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: A.surface2, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon.ChevronLeft width={14} height={14} /></div>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: A.surface2, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon.ChevronRight width={14} height={14} /></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
              {['일','월','화','수','목','금','토'].map((d, i) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? A.danger : (i === 6 ? '#3870A0' : A.textMute), padding: '6px 0' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {days.map((d, i) => {
                const day = d > 0 && d <= 31 ? d : null;
                const isToday = day === 13;
                const isSelected = day === 15;
                const col = i % 7;
                return (
                  <div key={i} style={{
                    aspectRatio: '1',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 13,
                    fontWeight: isSelected ? 800 : 500,
                    color: !day ? 'transparent' : isSelected ? '#fff' : (col === 0 ? A.danger : (col === 6 ? '#3870A0' : A.text)),
                    background: isSelected ? A.primary : (isToday ? A.primary100 : 'transparent'),
                    borderRadius: 8,
                    border: isToday && !isSelected ? `1.5px solid ${A.primary}` : 'none',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{day}</div>
                );
              })}
            </div>
            <div style={{ marginTop: 18, padding: '12px 14px', background: A.surface2, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, color: A.textMute, fontWeight: 600, marginBottom: 2 }}>선택한 날짜</div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>5월 15일 (금)</div>
              </div>
              <Icon.Calendar width={20} height={20} style={{ color: A.primary }} />
            </div>
          </div>

          {/* Time heatmap */}
          <div style={{ background: A.surface, borderRadius: 18, border: `1px solid ${A.borderSft}`, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>시간 선택</div>
                <div style={{ fontSize: 11, color: A.textMute, marginTop: 2 }}>시작과 종료를 차례로 선택하세요</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: A.primary100, borderRadius: 999, fontSize: 12, fontWeight: 700, color: A.primary }}>
                <Icon.Clock width={12} height={12} /> 11:30 — 15:00 · 3h 30m
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, margin: '14px 0', fontSize: 10, color: A.textMute, fontWeight: 500 }}>
              {[
                { c: A.primary, t: '선택' },
                { c: 'rgba(31,95,74,0.10)', t: '가능' },
                { c: '#E5E0D2', t: '예약됨' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: l.c }} /> {l.t}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, flex: 1, alignContent: 'start' }}>
              {slots.map((s, i) => {
                const isSel = i >= selStart && i <= selEnd;
                const isBooked = booked.has(s);
                let bg = 'rgba(31,95,74,0.10)';
                let color = A.text;
                if (isSel) { bg = A.primary; color = '#fff'; }
                else if (isBooked) { bg = A.borderSft; color = A.textMute; }
                return (
                  <div key={s} style={{
                    padding: '9px 0',
                    borderRadius: 7,
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: isSel ? 700 : 600,
                    background: bg,
                    color,
                    fontVariantNumeric: 'tabular-nums',
                    textDecoration: isBooked ? 'line-through' : 'none',
                    cursor: isBooked ? 'not-allowed' : 'pointer',
                  }}>{s}</div>
                );
              })}
            </div>
          </div>
        </div>
        <ASummary items={[
          { label: '신청자', value: '염시온 · 교회학교 초등2부' },
          { label: '장소', value: '본당 1층 사랑방' },
          { label: '인원', value: '100명 이상' },
        ]} />
      </div>
      <ABottomBar />
    </AShell>
  );
}

// ============================================================
// SCREEN 4 — Confirmation (신청 내용 확인)
// ============================================================
function A_Confirm() {
  return (
    <AShell tab="예약 신청">
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 32, height: '100%', alignItems: 'center' }}>
        {/* Left rail */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: A.primary100, color: A.primary, borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 18 }}>
            마지막 단계
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            아래 내용을<br />확인하고 신청해주세요
          </h1>
          <p style={{ fontSize: 14, color: A.textSft, marginTop: 14, lineHeight: 1.6 }}>
            신청 후 담당자 검토를 거쳐 <b style={{ color: A.text }}>약 2시간 내</b>로 확정 알림을 보내드립니다.
          </p>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { n: 1, t: '신청자 정보 입력', d: '염시온 · 010-4775-2743' },
              { n: 2, t: '장소', d: '본당 1층 사랑방' },
              { n: 3, t: '인원', d: '20명' },
              { n: 4, t: '날짜·시간', d: '5월 15일 (금) 11:30 — 14:00' },
              { n: 5, t: '사용 목적', d: '소그룹 모임' },
            ].map((s,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <div style={{ width: 18, height: 18, borderRadius: 999, background: A.primary, color: '#fff', display: 'grid', placeItems: 'center' }}><Icon.Check width={11} height={11} /></div>
                <span style={{ color: A.textMute }}>{s.t}</span>
                <span style={{ color: A.text, fontWeight: 500 }}>· {s.d}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Confirmation ticket */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -8, background: A.primary, borderRadius: 22, opacity: 0.04, transform: 'rotate(0.8deg)' }} />
          <div style={{ position: 'relative', background: A.surface, borderRadius: 20, boxShadow: A.shadowLg, overflow: 'hidden', border: `1px solid ${A.borderSft}` }}>
            <div style={{ background: A.primary, color: '#fff', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>RESERVATION SUMMARY</div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>신청 내용 확인</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center' }}>
                <Icon.Ticket width={22} height={22} />
              </div>
            </div>
            <div style={{ padding: 28 }}>
              {[
                { label: '신청자', value: '염시온', sub: '010-4775-2743', icon: <Icon.User width={16} height={16} /> },
                { label: '단체',   value: '4교구 · 청구3', sub: '담당 이성윤 전도사', icon: <Icon.Users width={16} height={16} /> },
                { label: '장소',   value: '본당 1층 사랑방', sub: '수용 인원 20명', icon: <Icon.MapPin width={16} height={16} /> },
                { label: '일시',   value: '2026.05.15 (금) 11:30 — 14:00', sub: '2시간 30분', icon: <Icon.Calendar width={16} height={16} /> },
                { label: '인원',   value: '20명', sub: '소그룹 규모', icon: <Icon.Users width={16} height={16} /> },
                { label: '목적',   value: '소그룹 모임', sub: '정기 모임', icon: <Icon.Edit width={16} height={16} /> },
              ].map((r, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i === arr.length - 1 ? 'none' : `1px dashed ${A.borderSft}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: A.surface2, color: A.primary, display: 'grid', placeItems: 'center' }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: A.textMute, marginBottom: 2, fontWeight: 500 }}>{r.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{r.value}</div>
                  </div>
                  <div style={{ fontSize: 11, color: A.textMute }}>{r.sub}</div>
                </div>
              ))}
            </div>
            {/* perforated edge */}
            <div style={{ height: 14, background: `radial-gradient(circle at 7px 7px, ${A.bg} 5px, transparent 6px) repeat-x`, backgroundSize: '14px 14px', borderTop: `1px dashed ${A.borderSft}` }} />
            <div style={{ padding: '18px 28px', display: 'flex', gap: 10 }}>
              <button style={{ flex: '0 0 130px', padding: '14px', borderRadius: 12, border: `1px solid ${A.border}`, background: A.surface, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>수정하기</button>
              <button style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: A.primary, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 16px rgba(31,95,74,0.25)' }}>
                신청하기 <Icon.Check width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AShell>
  );
}

// ============================================================
// SCREEN 5 — My reservations
// ============================================================
function A_MyReservations() {
  const upcoming = [
    { id: 62, place: '가나안홀 -1층',  room: '에벤에셀홀',  date: '05.16 (토)', time: '11:30 — 14:00', people: '20명', purpose: '예배 / 기도회', status: '확정' },
    { id: 10, place: '가나안홀 3층',  room: '물댄동산방',  date: '05.19 (화)', time: '13:00 — 13:30', people: '10명', purpose: '예배 / 기도회', status: '취소' },
    { id: 95, place: '본당 1층',       room: '자람뜰홀',    date: '05.21 (목)', time: '10:30 — 13:30', people: '50명', purpose: '성경 공부',     status: '확정' },
    { id: 61, place: '무지개홀 1층',   room: '그릿시내홀',  date: '05.28 (목)', time: '20:30 — 21:00', people: '100명', purpose: '행사 / 특별집회', status: '대기' },
  ];

  const statusStyle = (s) => ({
    확정: { bg: A.primary100, color: A.primary },
    대기: { bg: 'rgba(184,138,58,0.18)', color: '#8C6428' },
    취소: { bg: '#F0EBDB', color: A.textMute },
  })[s];

  return (
    <AShell tab="내 예약 조회">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em' }}>염시온님의 예약 내역</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: A.textMute }}>예정된 예약 4건 · 지난 예약 12건</p>
        </div>
        <button style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${A.border}`, background: A.surface, fontSize: 13, fontWeight: 600, color: A.text, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon.ArrowLeft width={14} height={14} /> 다시 조회
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { k: '4건', l: '예정', c: A.primary },
          { k: '2건', l: '확정', c: A.primary },
          { k: '1건', l: '대기', c: A.accent },
          { k: '1건', l: '취소', c: A.textMute },
        ].map((s, i) => (
          <div key={i} style={{ padding: '14px 18px', background: A.surface, borderRadius: 14, border: `1px solid ${A.borderSft}` }}>
            <div style={{ fontSize: 11, color: A.textMute, fontWeight: 600, marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: s.c }}>{s.k}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ background: A.surface, borderRadius: 16, border: `1px solid ${A.borderSft}`, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1.4fr 1.2fr 0.8fr 1.2fr 0.7fr 1fr', padding: '12px 22px', background: A.surface2, fontSize: 11, fontWeight: 700, color: A.textMute, letterSpacing: '0.04em', borderBottom: `1px solid ${A.borderSft}` }}>
          <div>번호</div><div>공간</div><div>날짜·시간</div><div>인원</div><div>사용 목적</div><div>상태</div><div style={{ textAlign: 'right' }}>액션</div>
        </div>
        {upcoming.map((r, i) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '60px 1.4fr 1.2fr 0.8fr 1.2fr 0.7fr 1fr', padding: '16px 22px', alignItems: 'center', borderBottom: `1px solid ${A.borderSft}`, fontSize: 13 }}>
            <div style={{ color: A.textMute, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>#{r.id}</div>
            <div>
              <div style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{r.place}</div>
              <div style={{ fontSize: 11, color: A.textMute, marginTop: 2 }}>{r.room}</div>
            </div>
            <div style={{ fontWeight: 600 }}>
              {r.date}
              <div style={{ fontSize: 11, color: A.textMute, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{r.time}</div>
            </div>
            <div style={{ color: A.textSft }}>{r.people}</div>
            <div style={{ color: A.textSft }}>{r.purpose}</div>
            <div>
              <span style={{ ...statusStyle(r.status), padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{r.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button style={{ padding: '7px 11px', borderRadius: 8, border: `1px solid ${A.border}`, background: A.surface, fontSize: 11, fontWeight: 600, color: r.status === '취소' ? A.textMute : A.text, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon.Download width={11} height={11} /> 티켓
              </button>
              <button style={{ padding: '7px 11px', borderRadius: 8, border: 'none', background: r.status === '취소' ? A.surface2 : 'rgba(184,74,62,0.10)', color: r.status === '취소' ? A.textMute : A.danger, fontSize: 11, fontWeight: 700 }}>
                취소
              </button>
            </div>
          </div>
        ))}

        {/* Past toggle */}
        <button style={{
          width: '100%', padding: '14px 22px', border: 'none',
          background: A.surface2, color: A.textSft,
          fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer', borderBottom: `1px solid ${A.borderSft}`,
          fontFamily: 'Pretendard',
        }}>
          <Icon.ChevronRight width={14} height={14} style={{ transform: 'rotate(90deg)', color: A.textMute }} />
          지난 내역 숨기기 · 12건
        </button>

        {/* Past entries (dimmed) */}
        {[
          { id: 60, place: '본당 3층',        room: '드림홀',     date: '05.08 (금)', time: '13:00 — 17:00', people: '200명', purpose: '테스트',         status: '확정' },
          { id: 25, place: '가나안홀 -1층',  room: '에벤에셀홀', date: '04.18 (토)', time: '18:30 — 19:00', people: '20명',  purpose: '세미나 / 강의',  status: '확정' },
          { id: 18, place: '본당 1층',        room: '사랑방',     date: '04.05 (일)', time: '10:00 — 11:30', people: '15명',  purpose: '예배 / 기도회', status: '확정' },
        ].map((r, i, arr) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '60px 1.4fr 1.2fr 0.8fr 1.2fr 0.7fr 1fr', padding: '14px 22px', alignItems: 'center', borderBottom: i < arr.length - 1 ? `1px solid ${A.borderSft}` : 'none', fontSize: 13, opacity: 0.55 }}>
            <div style={{ color: A.textMute, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>#{r.id}</div>
            <div>
              <div style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{r.place}</div>
              <div style={{ fontSize: 11, color: A.textMute, marginTop: 2 }}>{r.room}</div>
            </div>
            <div style={{ fontWeight: 600 }}>
              {r.date}
              <div style={{ fontSize: 11, color: A.textMute, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{r.time}</div>
            </div>
            <div style={{ color: A.textSft }}>{r.people}</div>
            <div style={{ color: A.textSft }}>{r.purpose}</div>
            <div>
              <span style={{ ...statusStyle(r.status), padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{r.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button style={{ padding: '7px 11px', borderRadius: 8, border: `1px solid ${A.borderSft}`, background: A.surface, fontSize: 11, fontWeight: 600, color: A.textMute, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon.Download width={11} height={11} /> 티켓
              </button>
            </div>
          </div>
        ))}
      </div>
    </AShell>
  );
}

// ============================================================
// SCREEN 6 — Admin dashboard
// ============================================================
function A_Admin() {
  return (
    <div style={{ width: '100%', height: '100%', background: A.bg, fontFamily: 'Pretendard', color: A.text, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: A.surface, borderBottom: `1px solid ${A.borderSft}`, padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: A.primary, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <Icon.Building width={16} height={16} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: A.primary }}>가나안교회</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: A.accent, padding: '3px 8px', background: A.accentSft + '88', borderRadius: 6 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 18 }}>
          {['예약','팀','건물','공간'].map((t, i) => (
            <div key={t} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: i === 0 ? A.primary : A.textSft,
              background: i === 0 ? A.primary100 : 'transparent',
            }}>{t}</div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: A.surface2, borderRadius: 8, fontSize: 12, color: A.textSft }}>
          <Icon.Search width={13} height={13} /> <span>예약 검색</span>
          <kbd style={{ fontSize: 10, padding: '2px 5px', background: A.surface, borderRadius: 4, color: A.textMute, border: `1px solid ${A.border}` }}>⌘K</kbd>
        </div>
        <button style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${A.border}`, background: A.surface, fontSize: 12, fontWeight: 600 }}>로그아웃</button>
      </div>

      <div style={{ flex: 1, padding: '28px 32px', overflow: 'hidden' }}>
        {/* Hero stats row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>예약 관리</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: A.textMute }}>2026년 5월 · 오늘 5월 13일 (수)</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View toggle — same position across admin views */}
            <div style={{ display: 'flex', gap: 3, padding: 3, background: A.surface, borderRadius: 9, border: `1px solid ${A.borderSft}` }}>
              {[
                { v: '달력', icon: <Icon.Calendar width={12} height={12}/>, active: true },
                { v: '리스트', icon: <Icon.Layers width={12} height={12}/>, active: false },
              ].map((v, i) => (
                <div key={v.v} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, background: v.active ? A.primary : 'transparent', color: v.active ? '#fff' : A.textSft, display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  {v.icon} {v.v}
                </div>
              ))}
            </div>
            <div style={{ width: 1, height: 22, background: A.borderSft }} />
            <button style={{ padding: '9px 14px', borderRadius: 9, border: `1px solid ${A.border}`, background: A.surface, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon.Settings width={13} height={13} /> 설정
            </button>
            <button style={{ padding: '9px 14px', borderRadius: 9, border: 'none', background: A.primary, color: '#fff', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon.Download width={13} height={13} /> CSV 내보내기
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '이번 주 예약', value: '37', delta: '+12%', icon: <Icon.Calendar width={18} height={18} />, c: A.primary },
            { label: '확정 대기', value: '8', delta: '검토 필요', icon: <Icon.Clock width={18} height={18} />, c: A.accent, urgent: true },
            { label: '공간 가동률', value: '64%', delta: '+5%', icon: <Icon.TrendUp width={18} height={18} />, c: A.primary },
            { label: '인기 공간', value: '자람뜰홀', delta: '12회 예약', icon: <Icon.Sparkle width={18} height={18} />, c: A.primary, isText: true },
          ].map((k, i) => (
            <div key={i} style={{ padding: 18, background: A.surface, borderRadius: 14, border: `1px solid ${A.borderSft}`, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: A.textMute, fontWeight: 600 }}>{k.label}</div>
                  <div style={{ fontSize: k.isText ? 18 : 28, fontWeight: 800, letterSpacing: '-0.02em', color: A.text, marginTop: 6 }}>{k.value}</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: A.primary100, color: k.c, display: 'grid', placeItems: 'center' }}>{k.icon}</div>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: k.urgent ? A.accent : A.primary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {!k.urgent && <Icon.TrendUp width={11} height={11} />}
                {k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Main: calendar + side panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
          <div style={{ background: A.surface, borderRadius: 16, border: `1px solid ${A.borderSft}`, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>5월</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: A.surface2, display: 'grid', placeItems: 'center' }}><Icon.ChevronLeft width={12} height={12} /></div>
                  <div style={{ padding: '4px 10px', borderRadius: 7, background: A.surface2, fontSize: 12, fontWeight: 600 }}>오늘</div>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: A.surface2, display: 'grid', placeItems: 'center' }}><Icon.ChevronRight width={12} height={12} /></div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: A.textMute, fontWeight: 600 }}>이벤트 7개 · 확정 5 · 대기 2</div>
            </div>
            {/* Day grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: A.borderSft, borderRadius: 10, overflow: 'hidden', border: `1px solid ${A.borderSft}` }}>
              {['일','월','화','수','목','금','토'].map((d, i) => (
                <div key={d} style={{ background: A.surface2, padding: '8px 10px', fontSize: 11, fontWeight: 700, color: i === 0 ? A.danger : (i === 6 ? '#3870A0' : A.textMute) }}>{d}</div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 4;
                const valid = day > 0 && day <= 31;
                const isToday = day === 13;
                const events = {
                  7: [{ t: '동백2 · 청년부', c: '#3870A0' }],
                  8: [{ t: '새터6 · 사랑방', c: A.accent }, { t: '13청 · 친교', c: A.primary }],
                  16:[{ t: '주공15 · 본당', c: A.primary }],
                  21:[{ t: '구성6 · 자람뜰', c: '#3870A0' }],
                  22:[{ t: '동백2 · 무지개', c: A.accent }, { t: '청년 · 본당', c: A.primary }],
                  28:[{ t: '특별집회 · 본당', c: A.danger }],
                }[day] || [];
                return (
                  <div key={i} style={{
                    background: A.surface, minHeight: 84, padding: 8, position: 'relative',
                    outline: isToday ? `2px solid ${A.primary}` : 'none', outlineOffset: -2, borderRadius: isToday ? 6 : 0,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: !valid ? A.textMute + '50' : (isToday ? A.primary : (i % 7 === 0 ? A.danger : (i % 7 === 6 ? '#3870A0' : A.text))), fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
                      {valid ? day : (day <= 0 ? 30 + day : day - 31)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {events.map((e, ei) => (
                        <div key={ei} style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: e.c + '22', color: e.c, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.t}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side: today + pending */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 18, background: A.surface, borderRadius: 14, border: `1px solid ${A.borderSft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' }}>2026.05.13 (수)</div>
                <span style={{ fontSize: 10, padding: '3px 8px', background: A.primary100, color: A.primary, borderRadius: 999, fontWeight: 700 }}>오늘</span>
              </div>
              <div style={{ padding: 28, textAlign: 'center', background: A.surface2, borderRadius: 10, color: A.textMute, fontSize: 12, fontWeight: 500 }}>
                예약이 없습니다
              </div>
            </div>
            <div style={{ padding: 18, background: A.surface, borderRadius: 14, border: `1px solid ${A.borderSft}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon.Clock width={14} height={14} style={{ color: A.accent }} /> 확정 대기 · 8건
              </div>
              {[
                { name: '염시온', place: '사랑방',   time: '05.16 11:30' },
                { name: '김다윗', place: '드림홀',   time: '05.17 14:00' },
                { name: '이혜원', place: '자람뜰홀', time: '05.18 19:00' },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${A.borderSft}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, background: A.accentSft, color: '#8C6428', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>{p.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name} · {p.place}</div>
                    <div style={{ fontSize: 10, color: A.textMute, fontVariantNumeric: 'tabular-nums' }}>{p.time}</div>
                  </div>
                  <button style={{ padding: '4px 9px', borderRadius: 6, border: 'none', background: A.primary, color: '#fff', fontSize: 10, fontWeight: 700 }}>확정</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { A_Landing, A_PlaceSelect, A_DateTime, A_Confirm, A_MyReservations, A_Admin });
