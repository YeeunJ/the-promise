// Additional screens for OPTION A — Refined Sage
// Step 1, 3, 5 · My-Reservation login · Reservation detail · Admin login/team/list

// ============================================================
// SCREEN — Step 1 · 신청자 정보 입력
// ============================================================
function A_Step1() {
  const departments = ['1교구','2교구','3교구','4교구','5교구','6교구','청년부','교회학교','어와나','기타'];
  const subgroups = ['퍼글스','커비단','스팍스','티엔티','저니','트렉'];

  return (
    <AShell tab="예약 신청">
      <AStepHeader current={1} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left column - basics */}
        <div style={{ background: A.surface, borderRadius: 18, border: `1px solid ${A.borderSft}`, padding: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: A.accent, textTransform: 'uppercase', marginBottom: 4 }}>BASIC INFO</div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>기본 정보</h2>
          <p style={{ margin: '4px 0 22px', fontSize: 12, color: A.textMute }}>예약 확정 알림을 받을 연락처를 입력해주세요</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: A.text, display: 'block', marginBottom: 8 }}>이름 <span style={{ color: A.danger }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: A.surface2, borderRadius: 12, border: `1.5px solid ${A.primary}`, gap: 10 }}>
                <Icon.User width={16} height={16} style={{ color: A.primary }} />
                <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontWeight: 600, color: A.text, letterSpacing: '-0.01em' }} defaultValue="염시온" />
                <Icon.Check width={16} height={16} style={{ color: A.primary }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: A.text, display: 'block', marginBottom: 8 }}>연락처 <span style={{ color: A.danger }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: A.surface, borderRadius: 12, border: `1px solid ${A.border}`, gap: 10 }}>
                <Icon.Phone width={16} height={16} style={{ color: A.textMute }} />
                <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontWeight: 600, color: A.text, fontVariantNumeric: 'tabular-nums' }} defaultValue="010-4775-2743" />
              </div>
              <div style={{ fontSize: 11, color: A.textMute, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon.CheckCircle width={11} height={11} style={{ color: A.primary }} /> 예약 확정 시 이 번호로 알림을 보내드려요
              </div>
            </div>
          </div>
        </div>

        {/* Right column - org */}
        <div style={{ background: A.surface, borderRadius: 18, border: `1px solid ${A.borderSft}`, padding: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: A.accent, textTransform: 'uppercase', marginBottom: 4 }}>ORGANIZATION</div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>소속 단체</h2>
          <p style={{ margin: '4px 0 22px', fontSize: 12, color: A.textMute }}>부서를 먼저 고르면 소그룹이 표시됩니다</p>

          {/* Dept chips */}
          <div style={{ fontSize: 12, fontWeight: 700, color: A.text, marginBottom: 8 }}>부서 선택</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
            {departments.map((d, i) => {
              const active = d === '어와나';
              return (
                <div key={d} style={{
                  padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: active ? A.primary : A.surface2,
                  color: active ? '#fff' : A.textSft,
                  border: active ? 'none' : `1px solid ${A.borderSft}`,
                  cursor: 'pointer',
                }}>{d}</div>
              );
            })}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: A.text, marginBottom: 8 }}>소그룹 선택</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {subgroups.map((s, i) => {
              const active = s === '트렉';
              return (
                <div key={s} style={{
                  padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: active ? A.primary : A.surface2,
                  color: active ? '#fff' : A.textSft,
                  border: active ? 'none' : `1px solid ${A.borderSft}`,
                }}>{s}</div>
              );
            })}
          </div>

          {/* Pastor card */}
          <div style={{ marginTop: 24, padding: '14px 16px', background: A.surface2, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: A.accentSft, color: '#8C6428', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>이</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: A.textMute, fontWeight: 600 }}>담당 교역자</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 1, letterSpacing: '-0.01em' }}>이성윤 전도사</div>
            </div>
            <div style={{ fontSize: 11, color: A.textSft, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>010-1090-2746</div>
          </div>
        </div>
      </div>
      <ABottomBar prev={null} />
    </AShell>
  );
}

// ============================================================
// SCREEN — Step 3 · 인원 선택
// ============================================================
function A_Step3() {
  const options = [
    { label: '~10명',   sub: '소그룹',         icon: <Icon.Users width={20} height={20}/> },
    { label: '~20명',   sub: '한 부서/팀',     icon: <Icon.Users width={20} height={20}/> },
    { label: '~30명',   sub: '두세 부서',     icon: <Icon.Users width={22} height={22}/> },
    { label: '~50명',   sub: '교구급',         icon: <Icon.Users width={22} height={22}/> },
    { label: '~100명',  sub: '교회학교 전체', icon: <Icon.Users width={24} height={24}/>, selected: true },
    { label: '100명 이상', sub: '대형 집회',   icon: <Icon.Users width={26} height={26}/> },
  ];
  return (
    <AShell tab="예약 신청">
      <AStepHeader current={3} submitReady={true} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div>
          <div style={{ marginBottom: 18, padding: '14px 18px', background: A.surface, borderRadius: 14, border: `1px solid ${A.borderSft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon.Sparkle width={16} height={16} style={{ color: A.accent }} />
            <div style={{ fontSize: 12, color: A.textSft, lineHeight: 1.5 }}>
              <b style={{ color: A.text }}>본당 1층 사랑방</b>의 권장 수용 인원은 <b style={{ color: A.primary }}>20명</b>입니다. 이를 초과하는 경우 큰 공간을 추천해드려요.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {options.map((o, i) => (
              <div key={o.label} style={{
                background: A.surface,
                borderRadius: 16,
                border: o.selected ? `2px solid ${A.primary}` : `1px solid ${A.borderSft}`,
                padding: '24px 20px',
                position: 'relative',
                boxShadow: o.selected ? '0 8px 24px rgba(31,95,74,0.12)' : 'none',
                cursor: 'pointer',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: o.selected ? A.primary : A.surface2, color: o.selected ? '#fff' : A.textSft, display: 'grid', placeItems: 'center', marginBottom: 14 }}>
                  {o.icon}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', color: o.selected ? A.primary : A.text }}>{o.label}</div>
                <div style={{ fontSize: 11, color: A.textMute, marginTop: 4, fontWeight: 500 }}>{o.sub}</div>
                {o.selected && <div style={{ position: 'absolute', top: 14, right: 14, width: 22, height: 22, borderRadius: 999, background: A.primary, color: '#fff', display: 'grid', placeItems: 'center' }}><Icon.Check width={12} height={12} /></div>}
              </div>
            ))}
          </div>
        </div>
        <ASummary items={[
          { label: '신청자', value: '염시온 · 어와나 트렉' },
          { label: '장소', value: '본당 1층 사랑방' },
        ]} />
      </div>
      <ABottomBar />
    </AShell>
  );
}

// ============================================================
// SCREEN — Step 5 · 사용 목적
// ============================================================
function A_Step5() {
  const purposes = [
    { label: '정기 모임',     icon: <Icon.Edit width={20} height={20}/> },
    { label: '예배 / 기도회', icon: <Icon.Heart width={20} height={20}/> },
    { label: '성경 공부',     icon: <Icon.Book width={20} height={20}/> },
    { label: '찬양 연습',     icon: <Icon.Music width={20} height={20}/> },
    { label: '세미나 / 강의', icon: <Icon.Cap width={20} height={20}/> },
    { label: '친교 / 식사',   icon: <Icon.Coffee width={20} height={20}/> },
    { label: '위원회 / 회의', icon: <Icon.Users width={20} height={20}/> },
    { label: '행사 / 특별 집회', icon: <Icon.Party width={20} height={20}/> },
    { label: '기타 (직접 입력)', icon: <Icon.Edit width={20} height={20}/>, selected: true },
  ];
  return (
    <AShell tab="예약 신청">
      <AStepHeader current={5} submitReady={true} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
            {purposes.map((p) => (
              <div key={p.label} style={{
                background: A.surface,
                borderRadius: 14,
                border: p.selected ? `2px solid ${A.primary}` : `1px solid ${A.borderSft}`,
                padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer',
                boxShadow: p.selected ? '0 4px 14px rgba(31,95,74,0.10)' : 'none',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: p.selected ? A.primary : A.surface2, color: p.selected ? '#fff' : A.primary, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{p.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', color: A.text }}>{p.label}</div>
                {p.selected && <Icon.Check width={14} height={14} style={{ marginLeft: 'auto', color: A.primary }} />}
              </div>
            ))}
          </div>

          {/* Custom textarea */}
          <div style={{ background: A.surface, borderRadius: 14, border: `1.5px solid ${A.primary}`, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: A.primary, letterSpacing: '0.06em', marginBottom: 8 }}>직접 입력</div>
            <textarea
              placeholder="모임의 목적을 자유롭게 적어주세요…"
              style={{ width: '100%', minHeight: 80, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Pretendard', fontSize: 14, color: A.text, resize: 'none' }}
              defaultValue=""
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 11, color: A.textMute }}>예: 5월 봄 야유회 사전 준비 모임</div>
              <div style={{ fontSize: 11, color: A.textMute, fontVariantNumeric: 'tabular-nums' }}>0 / 200</div>
            </div>
          </div>
        </div>
        <ASummary items={[
          { label: '신청자', value: '염시온 · 교회학교 초등2부' },
          { label: '장소', value: '본당 1층 사랑방' },
          { label: '인원', value: '100명 이상' },
          { label: '일시', value: '2026.05.15 (금)\n11:30 — 15:00' },
        ]} />
      </div>
      <ABottomBar next={null} />
    </AShell>
  );
}

// ============================================================
// SCREEN — 내 예약 조회 로그인
// ============================================================
function A_MyLogin() {
  return (
    <AShell tab="내 예약 조회">
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 440, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -14, background: A.primary100, borderRadius: 28, transform: 'rotate(-1.5deg)' }} />
          <div style={{ position: 'relative', background: A.surface, borderRadius: 22, padding: 36, border: `1px solid ${A.borderSft}`, boxShadow: A.shadowLg }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: A.primary100, color: A.primary, display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
              <Icon.Ticket width={26} height={26} />
            </div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>내 예약 조회</h1>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: A.textMute }}>예약 시 입력하신 이름과 연락처로 조회해주세요</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>이름</label>
                <input placeholder="신청자 이름" style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: `1px solid ${A.border}`, background: A.surface2, fontSize: 14, fontFamily: 'Pretendard', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>연락처</label>
                <input placeholder="010-0000-0000" style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: `1px solid ${A.border}`, background: A.surface2, fontSize: 14, fontFamily: 'Pretendard', fontVariantNumeric: 'tabular-nums', outline: 'none' }} />
              </div>
              <button style={{ marginTop: 8, padding: '15px', borderRadius: 12, border: 'none', background: A.primary, color: '#fff', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 20px rgba(31,95,74,0.25)' }}>
                <Icon.Search width={15} height={15} /> 예약 조회하기
              </button>
            </div>
            <div style={{ marginTop: 18, padding: '12px 14px', background: A.surface2, borderRadius: 10, fontSize: 11, color: A.textSft, display: 'flex', gap: 8 }}>
              <Icon.Sparkle width={13} height={13} style={{ color: A.accent, flexShrink: 0, marginTop: 1 }} />
              <span>입력하신 정보는 본인 예약 확인 외 어떤 용도로도 사용되지 않습니다.</span>
            </div>
          </div>
        </div>
      </div>
    </AShell>
  );
}

// ============================================================
// SCREEN — 예약 상세 모달
// ============================================================
function A_DetailModal() {
  return (
    <AShell tab="내 예약 조회" noContainer>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: 'rgba(20,30,25,0.40)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        {/* faded list behind */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.18, padding: '40px 60px' }}>
          <div style={{ height: 30, background: A.surface, borderRadius: 8, marginBottom: 12 }} />
          <div style={{ height: 60, background: A.surface, borderRadius: 12, marginBottom: 8 }} />
          <div style={{ height: 60, background: A.surface, borderRadius: 12, marginBottom: 8 }} />
          <div style={{ height: 60, background: A.surface, borderRadius: 12 }} />
        </div>
        <div style={{ position: 'relative', width: 520, background: A.surface, borderRadius: 20, boxShadow: A.shadowLg, overflow: 'hidden' }}>
          {/* Banner */}
          <div style={{ padding: '22px 28px', background: A.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>RESERVATION · #10</div>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>예약 상세</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.16)', fontSize: 11, fontWeight: 800 }}>취소됨</span>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon.X width={15} height={15} /></div>
            </div>
          </div>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: '0.08em', marginBottom: 8 }}>장소 및 일시</div>
            {[
              { l: '건물', v: '가나안홀' },
              { l: '공간', v: '물댄동산방' },
              { l: '층',   v: '3층' },
              { l: '일시', v: '2026.05.19 (화) 13:00 — 13:30' },
            ].map((r, i, arr) => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${A.borderSft}` : 'none' }}>
                <span style={{ fontSize: 12, color: A.textMute, fontWeight: 600 }}>{r.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: A.text, letterSpacing: '-0.01em' }}>{r.v}</span>
              </div>
            ))}

            <div style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: '0.08em', marginTop: 22, marginBottom: 8 }}>신청자 정보</div>
            {[
              { l: '이름',     v: '염시온' },
              { l: '연락처',   v: '010-4775-2743' },
              { l: '부서/팀', v: '-' },
              { l: '담당교역자', v: '이다윗 전도사' },
            ].map((r, i, arr) => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${A.borderSft}` : 'none' }}>
                <span style={{ fontSize: 12, color: A.textMute, fontWeight: 600 }}>{r.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: A.text, fontVariantNumeric: 'tabular-nums' }}>{r.v}</span>
              </div>
            ))}

            <div style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: '0.08em', marginTop: 22, marginBottom: 8 }}>예약 정보</div>
            {[
              { l: '인원', v: '10명' },
              { l: '목적', v: '예배 / 기도회' },
            ].map((r, i, arr) => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${A.borderSft}` : 'none' }}>
                <span style={{ fontSize: 12, color: A.textMute, fontWeight: 600 }}>{r.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: A.text }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px 28px', background: A.surface2, display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ padding: '10px 22px', borderRadius: 999, border: `1px solid ${A.border}`, background: A.surface, fontSize: 13, fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </div>
    </AShell>
  );
}

// ============================================================
// SCREEN — Admin login
// ============================================================
function A_AdminLogin() {
  return (
    <div style={{ width: '100%', height: '100%', background: A.bg, fontFamily: 'Pretendard', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* decorative circle */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: A.primary100, top: -120, left: -120 }} />
      <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: A.accentSft, opacity: 0.5, bottom: -90, right: -90 }} />
      <div style={{ position: 'relative', width: 420, background: A.surface, borderRadius: 22, padding: 40, boxShadow: A.shadowLg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: A.primary, display: 'grid', placeItems: 'center', color: '#fff' }}><Icon.Building width={17} height={17}/></div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: A.primary, letterSpacing: '-0.02em' }}>가나안교회</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: A.accent, letterSpacing: '0.08em', marginTop: 1 }}>ADMIN CONSOLE</div>
          </div>
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>관리자 로그인</h1>
        <p style={{ margin: '6px 0 24px', fontSize: 13, color: A.textMute }}>예약 관리에 접속하려면 로그인해주세요</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>아이디</label>
            <input placeholder="admin" style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: `1px solid ${A.border}`, background: A.surface2, fontSize: 14, fontFamily: 'Pretendard', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>비밀번호</label>
            <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '13px 16px', borderRadius: 11, border: `1px solid ${A.border}`, background: A.surface2, fontSize: 14, fontFamily: 'Pretendard', outline: 'none' }} />
          </div>
          <button style={{ marginTop: 6, padding: '15px', borderRadius: 12, border: 'none', background: A.primary, color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 8px 20px rgba(31,95,74,0.25)' }}>
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN — Admin · 팀 관리
// ============================================================
function A_AdminTeam() {
  const teams = [
    { team: '저니',   dept: '어와나',  pastor: '전소현 전도사',  phone: '010-4997-3417' },
    { team: '트렉',   dept: '어와나',  pastor: '이성윤 전도사',  phone: '010-1090-2746' },
    { team: '스팍스', dept: '어와나',  pastor: '양지나 전도사',  phone: '010-4185-7291' },
    { team: '커비단', dept: '어와나',  pastor: '김보미 전도사',  phone: '010-8461-7790' },
    { team: '티엔티', dept: '어와나',  pastor: '천지혜 전도사',  phone: '010-9099-7547' },
    { team: '퍼글스', dept: '어와나',  pastor: '한혜경 전도사',  phone: '010-8784-2193' },
    { team: '1청년부(디모데)', dept: '청년부', pastor: '전희철 목사', phone: '010-8043-6279' },
    { team: '2청년부(바울)',   dept: '청년부', pastor: '정재원 목사', phone: '010-8618-8238' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: A.bg, fontFamily: 'Pretendard', color: A.text, display: 'flex', flexDirection: 'column' }}>
      {/* Top */}
      <div style={{ background: A.surface, borderBottom: `1px solid ${A.borderSft}`, padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: A.primary, display: 'grid', placeItems: 'center', color: '#fff' }}><Icon.Building width={16} height={16}/></div>
          <span style={{ fontWeight: 800, fontSize: 16, color: A.primary, letterSpacing: '-0.02em' }}>가나안교회</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: A.accent, padding: '3px 8px', background: A.accentSft + '88', borderRadius: 6 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 18 }}>
          {['예약','팀','건물','공간'].map((t, i) => (
            <div key={t} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: i === 1 ? A.primary : A.textSft, background: i === 1 ? A.primary100 : 'transparent' }}>{t}</div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${A.border}`, background: A.surface, fontSize: 12, fontWeight: 600 }}>로그아웃</button>
      </div>

      <div style={{ flex: 1, padding: '28px 32px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>팀 관리</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: A.textMute }}>전체 217팀 · 부서별 담당교역자 확인</p>
          </div>
          <button style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: A.primary, color: '#fff', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 6px 16px rgba(31,95,74,0.25)' }}>
            <Icon.Plus width={14} height={14}/> 팀 추가
          </button>
        </div>

        {/* Dept filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[
            { t: '전체', n: 217, active: true },
            { t: '1교구', n: 28 },
            { t: '2교구', n: 24 },
            { t: '3교구', n: 22 },
            { t: '4교구', n: 26 },
            { t: '청년부', n: 6 },
            { t: '교회학교', n: 11 },
            { t: '어와나', n: 6, hot: true },
          ].map((f, i) => (
            <div key={f.t} style={{
              padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: f.active ? A.primary : (f.hot ? A.accentSft + '88' : A.surface),
              color: f.active ? '#fff' : (f.hot ? '#8C6428' : A.textSft),
              border: f.active ? 'none' : `1px solid ${A.borderSft}`,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {f.t}
              <span style={{ padding: '1px 6px', borderRadius: 999, background: f.active ? 'rgba(255,255,255,0.18)' : (f.hot ? 'rgba(140,100,40,0.18)' : A.surface2), fontSize: 10, fontWeight: 800 }}>{f.n}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: A.surface, borderRadius: 14, border: `1px solid ${A.borderSft}`, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.2fr 1fr 0.8fr', padding: '12px 22px', background: A.surface2, fontSize: 11, fontWeight: 700, color: A.textMute, letterSpacing: '0.04em' }}>
            <div>팀명</div><div>부서</div><div>담당 교역자</div><div>연락처</div><div style={{ textAlign: 'right' }}>관리</div>
          </div>
          {teams.map((t, i) => (
            <div key={t.team} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.2fr 1fr 0.8fr', padding: '14px 22px', alignItems: 'center', borderBottom: i < teams.length - 1 ? `1px solid ${A.borderSft}` : 'none', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: A.accentSft + '70', color: '#8C6428', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12 }}>{t.team[0]}</div>
                <div style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{t.team}</div>
              </div>
              <div>
                <span style={{ padding: '3px 8px', borderRadius: 6, background: A.surface2, fontSize: 11, fontWeight: 600, color: A.textSft }}>{t.dept}</span>
              </div>
              <div style={{ color: A.textSft, fontWeight: 500 }}>{t.pastor}</div>
              <div style={{ color: A.textSft, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{t.phone}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button style={{ padding: '5px 11px', borderRadius: 6, border: `1px solid ${A.border}`, background: A.surface, fontSize: 11, fontWeight: 600, color: A.primary }}>수정</button>
                <button style={{ padding: '5px 11px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 11, fontWeight: 600, color: A.danger }}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN — Admin · 예약 리스트 뷰 (with filters sidebar)
// ============================================================
function A_AdminList() {
  return (
    <div style={{ width: '100%', height: '100%', background: A.bg, fontFamily: 'Pretendard', color: A.text, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: A.surface, borderBottom: `1px solid ${A.borderSft}`, padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: A.primary, display: 'grid', placeItems: 'center', color: '#fff' }}><Icon.Building width={16} height={16}/></div>
          <span style={{ fontWeight: 800, fontSize: 16, color: A.primary, letterSpacing: '-0.02em' }}>가나안교회</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: A.accent, padding: '3px 8px', background: A.accentSft + '88', borderRadius: 6 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 18 }}>
          {['예약','팀','건물','공간'].map((t, i) => (
            <div key={t} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: i === 0 ? A.primary : A.textSft, background: i === 0 ? A.primary100 : 'transparent' }}>{t}</div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${A.border}`, background: A.surface, fontSize: 12, fontWeight: 600 }}>로그아웃</button>
      </div>

      <div style={{ flex: 1, padding: '24px 32px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 18, overflow: 'hidden' }}>
        {/* Filter sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: '0.08em', marginBottom: 10 }}>기간 구분</div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: A.surface, borderRadius: 10, border: `1px solid ${A.borderSft}` }}>
              {['예정','지난'].map((v, i) => (
                <div key={v} style={{ flex: 1, padding: '7px 0', borderRadius: 7, textAlign: 'center', fontSize: 12, fontWeight: 700, background: i === 0 ? A.primary : 'transparent', color: i === 0 ? '#fff' : A.textSft }}>{v}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: '0.08em', marginBottom: 10 }}>상태</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {[
                { t: '전체', a: true },
                { t: '확정' }, { t: '대기' }, { t: '취소' }, { t: '거절' },
              ].map((f, i) => (
                <div key={f.t} style={{ padding: '5px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: f.a ? A.primary : A.surface, color: f.a ? '#fff' : A.textSft, border: f.a ? 'none' : `1px solid ${A.borderSft}` }}>{f.t}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: '0.08em', marginBottom: 10 }}>필터</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['장소 ▾', '1주 이내 ▾', '담당교역자 ▾'].map(s => (
                <div key={s} style={{ padding: '8px 12px', borderRadius: 9, background: A.surface, border: `1px solid ${A.borderSft}`, fontSize: 12, fontWeight: 600, color: A.textSft, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{s.replace(' ▾','')}</span>
                  <span style={{ color: A.textMute }}>▾</span>
                </div>
              ))}
              <div style={{ padding: '8px 12px', borderRadius: 9, background: A.surface, border: `1px solid ${A.borderSft}`, fontSize: 12, color: A.textMute, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon.Search width={12} height={12} /> 이름·전화 검색
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em' }}>예약 관리</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: A.textMute }}>예정 2건 · 전체 결과 23건</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* View toggle — same position as 달력 view */}
              <div style={{ display: 'flex', gap: 3, padding: 3, background: A.surface, borderRadius: 9, border: `1px solid ${A.borderSft}` }}>
                {[
                  { v: '달력', icon: <Icon.Calendar width={12} height={12}/>, active: false },
                  { v: '리스트', icon: <Icon.Layers width={12} height={12}/>, active: true },
                ].map((v, i) => (
                  <div key={v.v} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, background: v.active ? A.primary : 'transparent', color: v.active ? '#fff' : A.textSft, display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                    {v.icon} {v.v}
                  </div>
                ))}
              </div>
              <div style={{ width: 1, height: 22, background: A.borderSft }} />
              <button style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid ${A.border}`, background: A.surface, fontSize: 12, fontWeight: 600 }}>설정</button>
              <button style={{ padding: '8px 12px', borderRadius: 9, border: 'none', background: A.primary, color: '#fff', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon.Download width={12} height={12}/> CSV
              </button>
            </div>
          </div>

          <div style={{ background: A.surface, borderRadius: 14, border: `1px solid ${A.borderSft}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${A.borderSft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>전체 예약 6건</div>
              <div style={{ display: 'flex', gap: 6, fontSize: 11, color: A.textMute }}>
                <span>최근순</span>
                <span>▾</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '60px 90px 90px 1fr 1fr 60px 1fr 70px 110px', padding: '10px 18px', background: A.surface2, fontSize: 10, fontWeight: 800, color: A.textMute, letterSpacing: '0.06em' }}>
              <div>날짜</div><div>건물</div><div>장소</div><div>시간 / 이름</div><div>부서</div><div>인원</div><div>목적</div><div>상태</div><div style={{ textAlign: 'right' }}>액션</div>
            </div>
            {[
              { d: '05.16', b: '가나안홀', r: '에벤에셀홀', t: '11:30-14:00', n: '염시온',  dept: '주공15',   p: 20,  pp: '예배 / 기도회', s: '확정' },
              { d: '05.17', b: '본당',     r: '자람뜰홀',   t: '14:00-16:00', n: '김다윗',  dept: '청년1',     p: 35,  pp: '성경 공부',     s: '대기' },
              { d: '05.18', b: '무지개홀', r: '그릿시내홀', t: '19:00-21:00', n: '이혜원',  dept: '교회학교', p: 80,  pp: '찬양 연습',     s: '확정' },
              { d: '05.19', b: '가나안홀', r: '물댄동산방', t: '13:00-13:30', n: '염시온',  dept: '-',         p: 10,  pp: '예배 / 기도회', s: '취소' },
              { d: '05.20', b: '본당',     r: '사랑방',     t: '10:00-12:00', n: '박지현',  dept: '6교구',     p: 18,  pp: '세미나',         s: '대기' },
              { d: '05.21', b: '본당',     r: '드림홀',     t: '20:00-22:00', n: '최한솔',  dept: '청년부',   p: 60,  pp: '행사',           s: '확정' },
            ].map((r, i, arr) => {
              const sty = ({
                확정: { bg: A.primary100, color: A.primary },
                대기: { bg: 'rgba(184,138,58,0.18)', color: '#8C6428' },
                취소: { bg: '#F0EBDB', color: A.textMute },
              })[r.s];
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 90px 90px 1fr 1fr 60px 1fr 70px 110px', padding: '12px 18px', alignItems: 'center', fontSize: 12, borderBottom: i < arr.length - 1 ? `1px solid ${A.borderSft}` : 'none' }}>
                  <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.d}</div>
                  <div><span style={{ padding: '3px 8px', borderRadius: 5, background: A.surface2, fontSize: 11, fontWeight: 600, color: A.textSft }}>{r.b}</span></div>
                  <div style={{ fontWeight: 600 }}>{r.r}</div>
                  <div>
                    <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{r.t}</div>
                    <div style={{ fontSize: 10, color: A.textMute, marginTop: 1 }}>{r.n}</div>
                  </div>
                  <div style={{ color: A.textSft }}>{r.dept}</div>
                  <div style={{ color: A.textSft, fontVariantNumeric: 'tabular-nums' }}>{r.p}명</div>
                  <div style={{ color: A.textSft }}>{r.pp}</div>
                  <div><span style={{ ...sty, padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 800 }}>{r.s}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    <button style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${A.borderSft}`, background: A.surface, fontSize: 10, fontWeight: 600 }}>상세</button>
                    {r.s === '대기' && <button style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: A.primary, color: '#fff', fontSize: 10, fontWeight: 700 }}>확정</button>}
                    {r.s === '확정' && <button style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: 'rgba(184,74,62,0.14)', color: A.danger, fontSize: 10, fontWeight: 700 }}>취소</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCREEN — 팀 추가 모달
// ============================================================
function A_AddTeamModal() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'rgba(20,30,25,0.40)', fontFamily: 'Pretendard', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
      {/* faded table behind */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.13, padding: '40px 60px' }}>
        <div style={{ height: 28, background: A.surface, borderRadius: 8, marginBottom: 12 }} />
        {[1,2,3,4,5].map(i => <div key={i} style={{ height: 44, background: A.surface, borderRadius: 10, marginBottom: 6 }} />)}
      </div>

      <div style={{ position: 'relative', width: 460, background: A.surface, borderRadius: 20, padding: 32, boxShadow: A.shadowLg }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: A.accent, letterSpacing: '0.08em', marginBottom: 4 }}>NEW TEAM</div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em' }}>팀 추가</h2>
          </div>
          <div style={{ width: 30, height: 30, borderRadius: 999, background: A.surface2, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon.X width={14} height={14} /></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>팀명 <span style={{ color: A.danger }}>*</span></label>
            <input placeholder="예: 동백3" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${A.border}`, background: A.surface2, fontSize: 14, fontFamily: 'Pretendard', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>부서 <span style={{ color: A.danger }}>*</span></label>
            <div style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${A.border}`, background: A.surface2, fontSize: 14, color: A.textMute, fontFamily: 'Pretendard', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>선택하세요</span>
              <span>▾</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>담당 교역자</label>
            <div style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${A.border}`, background: A.surface2, fontSize: 14, color: A.textMute, fontFamily: 'Pretendard', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>선택하세요</span>
              <span>▾</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>연락처 <span style={{ color: A.danger }}>*</span></label>
            <input placeholder="010-1234-5678" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${A.border}`, background: A.surface2, fontSize: 14, fontFamily: 'Pretendard', fontVariantNumeric: 'tabular-nums', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <button style={{ flex: 1, padding: '13px', borderRadius: 11, border: `1px solid ${A.border}`, background: A.surface, fontWeight: 600, fontSize: 13, color: A.textSft }}>닫기</button>
          <button style={{ flex: 2, padding: '13px', borderRadius: 11, border: 'none', background: A.primary, color: '#fff', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon.Plus width={14} height={14}/> 팀 추가하기
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { A_Step1, A_Step3, A_Step5, A_MyLogin, A_DetailModal, A_AdminLogin, A_AdminTeam, A_AdminList, A_AddTeamModal });
