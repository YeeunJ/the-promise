// Main canvas — A first as full flow, B/C kept as reference at the bottom.

const { useState } = React;
const W = 1280, H = 800;

function App() {
  return (
    <DesignCanvas
      title="가나안교회 예약 시스템 · Refined Sage"
      subtitle="Option A 전체 흐름 · Pretendard · 1280×800"
    >
      {/* ================ A — Full flow ================ */}
      <DCSection id="a-intro" title="A · Refined Sage" subtitle="브랜드 초록을 살리되, 따뜻한 아이보리 + 황동 액센트로 격을 높인 프리미엄 안">
        <DCArtboard id="a-card" label="컬러 · 톤 · 무드" width={420} height={400}>
          <OptionCard
            label="A"
            name="Refined Sage"
            tag="채택된 방향"
            palette={['#1F5F4A', '#F4F1E8', '#B8956A', '#FFFFFF']}
            mood="기존 초록 브랜드를 살리되, 따뜻한 아이보리 배경과 황동 액센트로 격을 높였습니다. 교회의 정서적 무게는 유지하면서 Toss 수준의 정돈된 인터랙션."
            traits={['딥 모스 그린 #1F5F4A', '따뜻한 아이보리 배경', '황동 액센트', '대담한 헤딩 + 부드러운 카드']}
          />
        </DCArtboard>
      </DCSection>

      <DCSection id="a-landing" title="① 사용자 · 진입 화면" subtitle="첫 인상과 신청 조회">
        <DCArtboard id="a-landing-board" label="랜딩" width={W} height={H}><A_Landing /></DCArtboard>
        <DCArtboard id="a-mylogin-board" label="내 예약 조회 — 로그인" width={W} height={H}><A_MyLogin /></DCArtboard>
      </DCSection>

      <DCSection id="a-flow" title="② 5단계 신청 흐름" subtitle="Step 1 → 5, 그리고 신청 내용 확인">
        <DCArtboard id="a-s1" label="STEP 1 · 신청자 정보" width={W} height={H}><A_Step1 /></DCArtboard>
        <DCArtboard id="a-s2" label="STEP 2 · 장소 선택" width={W} height={H}><A_PlaceSelect /></DCArtboard>
        <DCArtboard id="a-s3" label="STEP 3 · 인원 선택" width={W} height={H}><A_Step3 /></DCArtboard>
        <DCArtboard id="a-s4" label="STEP 4 · 날짜·시간" width={W} height={H}><A_DateTime /></DCArtboard>
        <DCArtboard id="a-s5" label="STEP 5 · 사용 목적" width={W} height={H}><A_Step5 /></DCArtboard>
        <DCArtboard id="a-conf" label="신청 내용 확인" width={W} height={H}><A_Confirm /></DCArtboard>
      </DCSection>

      <DCSection id="a-review" title="③ 내 예약 조회 · 결과/상세" subtitle="조회 결과 리스트 + 예약 상세 모달">
        <DCArtboard id="a-myres" label="조회 결과 — 통계 + 테이블" width={W} height={H}><A_MyReservations /></DCArtboard>
        <DCArtboard id="a-detail" label="예약 상세 모달" width={W} height={H}><A_DetailModal /></DCArtboard>
      </DCSection>

      <DCSection id="a-admin" title="④ 관리자 콘솔" subtitle="로그인 → 대시보드 → 리스트 → 팀 관리">
        <DCArtboard id="a-adminlogin" label="관리자 로그인" width={W} height={H}><A_AdminLogin /></DCArtboard>
        <DCArtboard id="a-admindash" label="예약 관리 — 대시보드 (달력)" width={W} height={H}><A_Admin /></DCArtboard>
        <DCArtboard id="a-adminlist" label="예약 관리 — 리스트 뷰" width={W} height={H}><A_AdminList /></DCArtboard>
        <DCArtboard id="a-team" label="팀 관리" width={W} height={H}><A_AdminTeam /></DCArtboard>
        <DCArtboard id="a-teamadd" label="팀 추가 모달" width={W} height={H}><A_AddTeamModal /></DCArtboard>
      </DCSection>

      {/* ================ B / C — Reference ================ */}
      <DCSection id="ref-intro" title="참고 — 비교용 다른 방향" subtitle="필요 시 부분 차용 가능 (B의 KPI 카드 + 가동률, C의 에디토리얼 타이포 등)">
        <DCArtboard id="opt-b-card" label="B · Toss Indigo" width={420} height={400}>
          <OptionCard
            label="B"
            name="Toss Indigo"
            tag="가장 모던 · 데이터 중심"
            palette={['#3B5BDB', '#F4F6FA', '#FF8A3D', '#0F172A']}
            mood="차가운 슬레이트 배경 + 인디고 프라이머리로 핀테크 SaaS 톤. 데이터 가시화(히트맵·게이지·KPI)에 강점."
            traits={['딥 인디고', '쿨 슬레이트', '좌측 스텝 사이드바', '통계/카드 중심']}
          />
        </DCArtboard>
        <DCArtboard id="opt-c-card" label="C · Warm Walnut" width={420} height={400}>
          <OptionCard
            label="C"
            name="Warm Walnut"
            tag="에디토리얼 · 따뜻함"
            palette={['#5C3F2C', '#FAF6EE', '#3E6B4F', '#C7964D']}
            mood="부티크 호텔 / 매거진 톤. 호두색 + 크림 + 세이지 액센트로 ‘함께 모이는 공간’의 따스함을 표현."
            traits={['호두색 + 세이지', '큰 여백', '세리프 강조', '에디토리얼 리듬']}
          />
        </DCArtboard>
      </DCSection>

      <DCSection id="ref-b" title="B 참고 화면" subtitle="필요한 부분만 발췌해도 좋습니다">
        <DCArtboard id="b-landing" label="B 랜딩" width={W} height={H}><B_Landing /></DCArtboard>
        <DCArtboard id="b-place" label="B 장소 선택" width={W} height={H}><B_PlaceSelect /></DCArtboard>
        <DCArtboard id="b-dt" label="B 날짜·시간" width={W} height={H}><B_DateTime /></DCArtboard>
        <DCArtboard id="b-conf" label="B 확인" width={W} height={H}><B_Confirm /></DCArtboard>
        <DCArtboard id="b-my" label="B 내 예약" width={W} height={H}><B_MyReservations /></DCArtboard>
        <DCArtboard id="b-admin" label="B 관리자" width={W} height={H}><B_Admin /></DCArtboard>
      </DCSection>

      <DCSection id="ref-c" title="C 참고 화면" subtitle="에디토리얼 타이포의 영감용">
        <DCArtboard id="c-landing" label="C 랜딩" width={W} height={H}><C_Landing /></DCArtboard>
        <DCArtboard id="c-place" label="C 장소 선택" width={W} height={H}><C_PlaceSelect /></DCArtboard>
        <DCArtboard id="c-dt" label="C 날짜·시간" width={W} height={H}><C_DateTime /></DCArtboard>
        <DCArtboard id="c-conf" label="C 확인" width={W} height={H}><C_Confirm /></DCArtboard>
        <DCArtboard id="c-my" label="C 내 예약" width={W} height={H}><C_MyReservations /></DCArtboard>
        <DCArtboard id="c-admin" label="C 관리자" width={W} height={H}><C_Admin /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

function OptionCard({ label, name, tag, palette, mood, traits }) {
  return (
    <div style={{ width: '100%', height: '100%', padding: 28, background: '#fff', display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'Pretendard' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: palette[0], color: palette[1], display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800 }}>{label}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#9AA29D', textTransform: 'uppercase' }}>OPTION {label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', color: '#161A18', marginTop: 2 }}>{name}</div>
          <div style={{ fontSize: 11, color: palette[0], fontWeight: 700, marginTop: 4 }}>{tag}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {palette.map((c, i) => (
          <div key={i} style={{ flex: 1, height: 32, borderRadius: 6, background: c, border: c.toLowerCase() === '#ffffff' ? '1px solid #eee' : 'none', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: -16, left: 0, fontSize: 9, color: '#9AA29D', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{c}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: '#5b6360', lineHeight: 1.6, margin: '18px 0 0' }}>{mood}</p>
      <div style={{ marginTop: 6 }}>
        {traits.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11.5, color: '#161A18', fontWeight: 500 }}>
            <span style={{ width: 4, height: 4, borderRadius: 999, background: palette[0] }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
