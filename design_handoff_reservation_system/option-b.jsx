// ============================================================
// OPTION B — Toss Indigo
// Cool slate + deep indigo. Crisp, data-dense, financial-app premium.
// ============================================================

const B = {
  bg:        '#F4F6FA',
  surface:   '#FFFFFF',
  surface2:  '#F8FAFD',
  primary:   '#3B5BDB',
  primaryDk: '#2E47B5',
  primary50: '#EEF1FD',
  primary100:'#DCE2FB',
  accent:    '#FF8A3D',
  text:      '#0F172A',
  textSft:   '#475569',
  textMute:  '#94A3B8',
  border:    '#E2E8F0',
  borderSft: '#EEF2F7',
  success:   '#10B981',
  danger:    '#EF4444',
  warn:      '#F59E0B',
  shadow:    '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
  shadowLg:  '0 4px 6px rgba(15,23,42,0.04), 0 24px 64px rgba(15,23,42,0.10)',
};

function BShell({ children, tab = '예약 신청', noContainer }) {
  return (
    <div style={{ width: '100%', height: '100%', background: B.bg, fontFamily: 'Pretendard', color: B.text, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: B.surface, borderBottom: `1px solid ${B.borderSft}`, padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: B.primary, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <Icon.Building width={15} height={15} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.025em', color: B.text }}>가나안교회</span>
          <span style={{ fontSize: 12, color: B.textMute, marginLeft: 4, fontWeight: 500 }}>장소 예약</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { t: '예약 신청', active: true },
            { t: '내 예약', active: false },
            { t: '공간 둘러보기', active: false },
          ].map(t => (
            <div key={t.t} style={{
              padding: '12px 0',
              fontSize: 13,
              fontWeight: t.t === tab ? 700 : 500,
              color: t.t === tab ? B.text : B.textSft,
              borderBottom: t.t === tab ? `2px solid ${B.primary}` : '2px solid transparent',
              cursor: 'pointer',
            }}>{t.t}</div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 32, height: 32, borderRadius: 999, background: B.primary50, color: B.primary, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>염</div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {noContainer ? children : <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 32px 24px', height: '100%' }}>{children}</div>}
      </div>
    </div>
  );
}

// Sidebar-style step nav
function BStepNav({ current, steps }) {
  steps = steps || [
    { t: '신청자 정보', d: '이름·연락처·소속' },
    { t: '장소 선택',   d: '건물·층·공간' },
    { t: '인원 선택',   d: '예상 사용 인원' },
    { t: '날짜·시간',   d: '30분 단위' },
    { t: '사용 목적',   d: '모임 성격' },
  ];
  return (
    <aside style={{ width: 240, paddingRight: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: B.textMute, letterSpacing: '0.08em', marginBottom: 14 }}>BOOKING STEPS</div>
      {steps.map((s, i) => {
        const done = i + 1 < current;
        const active = i + 1 === current;
        return (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', position: 'relative' }}>
            {i < steps.length - 1 && <div style={{ position: 'absolute', left: 11, top: 32, bottom: -4, width: 2, background: done ? B.primary : B.border }} />}
            <div style={{
              width: 24, height: 24, borderRadius: 999, flexShrink: 0,
              background: done ? B.primary : (active ? B.surface : B.surface),
              color: done ? '#fff' : (active ? B.primary : B.textMute),
              border: active ? `2px solid ${B.primary}` : `1.5px solid ${done ? B.primary : B.border}`,
              display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, zIndex: 1,
            }}>
              {done ? <Icon.Check width={12} height={12} /> : (i + 1)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: active ? 700 : (done ? 600 : 500), color: active ? B.text : (done ? B.text : B.textMute), letterSpacing: '-0.01em' }}>{s.t}</div>
              <div style={{ fontSize: 11, color: B.textMute, marginTop: 1 }}>{s.d}</div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}

function BBottomBar({ prev = '이전', next = '다음 단계', primary = true }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 32px', background: B.surface, borderTop: `1px solid ${B.borderSft}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', gap: 10 }}>
        {prev && <button style={{ flex: '0 0 140px', padding: '14px', borderRadius: 12, border: `1px solid ${B.border}`, background: B.surface, fontWeight: 600, fontSize: 14, color: B.text }}>{prev}</button>}
        <div style={{ flex: 1 }} />
        <button style={{ flex: '0 0 220px', padding: '14px 22px', borderRadius: 12, border: 'none', background: primary ? B.primary : B.border, color: '#fff', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          {next} <Icon.ArrowRight width={15} height={15} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN 1 — Landing
// ============================================================
function B_Landing() {
  return (
    <BShell>
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 40, alignItems: 'center', height: '100%' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', background: B.surface, color: B.primary, borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', border: `1px solid ${B.borderSft}`, marginBottom: 22 }}>
            <Icon.Sparkle width={12} height={12} /> NEW · 더 빠른 예약 흐름
          </div>
          <h1 style={{ margin: 0, fontSize: 52, fontWeight: 800, letterSpacing: '-0.038em', lineHeight: 1.1, color: B.text }}>
            교회 공간 예약을<br />
            <span style={{ background: `linear-gradient(135deg, ${B.primary}, #6E8AFA)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>1분 만에</span>
          </h1>
          <p style={{ fontSize: 15, color: B.textSft, marginTop: 20, lineHeight: 1.6, maxWidth: 460 }}>
            본당·가나안홀·무지개홀의 24개 공간을, 5단계의 직관적인 흐름으로 누구나 손쉽게 신청할 수 있습니다.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
            <button style={{ padding: '14px 22px', borderRadius: 12, border: 'none', background: B.primary, color: '#fff', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px rgba(59,91,219,0.30)', cursor: 'pointer' }}>
              예약 시작하기 <Icon.ArrowRight width={15} height={15} />
            </button>
            <button style={{ padding: '14px 20px', borderRadius: 12, border: `1px solid ${B.border}`, background: B.surface, color: B.text, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              내 예약 조회
            </button>
          </div>
          {/* Live signal row */}
          <div style={{ marginTop: 36, padding: 16, background: B.surface, borderRadius: 14, border: `1px solid ${B.borderSft}`, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, background: B.success + '18', display: 'grid', placeItems: 'center', color: B.success }}>
              <Icon.Sparkle width={18} height={18} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 999, background: B.success, border: `2px solid ${B.surface}` }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>지금 14개 공간이 예약 가능해요</div>
              <div style={{ fontSize: 11, color: B.textMute, marginTop: 1 }}>오늘 5월 13일 (수) 기준 · 자정 자동 갱신</div>
            </div>
            <div style={{ fontSize: 11, color: B.textMute, fontVariantNumeric: 'tabular-nums' }}>LIVE</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Floating cards collage */}
          <div style={{ background: B.surface, borderRadius: 18, padding: 22, boxShadow: B.shadowLg, border: `1px solid ${B.borderSft}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: B.textMute, fontWeight: 600 }}>오늘의 예약 현황</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 4 }}>14 / 24 공간</div>
              </div>
              <div style={{ padding: '5px 10px', background: B.success + '15', color: B.success, borderRadius: 999, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon.TrendUp width={11} height={11} /> 58% 사용
              </div>
            </div>
            {/* mini bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 60, marginBottom: 16 }}>
              {[28, 42, 35, 58, 64, 71, 48].map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v}%`, background: i === 4 ? B.primary : B.primary100, borderRadius: 4, position: 'relative' }}>
                  {i === 4 && <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: B.primary, fontVariantNumeric: 'tabular-nums' }}>14</div>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: B.textMute, fontVariantNumeric: 'tabular-nums', marginBottom: 20 }}>
              {['일','월','화','수','목','금','토'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: B.textMute, letterSpacing: '0.04em' }}>인기 공간</div>
              {[
                { name: '자람뜰홀', s: 12, p: 92 },
                { name: '드림홀',   s: 9,  p: 70 },
                { name: '에벤에셀홀', s: 7, p: 54 },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, width: 90 }}>{r.name}</div>
                  <div style={{ flex: 1, height: 6, background: B.borderSft, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${r.p}%`, height: '100%', background: B.primary, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: B.textSft, fontVariantNumeric: 'tabular-nums' }}>{r.s}회</div>
                </div>
              ))}
            </div>
          </div>
          {/* floating mini card */}
          <div style={{ position: 'absolute', top: -16, right: -16, padding: '10px 14px', background: B.text, color: '#fff', borderRadius: 12, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, boxShadow: B.shadowLg }}>
            <Icon.CheckCircle width={16} height={16} style={{ color: B.success }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>예약 확정됨</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>자람뜰홀 · 5월 21일</div>
            </div>
          </div>
        </div>
      </div>
    </BShell>
  );
}

// ============================================================
// SCREEN 2 — Step 2: 장소 선택
// ============================================================
function B_PlaceSelect() {
  const buildings = [
    { name: '본당',     count: 8, active: true,  icon: <Icon.Building width={18} height={18}/>, c: '#3B5BDB' },
    { name: '가나안홀', count: 11, active: false, icon: <Icon.Layers width={18} height={18}/>, c: '#0EA5E9' },
    { name: '무지개홀', count: 5, active: false, icon: <Icon.Door width={18} height={18}/>, c: '#8B5CF6' },
  ];
  const rooms = [
    { name: '자람뜰홀', floor: '1F', cap: 50, available: true, selected: true,  busy: 30, photo: 'linear-gradient(135deg, #4263EB 0%, #2E47B5 100%)', icon: <Icon.Door width={18} height={18}/>, badge: '인기' },
    { name: '사랑방',   floor: '1F', cap: 20, available: true, selected: false, busy: 65, photo: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)', icon: <Icon.Heart width={18} height={18}/> },
    { name: '믿음방',   floor: '2F', cap: 30, available: true, selected: false, busy: 12, photo: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)', icon: <Icon.Book width={18} height={18}/> },
    { name: '소망방',   floor: '2F', cap: 24, available: false, selected: false, busy: 95, photo: 'linear-gradient(135deg, #94A3B8 0%, #475569 100%)', icon: <Icon.Music width={18} height={18}/> },
    { name: '드림홀',   floor: '3F', cap: 80, available: true, selected: false, busy: 45, photo: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', icon: <Icon.Cap width={18} height={18}/>, badge: '대형' },
    { name: '카페',     floor: '1F', cap: 35, available: true, selected: false, busy: 22, photo: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)', icon: <Icon.Coffee width={18} height={18}/> },
  ];

  return (
    <BShell>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28, height: 'calc(100% - 60px)' }}>
        <BStepNav current={2} />
        <div style={{ overflow: 'hidden', paddingBottom: 60 }}>
          <div style={{ marginBottom: 18 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>어디서 모일까요?</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: B.textMute }}>건물과 공간을 선택해주세요. 회색은 해당 시간대 예약이 있어요.</p>
          </div>
          {/* Building pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {buildings.map((b, i) => (
              <div key={i} style={{
                flex: 1,
                padding: 14,
                borderRadius: 14,
                background: b.active ? B.text : B.surface,
                color: b.active ? '#fff' : B.text,
                border: b.active ? 'none' : `1px solid ${B.borderSft}`,
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: b.active ? 'rgba(255,255,255,0.12)' : b.c + '15', color: b.active ? '#fff' : b.c, display: 'grid', placeItems: 'center' }}>{b.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>{b.name}</div>
                  <div style={{ fontSize: 11, opacity: b.active ? 0.7 : 1, color: b.active ? '#fff' : B.textMute, marginTop: 1 }}>{b.count}개 공간</div>
                </div>
                {b.active && <Icon.Check width={16} height={16} />}
              </div>
            ))}
          </div>
          {/* Floor tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: B.textMute, fontWeight: 600, marginRight: 4 }}>층</span>
            {['전체','1층','2층','3층'].map((f, i) => (
              <div key={f} style={{
                padding: '6px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: i === 1 ? B.primary50 : B.surface,
                color: i === 1 ? B.primary : B.textSft,
                border: `1px solid ${i === 1 ? 'transparent' : B.borderSft}`,
              }}>{f}</div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 11, color: B.textMute, fontWeight: 500 }}>총 6개 공간</div>
          </div>
          {/* Room grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {rooms.map((r, i) => {
              const dim = !r.available;
              return (
                <div key={i} style={{
                  background: B.surface,
                  borderRadius: 14,
                  border: r.selected ? `2px solid ${B.primary}` : `1px solid ${B.borderSft}`,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: r.selected ? '0 8px 24px rgba(59,91,219,0.18)' : 'none',
                  opacity: dim ? 0.55 : 1,
                }}>
                  <RoomPhoto name={r.name} capacity={`수용 ${r.cap}명`} gradient={r.photo} icon={r.icon} height={120} rounded={0} />
                  {r.badge && <span style={{ position: 'absolute', top: 10, right: 10, padding: '3px 8px', background: 'rgba(255,255,255,0.92)', color: B.text, borderRadius: 999, fontSize: 10, fontWeight: 800 }}>{r.badge}</span>}
                  {r.selected && <div style={{ position: 'absolute', top: 10, left: 10, width: 24, height: 24, borderRadius: 999, background: B.primary, color: '#fff', display: 'grid', placeItems: 'center' }}><Icon.Check width={13} height={13} /></div>}
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.015em' }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: B.textMute, fontVariantNumeric: 'tabular-nums' }}>{r.floor} · {r.cap}명</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, background: B.borderSft, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${r.busy}%`, height: '100%', background: r.busy > 80 ? B.danger : (r.busy > 50 ? B.warn : B.success), borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 10, color: B.textMute, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>금주 {r.busy}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <BBottomBar />
    </BShell>
  );
}

// ============================================================
// SCREEN 3 — Step 4: 날짜·시간 (heatmap)
// ============================================================
function B_DateTime() {
  const slots = [];
  for (let h = 7; h < 22; h++) for (let m = 0; m < 60; m += 30) slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  const selStart = slots.indexOf('11:30'), selEnd = slots.indexOf('15:00');
  const booked = new Set(['07:30','08:00','17:00','17:30','20:00','20:30','21:00']);
  const partial = new Set(['08:30','10:00','10:30','15:30','19:00','19:30']);

  return (
    <BShell>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28, height: 'calc(100% - 60px)' }}>
        <BStepNav current={4} />
        <div style={{ overflow: 'hidden', paddingBottom: 60 }}>
          <div style={{ marginBottom: 18 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>언제 사용하실 건가요?</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: B.textMute }}>날짜를 고르고, 시간대를 드래그하면 한 번에 선택돼요.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 14 }}>
            {/* Calendar */}
            <div style={{ background: B.surface, borderRadius: 16, border: `1px solid ${B.borderSft}`, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>2026년 5월</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: B.surface2, display: 'grid', placeItems: 'center' }}><Icon.ChevronLeft width={13} height={13} /></div>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: B.surface2, display: 'grid', placeItems: 'center' }}><Icon.ChevronRight width={13} height={13} /></div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
                {['일','월','화','수','목','금','토'].map((d, i) => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: B.textMute, padding: '4px 0' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {Array.from({ length: 35 }).map((_, i) => {
                  const d = i - 4;
                  const valid = d > 0 && d <= 31;
                  const isSel = d === 15;
                  const isToday = d === 13;
                  // simulate availability
                  const busyMap = { 1:30, 2:80, 3:0, 4:20, 5:55, 6:40, 7:60, 8:90, 9:30, 10:0, 11:25, 12:50, 13:70, 14:35, 15:65, 16:80, 17:45, 18:60, 19:75, 20:90, 21:55, 22:88, 23:0, 24:30, 25:50, 26:45, 27:60, 28:75, 29:30, 30:50, 31:0 };
                  const busy = busyMap[d] || 0;
                  const col = i % 7;
                  return (
                    <div key={i} style={{
                      aspectRatio: '1',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 9,
                      background: isSel ? B.primary : 'transparent',
                      color: !valid ? 'transparent' : isSel ? '#fff' : (col === 0 ? B.danger : B.text),
                      position: 'relative',
                      cursor: valid ? 'pointer' : 'default',
                      border: isToday && !isSel ? `1.5px solid ${B.primary}` : 'none',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: isSel || isToday ? 800 : 500, fontVariantNumeric: 'tabular-nums' }}>{valid ? d : ''}</div>
                      {valid && !isSel && (
                        <div style={{ width: 16, height: 2, borderRadius: 1, background: busy === 0 ? '#E2E8F0' : (busy > 75 ? B.danger : (busy > 50 ? B.warn : B.success)), marginTop: 3 }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, padding: 12, background: B.primary50, borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: B.primary, fontWeight: 700, marginBottom: 2 }}>선택된 날짜</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: B.text, letterSpacing: '-0.02em' }}>5월 15일 (금)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, fontSize: 10, color: B.textMute, fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 3, background: B.success }} /> 여유</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 3, background: B.warn }} /> 보통</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 3, background: B.danger }} /> 혼잡</div>
              </div>
            </div>

            {/* Time grid */}
            <div style={{ background: B.surface, borderRadius: 16, border: `1px solid ${B.borderSft}`, padding: 20, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>시간 선택</div>
                  <div style={{ fontSize: 11, color: B.textMute, marginTop: 2 }}>본당 1층 사랑방 · 5월 15일 (금)</div>
                </div>
                <div style={{ padding: '8px 12px', background: B.text, color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
                  <Icon.Clock width={13} height={13} /> 11:30 — 15:00
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, flex: 1, alignContent: 'flex-start' }}>
                {slots.map((s, i) => {
                  const isSel = i >= selStart && i <= selEnd;
                  const isBooked = booked.has(s);
                  const isPartial = partial.has(s);
                  let bg = B.primary50, color = B.text;
                  if (isSel) { bg = B.primary; color = '#fff'; }
                  else if (isBooked) { bg = B.borderSft; color = B.textMute; }
                  else if (isPartial) { bg = B.warn + '22'; color = '#92400E'; }
                  return (
                    <div key={s} style={{
                      padding: '11px 0', borderRadius: 9, textAlign: 'center',
                      fontSize: 12, fontWeight: isSel ? 800 : 700, background: bg, color,
                      fontVariantNumeric: 'tabular-nums',
                      textDecoration: isBooked ? 'line-through' : 'none',
                      border: isSel ? 'none' : `1px solid ${isBooked ? 'transparent' : 'rgba(59,91,219,0.06)'}`,
                    }}>{s}</div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 11, color: B.textMute, fontWeight: 500 }}>
                {[
                  { c: B.primary, t: '선택' },
                  { c: B.primary50, t: '가능' },
                  { c: B.warn + '40', t: '인접 예약' },
                  { c: B.borderSft, t: '예약됨' },
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 11, height: 11, borderRadius: 3, background: l.c }} /> {l.t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BBottomBar />
    </BShell>
  );
}

// ============================================================
// SCREEN 4 — Confirmation
// ============================================================
function B_Confirm() {
  return (
    <BShell>
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 920 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 18, background: B.primary50, color: B.primary, display: 'grid', placeItems: 'center' }}>
              <Icon.CheckCircle width={32} height={32} />
            </div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>마지막으로 확인해주세요</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: B.textMute }}>신청 후 담당자가 검토하면 약 2시간 안에 확정 알림을 보내드려요.</p>
          </div>

          {/* Two-column summary */}
          <div style={{ background: B.surface, borderRadius: 20, border: `1px solid ${B.borderSft}`, padding: 4, boxShadow: B.shadow }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {[
                { label: '신청자', value: '염시온', sub: '010-4775-2743', icon: <Icon.User /> },
                { label: '소속',   value: '4교구 · 청구3', sub: '담당 이성윤 전도사', icon: <Icon.Users /> },
                { label: '장소',   value: '본당 1층', sub: '사랑방 · 수용 20명', icon: <Icon.MapPin /> },
                { label: '일시',   value: '2026.05.15 (금)', sub: '11:30 — 14:00 · 2h 30m', icon: <Icon.Calendar /> },
                { label: '인원',   value: '20명', sub: '소그룹 규모', icon: <Icon.Users /> },
                { label: '사용 목적', value: '소그룹 모임', sub: '정기 모임', icon: <Icon.Edit /> },
              ].map((r, i) => (
                <div key={i} style={{ padding: 22, borderRight: i % 2 === 0 ? `1px solid ${B.borderSft}` : 'none', borderBottom: i < 4 ? `1px solid ${B.borderSft}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: B.primary50, color: B.primary, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {React.cloneElement(r.icon, { width: 17, height: 17 })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: B.textMute, fontWeight: 700, letterSpacing: '0.02em' }}>{r.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, letterSpacing: '-0.015em' }}>{r.value}</div>
                    <div style={{ fontSize: 12, color: B.textSft, marginTop: 2 }}>{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button style={{ flex: '0 0 140px', padding: '15px', borderRadius: 12, border: `1px solid ${B.border}`, background: B.surface, fontWeight: 600, fontSize: 14 }}>수정하기</button>
            <button style={{ flex: 1, padding: '15px', borderRadius: 12, border: 'none', background: B.primary, color: '#fff', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 10px 24px rgba(59,91,219,0.28)' }}>
              <Icon.Check width={16} height={16} /> 신청 완료하기
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: B.textMute, marginTop: 14 }}>
            신청 시 <a style={{ color: B.primary, textDecoration: 'none', fontWeight: 600 }}>이용 약관</a>과 <a style={{ color: B.primary, textDecoration: 'none', fontWeight: 600 }}>공간 사용 규정</a>에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </BShell>
  );
}

// ============================================================
// SCREEN 5 — My reservations
// ============================================================
function B_MyReservations() {
  const rows = [
    { id: 62, place: '가나안홀', room: '에벤에셀홀 -1F',  date: '5.16', day: '토', time: '11:30 - 14:00', people: 20,  purpose: '예배 / 기도회', status: '확정', when: '오늘부터 3일 후' },
    { id: 95, place: '본당',     room: '자람뜰홀 1F',    date: '5.21', day: '목', time: '10:30 - 13:30', people: 50,  purpose: '성경 공부',     status: '확정', when: '오늘부터 8일 후' },
    { id: 61, place: '무지개홀', room: '그릿시내홀 1F',  date: '5.28', day: '목', time: '20:30 - 21:00', people: 100, purpose: '행사 / 특별집회', status: '대기', when: '오늘부터 15일 후' },
    { id: 10, place: '가나안홀', room: '물댄동산방 3F',  date: '5.19', day: '화', time: '13:00 - 13:30', people: 10,  purpose: '예배 / 기도회', status: '취소', when: '취소됨' },
  ];

  const sty = (s) => ({
    확정: { bg: B.success + '18', color: B.success },
    대기: { bg: B.warn + '20', color: '#92400E' },
    취소: { bg: B.borderSft, color: B.textMute },
  })[s];

  return (
    <BShell tab="내 예약">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>내 예약</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: B.textMute }}>염시온님의 예약 4건이 예정되어 있어요</p>
        </div>
        <button style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: B.primary, color: '#fff', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon.Plus width={14} height={14} /> 새 예약
        </button>
      </div>

      {/* Filters chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { t: '전체', n: 4, active: true },
          { t: '확정', n: 2 },
          { t: '대기', n: 1 },
          { t: '취소', n: 1 },
        ].map((f, i) => (
          <div key={i} style={{
            padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: f.active ? B.text : B.surface,
            color: f.active ? '#fff' : B.textSft,
            border: f.active ? 'none' : `1px solid ${B.borderSft}`,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {f.t}
            <span style={{ padding: '1px 6px', borderRadius: 999, background: f.active ? 'rgba(255,255,255,0.18)' : B.borderSft, fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{f.n}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '7px 13px', borderRadius: 999, background: B.surface, border: `1px solid ${B.borderSft}`, fontSize: 12, fontWeight: 600, color: B.textSft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon.Filter width={12} height={12} /> 정렬: 최근순
        </div>
      </div>

      {/* Card list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r, i) => (
          <div key={r.id} style={{ background: B.surface, borderRadius: 14, border: `1px solid ${B.borderSft}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Date block */}
            <div style={{ width: 64, textAlign: 'center', padding: '8px 0', background: B.surface2, borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: B.textMute, fontWeight: 700 }}>5월</div>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: B.text }}>{r.date.split('.')[1]}</div>
              <div style={{ fontSize: 10, color: r.day === '토' ? '#3870A0' : B.textMute, fontWeight: 700, marginTop: 2 }}>{r.day}</div>
            </div>
            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.015em' }}>{r.purpose}</div>
                <span style={{ ...sty(r.status), padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 800 }}>{r.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: B.textSft }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.MapPin width={12} height={12} /> {r.place} · {r.room}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.Clock width={12} height={12} /> {r.time}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.Users width={12} height={12} /> {r.people}명</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: B.textMute, fontWeight: 500, textAlign: 'right' }}>
              {r.when}
              <div style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>#{r.id}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid ${B.borderSft}`, background: B.surface, fontSize: 12, fontWeight: 600, color: r.status === '취소' ? B.textMute : B.text, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon.Download width={12} height={12} /> 티켓
              </button>
              {r.status !== '취소' && (
                <button style={{ padding: '8px 12px', borderRadius: 9, border: 'none', background: B.danger + '12', color: B.danger, fontSize: 12, fontWeight: 700 }}>취소</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </BShell>
  );
}

// ============================================================
// SCREEN 6 — Admin dashboard
// ============================================================
function B_Admin() {
  return (
    <div style={{ width: '100%', height: '100%', background: B.bg, fontFamily: 'Pretendard', color: B.text, display: 'flex' }}>
      {/* Side rail */}
      <aside style={{ width: 220, background: B.surface, borderRight: `1px solid ${B.borderSft}`, padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: B.primary, display: 'grid', placeItems: 'center', color: '#fff' }}><Icon.Building width={18} height={18}/></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.02em' }}>가나안교회</div>
            <div style={{ fontSize: 10, color: B.textMute, fontWeight: 600 }}>관리자 콘솔</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13 }}>
          {[
            { t: '예약 관리', i: <Icon.Calendar />, active: true, badge: 8 },
            { t: '팀',       i: <Icon.Users /> },
            { t: '건물',     i: <Icon.Building /> },
            { t: '공간',     i: <Icon.Door /> },
            { t: '통계',     i: <Icon.TrendUp /> },
            { t: '설정',     i: <Icon.Settings /> },
          ].map((m, i) => (
            <div key={i} style={{
              padding: '9px 12px', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 10,
              background: m.active ? B.primary50 : 'transparent', color: m.active ? B.primary : B.textSft, fontWeight: m.active ? 700 : 500,
            }}>
              {React.cloneElement(m.i, { width: 15, height: 15 })} <span style={{ flex: 1 }}>{m.t}</span>
              {m.badge && <span style={{ padding: '1px 7px', borderRadius: 999, background: B.danger, color: '#fff', fontSize: 10, fontWeight: 800 }}>{m.badge}</span>}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: 12, background: B.surface2, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 999, background: B.primary50, color: B.primary, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>관</div>
          <div style={{ flex: 1, fontSize: 11 }}>
            <div style={{ fontWeight: 700, color: B.text }}>관리자</div>
            <div style={{ color: B.textMute }}>admin</div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, padding: 24, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: B.textMute, fontWeight: 700, letterSpacing: '0.06em' }}>RESERVATIONS</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>예약 관리</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ padding: '8px 12px', background: B.surface, border: `1px solid ${B.borderSft}`, borderRadius: 9, fontSize: 12, color: B.textSft, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon.Search width={13} height={13} /> 이름·전화 검색
            </div>
            <button style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid ${B.borderSft}`, background: B.surface, fontSize: 12, fontWeight: 600 }}>설정</button>
            <button style={{ padding: '8px 12px', borderRadius: 9, border: 'none', background: B.text, color: '#fff', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon.Download width={12} height={12} /> CSV
            </button>
          </div>
        </div>

        {/* Top KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { l: '이번 주', v: '37', d: '+12%', c: B.primary, hl: true },
            { l: '확정',   v: '24', d: '65%',   c: B.success },
            { l: '대기',   v: '8',  d: '검토 필요', c: B.warn, urgent: true },
            { l: '취소',   v: '5',  d: '14%',     c: B.textMute },
            { l: '가동률', v: '64%', d: '+5%',     c: B.primary },
          ].map((k, i) => (
            <div key={i} style={{
              padding: 14, background: k.hl ? B.text : B.surface, borderRadius: 12,
              border: k.hl ? 'none' : `1px solid ${B.borderSft}`,
              color: k.hl ? '#fff' : B.text,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: k.hl ? 0.6 : 1, color: k.hl ? '#fff' : B.textMute, letterSpacing: '0.04em' }}>{k.l}</div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 6 }}>{k.v}</div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: k.urgent ? B.warn : (k.hl ? '#7AA0FF' : k.c) }}>
                {k.d}
              </div>
            </div>
          ))}
        </div>

        {/* Filter row + table */}
        <div style={{ background: B.surface, borderRadius: 14, border: `1px solid ${B.borderSft}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${B.borderSft}` }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {['전체','확정','대기','취소','거절'].map((s, i) => (
                <div key={s} style={{
                  padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                  background: i === 0 ? B.primary50 : 'transparent',
                  color: i === 0 ? B.primary : B.textSft,
                }}>{s}</div>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            {['장소 ▾','1주 이내 ▾','달력 / 리스트'].map((c, i) => (
              <div key={c} style={{ fontSize: 11, color: B.textSft, padding: '5px 10px', border: `1px solid ${B.borderSft}`, borderRadius: 7, fontWeight: 600 }}>{c}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '50px 70px 100px 1.2fr 1fr 80px 1fr 90px 110px', padding: '10px 18px', background: B.surface2, fontSize: 10, fontWeight: 800, color: B.textMute, letterSpacing: '0.06em' }}>
            <div></div><div>날짜</div><div>건물</div><div>장소</div><div>시간 / 이름</div><div>인원</div><div>목적</div><div>상태</div><div style={{ textAlign: 'right' }}>액션</div>
          </div>
          {[
            { c: B.primary, b: '가나안홀', r: '에벤에셀홀', d: '05.16', t: '11:30 - 14:00', n: '염시온', dept: '주공15', p: 20, pp: '예배 / 기도회', s: '확정', sc: B.success },
            { c: B.warn,    b: '본당',     r: '자람뜰홀',   d: '05.17', t: '14:00 - 16:00', n: '김다윗', dept: '청년1',  p: 35, pp: '성경 공부',     s: '대기', sc: B.warn },
            { c: B.primary, b: '무지개홀', r: '그릿시내홀', d: '05.18', t: '19:00 - 21:00', n: '이혜원', dept: '교회학교', p: 80, pp: '찬양 연습',     s: '확정', sc: B.success },
            { c: B.textMute, b: '가나안홀', r: '물댄동산방', d: '05.19', t: '13:00 - 13:30', n: '염시온', dept: '-',     p: 10, pp: '예배 / 기도회', s: '취소', sc: B.textMute },
            { c: B.warn,    b: '본당',     r: '사랑방',     d: '05.20', t: '10:00 - 12:00', n: '박지현', dept: '6교구',  p: 18, pp: '세미나 / 강의', s: '대기', sc: B.warn },
            { c: B.primary, b: '본당',     r: '드림홀',     d: '05.21', t: '20:00 - 22:00', n: '최한솔', dept: '청년부',  p: 60, pp: '행사 / 집회',   s: '확정', sc: B.success },
          ].map((r, i, arr) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 70px 100px 1.2fr 1fr 80px 1fr 90px 110px', padding: '12px 18px', alignItems: 'center', fontSize: 12, borderBottom: i < arr.length - 1 ? `1px solid ${B.borderSft}` : 'none' }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: r.c }} />
              <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.d}</div>
              <div>
                <span style={{ padding: '3px 8px', background: B.surface2, borderRadius: 5, fontSize: 11, fontWeight: 600, color: B.textSft }}>{r.b}</span>
              </div>
              <div style={{ fontWeight: 600 }}>{r.r}</div>
              <div>
                <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{r.t}</div>
                <div style={{ fontSize: 10, color: B.textMute }}>{r.n} · {r.dept}</div>
              </div>
              <div style={{ color: B.textSft, fontVariantNumeric: 'tabular-nums' }}>{r.p}명</div>
              <div style={{ color: B.textSft }}>{r.pp}</div>
              <div>
                <span style={{ background: r.sc + '18', color: r.sc, padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 800 }}>{r.s}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                <button style={{ padding: '4px 9px', borderRadius: 6, border: `1px solid ${B.borderSft}`, background: B.surface, fontSize: 10, fontWeight: 600 }}>상세</button>
                {r.s === '대기' && <button style={{ padding: '4px 9px', borderRadius: 6, border: 'none', background: B.primary, color: '#fff', fontSize: 10, fontWeight: 700 }}>확정</button>}
                {r.s === '확정' && <button style={{ padding: '4px 9px', borderRadius: 6, border: 'none', background: B.danger + '14', color: B.danger, fontSize: 10, fontWeight: 700 }}>취소</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { B_Landing, B_PlaceSelect, B_DateTime, B_Confirm, B_MyReservations, B_Admin });
