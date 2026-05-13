// ============================================================
// OPTION C — Warm Walnut
// Cozy editorial boutique. Cream + walnut + sage. Generous whitespace,
// editorial typography rhythm, single-page form flow.
// ============================================================

const C = {
  bg:        '#FAF6EE',
  bgDeep:    '#F2EBDB',
  surface:   '#FFFDF8',
  surface2:  '#F6F1E2',
  primary:   '#5C3F2C',           // walnut
  primaryDk: '#42301F',
  primary50: 'rgba(92,63,44,0.06)',
  accent:    '#3E6B4F',           // sage accent
  accentSft: '#D9E5DC',
  hi:        '#C7964D',           // amber highlight
  text:      '#231A12',
  textSft:   '#65564A',
  textMute:  '#A89B8A',
  border:    '#E8DEC8',
  borderSft: '#F0E9D6',
  danger:    '#A8442E',
  shadow:    '0 1px 2px rgba(60,40,20,0.04), 0 12px 32px rgba(60,40,20,0.06)',
  shadowLg:  '0 4px 8px rgba(60,40,20,0.04), 0 32px 80px rgba(60,40,20,0.10)',
};

const SERIF = `'Pretendard', 'Apple SD Gothic Neo', sans-serif`;

function CShell({ children, tab = '예약 신청', noContainer }) {
  return (
    <div style={{ width: '100%', height: '100%', background: C.bg, fontFamily: 'Pretendard', color: C.text, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 56px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${C.primary}`, display: 'grid', placeItems: 'center', color: C.primary }}>
                <Icon.Building width={15} height={15} />
              </div>
              <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 19, letterSpacing: '-0.025em', color: C.primary }}>가나안교회</span>
            </div>
            <div style={{ width: 1, height: 14, background: C.border }} />
            <span style={{ fontSize: 12, color: C.textSft, letterSpacing: '0.04em', fontWeight: 500 }}>공간 사용 신청 · KANAAN SPACE</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          {['예약 신청', '내 예약 조회'].map(t => (
            <div key={t} style={{
              fontSize: 13,
              fontWeight: t === tab ? 700 : 500,
              color: t === tab ? C.primary : C.textSft,
              letterSpacing: '-0.01em',
              position: 'relative',
              paddingBottom: 4,
              borderBottom: t === tab ? `2px solid ${C.primary}` : '2px solid transparent',
            }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {noContainer ? children : <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 56px 24px', height: '100%' }}>{children}</div>}
      </div>
    </div>
  );
}

function CStepInline({ current, steps }) {
  steps = steps || ['신청자 정보', '장소 선택', '인원 선택', '날짜·시간', '사용 목적'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      {steps.map((s, i) => {
        const done = i + 1 < current;
        const active = i + 1 === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: done ? C.primary : (active ? C.primary : 'transparent'),
                border: !done && !active ? `1.2px solid ${C.border}` : 'none',
                color: (done || active) ? '#fff' : C.textMute,
                display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
              }}>{done ? <Icon.Check width={11} height={11}/> : i + 1}</div>
              <div style={{ fontSize: 12, fontWeight: active ? 700 : (done ? 600 : 500), color: active ? C.text : (done ? C.text : C.textMute), letterSpacing: '-0.01em' }}>{s}</div>
            </div>
            {i < steps.length - 1 && <div style={{ flex: '0 0 28px', height: 1, background: done ? C.primary : C.border }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CBottomBar({ prev = '이전', next = '다음', primary = true }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px 56px', borderTop: `1px solid ${C.border}`, background: C.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 12 }}>
        {prev && <button style={{ flex: '0 0 140px', padding: '14px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', fontWeight: 600, fontSize: 13, color: C.textSft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon.ArrowLeft width={14} height={14}/> {prev}</button>}
        <div style={{ flex: 1 }} />
        <button style={{ flex: '0 0 220px', padding: '14px 22px', borderRadius: 999, border: 'none', background: primary ? C.primary : C.border, color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {next} <Icon.ArrowRight width={14} height={14}/>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 1 — Landing (editorial)
// ============================================================
function C_Landing() {
  return (
    <CShell>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 50, alignItems: 'center', height: '100%' }}>
        {/* Left text */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 22 }}>
            <div style={{ width: 24, height: 1, background: C.accent }} />
            EST. 2026 · ROOM RESERVATIONS
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 56, letterSpacing: '-0.04em', lineHeight: 1.05, margin: 0 }}>
            함께 모일 시간과<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: C.primary }}>공간</span>을<br />
            마련합니다.
          </h1>
          <p style={{ fontSize: 14, color: C.textSft, lineHeight: 1.7, marginTop: 24, maxWidth: 380 }}>
            본당, 가나안홀, 무지개홀의 모든 방을 한 화면에서 살펴보고
            5단계로 차근차근 신청하실 수 있어요. 부담 없이 시작해보세요.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, alignItems: 'center' }}>
            <button style={{ padding: '15px 26px', borderRadius: 999, border: 'none', background: C.primary, color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(92,63,44,0.22)' }}>
              지금 신청하기 <Icon.ArrowRight width={14} height={14} />
            </button>
            <a style={{ fontSize: 13, color: C.textSft, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 4 }}>내 예약 조회</a>
          </div>

          {/* Bottom stats - editorial style */}
          <div style={{ marginTop: 56, paddingTop: 22, borderTop: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {[
              { k: '24', l: '예약 가능한 공간', s: 'spaces' },
              { k: '90초', l: '평균 신청 소요', s: 'avg time' },
              { k: '2h', l: '확정 알림', s: 'response' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', color: C.primary }}>{s.k}</div>
                <div style={{ fontSize: 12, color: C.text, fontWeight: 600, marginTop: 2 }}>{s.l}</div>
                <div style={{ fontSize: 10, color: C.textMute, fontStyle: 'italic', marginTop: 1, letterSpacing: '0.05em' }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: featured room collage */}
        <div style={{ position: 'relative', height: 460 }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 280, height: 340, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadowLg }}>
            <RoomPhoto name="자람뜰홀" capacity="본당 1층 · 수용 50명" gradient="linear-gradient(140deg, #8B6F47 0%, #5C3F2C 100%)" icon={<Icon.Door width={20} height={20}/>} height={340} rounded={18} />
          </div>
          <div style={{ position: 'absolute', bottom: 20, left: 0, width: 220, height: 270, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadowLg, border: `6px solid ${C.bg}`, transform: 'rotate(-3deg)' }}>
            <RoomPhoto name="드림홀" capacity="본당 3층 · 수용 80명" gradient="linear-gradient(140deg, #4F6B53 0%, #2E4A35 100%)" icon={<Icon.Cap width={20} height={20}/>} height={270} rounded={12} />
          </div>
          <div style={{ position: 'absolute', top: 90, left: 110, padding: '12px 16px', background: C.surface, borderRadius: 14, boxShadow: C.shadow, display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${C.borderSft}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accentSft, display: 'grid', placeItems: 'center', color: C.accent }}><Icon.CheckCircle width={18} height={18}/></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em' }}>방금 확정되었어요</div>
              <div style={{ fontSize: 10, color: C.textMute, marginTop: 2 }}>사랑방 · 5월 16일 (토)</div>
            </div>
          </div>
          {/* small tag */}
          <div style={{ position: 'absolute', bottom: 84, right: -10, padding: '6px 14px', background: C.text, color: C.surface, borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
            FEATURED
          </div>
        </div>
      </div>
    </CShell>
  );
}

// ============================================================
// SCREEN 2 — Step 2: 장소 선택
// ============================================================
function C_PlaceSelect() {
  const rooms = [
    { name: '자람뜰홀', floor: '1F', cap: 50, selected: true, gradient: 'linear-gradient(140deg, #8B6F47 0%, #5C3F2C 100%)', icon: <Icon.Door width={18} height={18}/>, tags: ['프로젝터', '음향'], hot: true },
    { name: '사랑방',   floor: '1F', cap: 20, gradient: 'linear-gradient(140deg, #C9A77B 0%, #8B6F47 100%)', icon: <Icon.Heart width={18} height={18}/>, tags: ['좌식', '다과 가능'] },
    { name: '믿음방',   floor: '2F', cap: 30, gradient: 'linear-gradient(140deg, #4F6B53 0%, #2E4A35 100%)', icon: <Icon.Book width={18} height={18}/>, tags: ['테이블 6개'] },
    { name: '드림홀',   floor: '3F', cap: 80, gradient: 'linear-gradient(140deg, #6B5375 0%, #432C4C 100%)', icon: <Icon.Cap width={18} height={18}/>, tags: ['단상', '대형 행사'] },
  ];

  return (
    <CShell>
      <CStepInline current={2} />
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>STEP TWO</div>
        <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>어떤 공간이 좋으세요?</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: C.textSft }}>건물을 고르고 마음에 드는 공간을 선택해주세요.</p>
      </div>

      {/* Building selector — segmented tabs */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.border}`, marginBottom: 22, paddingBottom: 0 }}>
        {[
          { n: '본당',     count: 8,  active: true },
          { n: '가나안홀', count: 11, active: false },
          { n: '무지개홀', count: 5,  active: false },
        ].map((b, i) => (
          <div key={i} style={{
            padding: '12px 22px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: b.active ? `2.5px solid ${C.primary}` : '2.5px solid transparent',
            marginBottom: -1,
            cursor: 'pointer',
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: b.active ? 800 : 500, color: b.active ? C.primary : C.textSft, letterSpacing: '-0.02em' }}>{b.n}</span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: b.active ? C.primary : C.surface2, color: b.active ? '#fff' : C.textMute, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{b.count}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {/* Floor segmented */}
        <div style={{ display: 'flex', gap: 4, background: C.surface2, padding: 4, borderRadius: 999, marginBottom: 8 }}>
          {['1F','2F','3F'].map((f, i) => (
            <div key={f} style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: i === 0 ? C.surface : 'transparent',
              color: i === 0 ? C.primary : C.textMute,
              boxShadow: i === 0 ? '0 1px 2px rgba(60,40,20,0.06)' : 'none',
            }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Room grid — editorial cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
        {rooms.map((r, i) => (
          <div key={i} style={{
            background: C.surface,
            borderRadius: 18,
            border: r.selected ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
            overflow: 'hidden',
            display: 'flex',
            gap: 0,
            position: 'relative',
            boxShadow: r.selected ? '0 8px 24px rgba(92,63,44,0.14)' : C.shadow,
          }}>
            <div style={{ width: 160, flexShrink: 0 }}>
              <RoomPhoto name={r.name} capacity={`${r.cap}명`} gradient={r.gradient} icon={r.icon} height={170} rounded={0} />
            </div>
            <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.textMute, fontWeight: 700, letterSpacing: '0.08em' }}>본당 · {r.floor}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 2 }}>{r.name}</div>
                </div>
                {r.hot && <span style={{ padding: '3px 8px', background: C.hi + '22', color: '#8B5E1E', borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: '0.04em' }}>인기</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textSft, marginTop: 8, fontWeight: 600 }}>
                <Icon.Users width={11} height={11} /> 수용 {r.cap}명
                <span style={{ width: 2, height: 2, borderRadius: 999, background: C.textMute, margin: '0 2px' }} />
                <Icon.Clock width={11} height={11} /> 30분 단위
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
                {r.tags.map((t, ti) => (
                  <span key={ti} style={{ fontSize: 10, padding: '3px 9px', background: C.surface2, color: C.textSft, borderRadius: 999, fontWeight: 600 }}>· {t}</span>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontSize: 10, color: C.textMute, fontStyle: 'italic', fontWeight: 500 }}>이번 주 {r.hot ? 12 : Math.floor(Math.random() * 8) + 2}회 예약됨</span>
                <div style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: r.selected ? C.primary : 'transparent',
                  border: r.selected ? 'none' : `1px solid ${C.border}`,
                  color: r.selected ? '#fff' : C.textMute,
                  display: 'grid', placeItems: 'center',
                }}>{r.selected ? <Icon.Check width={14} height={14}/> : <Icon.Plus width={14} height={14}/>}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CBottomBar />
    </CShell>
  );
}

// ============================================================
// SCREEN 3 — Step 4: 날짜·시간
// Different layout: large month + day-row + ribbon heatmap
// ============================================================
function C_DateTime() {
  const days = [
    { d: 11, day: '월', busy: 25 }, { d: 12, day: '화', busy: 50 }, { d: 13, day: '수', busy: 70, today: true },
    { d: 14, day: '목', busy: 35 }, { d: 15, day: '금', busy: 65, sel: true }, { d: 16, day: '토', busy: 80 },
    { d: 17, day: '일', busy: 40 }, { d: 18, day: '월', busy: 60 }, { d: 19, day: '화', busy: 75 }, { d: 20, day: '수', busy: 88 },
  ];
  const slots = [];
  for (let h = 7; h < 22; h++) for (let m = 0; m < 60; m += 30) slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  const selStart = slots.indexOf('11:30'), selEnd = slots.indexOf('15:00');
  const booked = new Set(['07:30','17:00','17:30','20:00','20:30','21:00']);
  const partial = new Set(['08:30','10:00','15:30','19:00']);

  return (
    <CShell>
      <CStepInline current={4} />
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>STEP FOUR</div>
        <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>언제 사용하세요?</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: C.textSft }}>본당 1층 · 사랑방 · 100명 이상</p>
      </div>

      {/* Date strip */}
      <div style={{ background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`, padding: 18, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em' }}>May</span>
            <span style={{ fontSize: 13, color: C.textMute, fontWeight: 600 }}>2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon.ChevronLeft width={13} height={13}/></div>
            <span style={{ fontSize: 11, color: C.textSft, padding: '0 8px', fontWeight: 600 }}>이번 주</span>
            <div style={{ width: 28, height: 28, borderRadius: 999, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon.ChevronRight width={13} height={13}/></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8 }}>
          {days.map((d, i) => (
            <div key={i} style={{
              padding: '14px 6px',
              borderRadius: 12,
              background: d.sel ? C.primary : (d.today ? C.surface2 : 'transparent'),
              border: d.today && !d.sel ? `1.5px solid ${C.primary}` : (!d.sel ? `1px solid ${C.border}` : 'none'),
              color: d.sel ? '#fff' : C.text,
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: d.sel ? 0.75 : 0.6 }}>{d.day}</div>
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{d.d}</div>
              <div style={{ margin: '8px auto 0', width: 18, height: 3, borderRadius: 999, background: d.sel ? 'rgba(255,255,255,0.4)' : (d.busy > 75 ? C.danger : d.busy > 50 ? C.hi : C.accent), opacity: d.sel ? 0.7 : 0.7 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Time grid + summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 14 }}>
        <div style={{ background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' }}>5월 15일 (금) · 시간 선택</div>
              <div style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>드래그로 시간을 한 번에 선택해보세요</div>
            </div>
            <div style={{ padding: '6px 14px', background: C.primary50, border: `1px solid rgba(92,63,44,0.15)`, borderRadius: 999, fontSize: 12, fontWeight: 800, color: C.primary, fontVariantNumeric: 'tabular-nums' }}>
              11:30 — 15:00
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
            {slots.map((s, i) => {
              const isSel = i >= selStart && i <= selEnd;
              const isBooked = booked.has(s);
              const isPartial = partial.has(s);
              let bg = 'transparent', color = C.text, border = `1px solid ${C.border}`;
              if (isSel) { bg = C.primary; color = '#fff'; border = 'none'; }
              else if (isBooked) { bg = C.surface2; color = C.textMute; border = `1px solid ${C.borderSft}`; }
              else if (isPartial) { bg = C.hi + '15'; color = '#8B5E1E'; border = `1px solid ${C.hi}30`; }
              return (
                <div key={s} style={{
                  padding: '10px 0', borderRadius: 9, textAlign: 'center',
                  fontSize: 11, fontWeight: 700, background: bg, color, border,
                  fontVariantNumeric: 'tabular-nums',
                  textDecoration: isBooked ? 'line-through' : 'none',
                }}>{s}</div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 10, color: C.textMute, fontWeight: 600 }}>
            {[
              { c: C.primary, t: '선택' },
              { c: 'transparent', t: '여유', b: C.border },
              { c: C.hi + '22', t: '혼잡' },
              { c: C.surface2, t: '예약됨' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 11, height: 11, borderRadius: 3, background: l.c, border: l.b ? `1px solid ${l.b}` : 'none' }} /> {l.t}
              </div>
            ))}
          </div>
        </div>

        {/* Summary card */}
        <div style={{ background: C.text, color: C.surface, borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, color: C.hi, fontWeight: 700, letterSpacing: '0.10em', marginBottom: 14 }}>YOUR BOOKING</div>
          {[
            { l: '날짜', v: '2026.05.15 (금)' },
            { l: '시간', v: '11:30 — 15:00' },
            { l: '장소', v: '본당 1층 사랑방' },
            { l: '인원', v: '100명 이상' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.10)` : 'none' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{r.l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3, letterSpacing: '-0.01em' }}>{r.v}</div>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: 10 }}>
            <Icon.Clock width={14} height={14} style={{ color: C.hi }} />
            <div style={{ fontSize: 11 }}>총 <b>3시간 30분</b></div>
          </div>
        </div>
      </div>

      <CBottomBar />
    </CShell>
  );
}

// ============================================================
// SCREEN 4 — Confirmation
// ============================================================
function C_Confirm() {
  return (
    <CShell>
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 760, position: 'relative' }}>
          {/* decorative serif title */}
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: '0.16em', marginBottom: 10 }}>— LAST STEP —</div>
            <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: 40, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1 }}>
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>신청 내용을</span><br />
              확인해주세요
            </h1>
            <p style={{ margin: '12px 0 0', fontSize: 13, color: C.textSft }}>아래 내용으로 신청이 진행됩니다.</p>
          </div>

          {/* Ticket card */}
          <div style={{ background: C.surface, borderRadius: 22, padding: 0, boxShadow: C.shadowLg, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {/* Header band */}
            <div style={{ padding: '22px 32px', background: `linear-gradient(120deg, ${C.primary} 0%, ${C.primaryDk} 100%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 4 }}>RESERVATION · #62</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em' }}>본당 1층 · 사랑방</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600, letterSpacing: '0.08em' }}>일시</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>05.15 (금) · 11:30 — 14:00</div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 36px' }}>
              {[
                { l: '신청자', v: '염시온', s: '010-4775-2743' },
                { l: '단체',   v: '4교구 · 청구3', s: '담당 이성윤 전도사' },
                { l: '인원',   v: '20명', s: '소그룹 규모' },
                { l: '목적',   v: '소그룹 모임', s: '정기 모임' },
              ].map((r, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: C.textMute, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, letterSpacing: '-0.015em' }}>{r.v}</div>
                  <div style={{ fontSize: 12, color: C.textSft, marginTop: 2 }}>{r.s}</div>
                </div>
              ))}
            </div>

            {/* Perforation */}
            <div style={{ position: 'relative', height: 18, background: `radial-gradient(circle at 9px 9px, ${C.bg} 6px, transparent 7px) repeat-x`, backgroundSize: '18px 18px', borderTop: `1px dashed ${C.border}` }}>
              <div style={{ position: 'absolute', left: -9, top: 0, bottom: 0, width: 18, background: C.bg, borderRadius: '0 999px 999px 0' }} />
              <div style={{ position: 'absolute', right: -9, top: 0, bottom: 0, width: 18, background: C.bg, borderRadius: '999px 0 0 999px' }} />
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, fontSize: 11, color: C.textMute, lineHeight: 1.5 }}>
                신청 후 담당자 검토를 거쳐 약 <b style={{ color: C.text }}>2시간 내</b>로 확정 알림이 전송됩니다.
              </div>
              <button style={{ padding: '12px 18px', borderRadius: 999, border: `1px solid ${C.border}`, background: C.surface, fontSize: 13, fontWeight: 600, color: C.textSft }}>수정하기</button>
              <button style={{ padding: '12px 24px', borderRadius: 999, border: 'none', background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px rgba(92,63,44,0.25)' }}>
                <Icon.Check width={14} height={14}/> 신청 완료
              </button>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 30, right: -40, transform: 'rotate(8deg)', fontFamily: SERIF, fontSize: 14, fontStyle: 'italic', color: C.textMute, opacity: 0.7 }}>“ 곧 만나요 ”</div>
        </div>
      </div>
    </CShell>
  );
}

// ============================================================
// SCREEN 5 — My reservations
// ============================================================
function C_MyReservations() {
  const rows = [
    { id: 62, place: '가나안홀 -1층', room: '에벤에셀홀',  d: '16', mo: 'MAY', day: '토', t: '11:30 — 14:00', p: 20,  pp: '예배 / 기도회',  s: '확정' },
    { id: 95, place: '본당 1층',      room: '자람뜰홀',    d: '21', mo: 'MAY', day: '목', t: '10:30 — 13:30', p: 50,  pp: '성경 공부',      s: '확정' },
    { id: 61, place: '무지개홀 1층',  room: '그릿시내홀',  d: '28', mo: 'MAY', day: '목', t: '20:30 — 21:00', p: 100, pp: '행사 / 특별집회', s: '대기' },
    { id: 10, place: '가나안홀 3층',  room: '물댄동산방',  d: '19', mo: 'MAY', day: '화', t: '13:00 — 13:30', p: 10,  pp: '예배 / 기도회',  s: '취소' },
  ];

  const sty = (s) => ({
    확정: { bg: C.accentSft, color: C.accent, dot: C.accent },
    대기: { bg: C.hi + '20', color: '#8B5E1E', dot: C.hi },
    취소: { bg: C.surface2, color: C.textMute, dot: C.textMute },
  })[s];

  return (
    <CShell tab="내 예약 조회">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: '0.10em', marginBottom: 6 }}>YOUR RESERVATIONS</div>
          <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
            염시온 님,
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: C.primary }}> 예약 4건</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: C.textSft }}>가장 가까운 예약은 5월 16일 (토)예요.</p>
        </div>
        <button style={{ padding: '11px 18px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 12, fontWeight: 600, color: C.textSft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon.ArrowLeft width={13} height={13}/> 다시 조회
        </button>
      </div>

      {/* Card list — editorial row design */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((r, i) => {
          const st = sty(r.s);
          return (
            <div key={r.id} style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 0, display: 'flex', overflow: 'hidden' }}>
              {/* Big date block */}
              <div style={{ width: 100, padding: '20px 0', textAlign: 'center', background: r.s === '취소' ? C.surface2 : 'transparent', borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: '0.10em' }}>{r.mo}</div>
                <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 800, color: r.s === '취소' ? C.textMute : C.primary, letterSpacing: '-0.025em', lineHeight: 1, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{r.d}</div>
                <div style={{ fontSize: 11, color: C.textSft, fontWeight: 700, marginTop: 4 }}>{r.day}요일</div>
              </div>

              {/* Detail */}
              <div style={{ flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: st.bg, color: st.color, fontSize: 10, fontWeight: 800 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: st.dot }} />
                    {r.s}
                  </div>
                  <span style={{ fontSize: 10, color: C.textMute, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>예약 번호 #{r.id}</span>
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{r.room}</div>
                <div style={{ fontSize: 12, color: C.textSft, marginTop: 2 }}>{r.place}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11, color: C.textSft, fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.Clock width={11} height={11}/> {r.t}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.Users width={11} height={11}/> {r.p}명</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.Edit width={11} height={11}/> {r.pp}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ width: 200, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, borderLeft: `1px dashed ${C.border}` }}>
                <button style={{ padding: '9px 14px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 11, fontWeight: 700, color: r.s === '취소' ? C.textMute : C.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon.Download width={12} height={12}/> 티켓 다운로드
                </button>
                {r.s !== '취소' ? (
                  <button style={{ padding: '9px 14px', borderRadius: 999, border: `1px solid ${C.danger}30`, background: 'transparent', color: C.danger, fontSize: 11, fontWeight: 700 }}>예약 취소</button>
                ) : (
                  <button style={{ padding: '9px 14px', borderRadius: 999, border: `1px solid ${C.border}`, background: C.surface2, color: C.textMute, fontSize: 11, fontWeight: 600 }}>취소됨</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Past section divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28, marginBottom: 4 }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 11, color: C.textMute, fontWeight: 700, letterSpacing: '0.12em' }}>지난 예약 12건</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>
    </CShell>
  );
}

// ============================================================
// SCREEN 6 — Admin dashboard
// ============================================================
function C_Admin() {
  return (
    <div style={{ width: '100%', height: '100%', background: C.bg, fontFamily: 'Pretendard', color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Top */}
      <div style={{ padding: '20px 36px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${C.primary}`, display: 'grid', placeItems: 'center', color: C.primary }}><Icon.Building width={15} height={15}/></div>
          <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 17, color: C.primary, letterSpacing: '-0.025em' }}>가나안교회</span>
          <span style={{ fontSize: 11, color: C.textSft, fontWeight: 600, letterSpacing: '0.06em', marginLeft: 4 }}>· 관리자</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4, padding: 4, background: C.surface2, borderRadius: 999 }}>
          {['예약','팀','건물','공간'].map((t, i) => (
            <div key={t} style={{ padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: i === 0 ? C.surface : 'transparent', color: i === 0 ? C.primary : C.textSft }}>{t}</div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '8px 14px', borderRadius: 999, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 12, fontWeight: 600 }}>로그아웃</button>
      </div>

      <div style={{ flex: 1, padding: '24px 36px', overflow: 'hidden' }}>
        {/* Hero stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18, alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8 }}>2026 · MAY · WEEK 19</div>
            <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>
              이번 주, <span style={{ color: C.primary, fontStyle: 'italic', fontWeight: 400 }}>37건</span>의 모임이 있어요
            </h1>
            <div style={{ display: 'flex', gap: 36, marginTop: 18 }}>
              {[
                { l: '확정', v: '24', d: '65%' },
                { l: '대기', v: '8',  d: '검토 필요', hl: true },
                { l: '취소', v: '5' },
                { l: '가동률', v: '64%', d: '+5%' },
              ].map((k, i) => (
                <div key={i} style={{ paddingLeft: i > 0 ? 36 : 0, borderLeft: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 10, color: C.textMute, fontWeight: 700, letterSpacing: '0.06em' }}>{k.l}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', color: k.hl ? C.hi : C.text, marginTop: 4 }}>{k.v}</div>
                  {k.d && <div style={{ fontSize: 10, color: k.hl ? '#8B5E1E' : C.textSft, fontWeight: 600, marginTop: 2 }}>{k.d}</div>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={{ padding: '10px 16px', borderRadius: 999, border: `1px solid ${C.border}`, background: C.surface, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon.Settings width={13} height={13}/> 설정
            </button>
            <button style={{ padding: '10px 16px', borderRadius: 999, border: 'none', background: C.primary, color: '#fff', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon.Download width={13} height={13}/> CSV
            </button>
          </div>
        </div>

        {/* Main grid: heatmap calendar + side list */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
          <div style={{ background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>5월 활용 히트맵</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.textMute, fontWeight: 600 }}>
                  적음
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[0.15, 0.35, 0.55, 0.75, 1].map((o, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: `rgba(92,63,44,${o})` }} />)}
                  </div>
                  많음
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 999, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center' }}><Icon.ChevronLeft width={12} height={12}/></div>
                  <div style={{ width: 26, height: 26, borderRadius: 999, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center' }}><Icon.ChevronRight width={12} height={12}/></div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {['일','월','화','수','목','금','토'].map((d, i) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: i === 0 ? C.danger : C.textMute, paddingBottom: 4 }}>{d}</div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const d = i - 4;
                const valid = d > 0 && d <= 31;
                const isToday = d === 13;
                // density (simulate)
                const dens = { 1:0, 2:0.4, 7:0.2, 8:0.6, 13:0.5, 14:0.2, 15:0.5, 16:0.8, 17:0.3, 19:0.4, 21:0.5, 22:0.7, 28:0.9, 29:0.3, 30:0.2 }[d] || 0;
                const ev = { 13: 3, 16: 5, 21: 4, 22: 6, 28: 8 }[d];
                return (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: 10, padding: 6,
                    background: valid ? `rgba(92,63,44,${dens * 0.85 + (dens > 0 ? 0.05 : 0)})` : 'transparent',
                    color: dens > 0.5 ? '#fff' : C.text,
                    border: isToday ? `2px solid ${C.hi}` : (valid && dens === 0 ? `1px solid ${C.borderSft}` : 'none'),
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: isToday || dens > 0.5 ? 800 : 500, fontVariantNumeric: 'tabular-nums' }}>{valid ? d : ''}</div>
                    {ev && <div style={{ fontSize: 9, fontWeight: 800, alignSelf: 'flex-end' }}>{ev}건</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side: today + pending list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: C.text, color: C.surface, borderRadius: 18, padding: 22 }}>
              <div style={{ fontSize: 10, color: C.hi, fontWeight: 700, letterSpacing: '0.10em' }}>TODAY · WED</div>
              <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 6 }}>05월 13일</div>
              <div style={{ marginTop: 14, padding: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>오늘은 예약이 없어요</div>
                <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>한가한 하루를 보내세요 🌿</div>
              </div>
            </div>
            <div style={{ background: C.surface, borderRadius: 18, padding: 22, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>확정 대기</div>
                <span style={{ padding: '3px 9px', background: C.hi + '20', color: '#8B5E1E', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>8건</span>
              </div>
              {[
                { n: '염시온', dept: '주공15', place: '사랑방', t: '05.16 · 11:30' },
                { n: '김다윗', dept: '청년1',  place: '드림홀', t: '05.17 · 14:00' },
                { n: '이혜원', dept: '교회학교', place: '자람뜰홀', t: '05.18 · 19:00' },
                { n: '박지현', dept: '6교구',  place: '믿음방', t: '05.19 · 10:00' },
              ].map((p, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.borderSft}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.accentSft, color: C.accent, display: 'grid', placeItems: 'center', fontFamily: SERIF, fontWeight: 800, fontSize: 13 }}>{p.n[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.n} <span style={{ color: C.textMute, fontWeight: 500 }}>· {p.dept}</span></div>
                    <div style={{ fontSize: 10, color: C.textMute, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{p.place} · {p.t}</div>
                  </div>
                  <button style={{ padding: '5px 11px', borderRadius: 999, border: 'none', background: C.primary, color: '#fff', fontSize: 10, fontWeight: 800 }}>확정</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { C_Landing, C_PlaceSelect, C_DateTime, C_Confirm, C_MyReservations, C_Admin });
