# Phase 1.5.1 백엔드 완료 보고서

**작성일**: 2026-04-11
**브랜치**: `feature/phase1.5.1-backend`
**베이스**: `develop`

---

## 1. Executive Summary

| 관점 | 내용 |
|------|------|
| **문제** | 팀/리더 정보를 매번 수동 입력해야 했고, 예약 가능 공간을 시간대별로 한눈에 파악할 수 없었으며, 삭제된 예약이 DB에서 완전히 제거되어 이력 추적이 불가능했음 |
| **해결** | 팀 마스터 DB 구축, 공간 가용성 3단계 분류 API, 소프트 삭제, 예약 티켓 이미지 다운로드 4가지 기능 추가 |
| **기능·UX 효과** | 프론트엔드에서 팀 선택 시 리더 전화번호 자동 채움 / 시간대 입력만으로 가능·부분가능·불가 공간 즉시 확인 / 예약 완료 후 CGV 스타일 PNG 티켓 다운로드 가능 |
| **핵심 가치** | 예약 신청 UX 개선 + 관리 편의성 향상 + 데이터 이력 보존 |

---

## 2. 구현 범위

### 2.1 신규 파일

| 파일 | 설명 |
|------|------|
| `apps/api/reservations/ticket.py` | Pillow 기반 PNG 티켓 이미지 생성 모듈 |
| `apps/api/reservations/migrations/0002_...py` | Team 모델 + Reservation 소프트 삭제 필드 migration |
| `docs/backend/phase1.5.1-plan.md` | Plan 문서 |
| `docs/backend/phase1.5.1-design.md` | Design 문서 |

### 2.2 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `models.py` | `Team` 모델 추가 / `Reservation`에 `is_deleted`, `deleted_at` 추가 / `has_conflict()` 소프트 삭제 필터 |
| `serializers.py` | `TeamSerializer`, `SpaceAvailabilitySerializer`, `SpaceAvailabilityQuerySerializer`, `OverlappingSlotSerializer` 추가 |
| `views.py` | `TeamListView`, `SpaceAvailabilityView`, `AdminReservationDeleteView`, `ReservationTicketView` 추가 / 기존 4개 View queryset에 `is_deleted=False` 필터 적용 |
| `urls.py` | 신규 4개 URL 패턴 등록 |
| `tests.py` | 38 → 77개 (39케이스 추가) |
| `requirements.txt` | `Pillow`, `qrcode[pil]` 추가 |

**총 변경량**: +620줄 (6개 파일 수정, 2개 신규)

---

## 3. 기능별 구현 결과

### Feature 1 — 1박 이상 신청
**결론: 백엔드 변경 불필요**

기존 `start_datetime` / `end_datetime` DateTimeField 구조가 이미 다일(多日) 예약을 지원함을 코드 분석으로 확인. 같은 날짜 제한 로직 없음. 30분 단위 validation은 `total_seconds()` 기준이므로 1박 이상도 정상 동작.

---

### Feature 2 — 팀 마스터 데이터 관리 ✅

| 항목 | 결과 |
|------|------|
| `Team` 모델 | `name(unique)`, `leader_phone`, `is_active`, 타임스탬프 |
| `GET /api/v1/teams/` | `is_active=True` 팀만 반환 |
| Reservation 모델 영향 | 없음 (`applicant_team`, `leader_phone` 필드 유지) |

프론트엔드는 팀 선택 시 `leader_phone`을 자동 채우는 방식으로 연동 예정.

---

### Feature 3 — 공간 가용성 조회 API ✅

| 항목 | 결과 |
|------|------|
| `GET /api/v1/spaces/availability/` | full / partial / none 3단계 분류 후 정렬 반환 |
| 필터 | `building_id`, `floor`, `keyword(icontains)` |
| partial 응답 | 겹치는 예약 `start_datetime`, `end_datetime` 슬롯 함께 반환 |
| 소프트 삭제 반영 | `is_deleted=True` 예약은 가용성 계산에서 제외 |
| cancelled 예약 | confirmed만 충돌 대상 → full로 분류 |

**가용성 판단 로직 요약**:
```
겹침 조건: rs < E AND re > S
none:    rs <= S AND re >= E 인 예약 하나 이상 (단일 예약이 전체 차단)
partial: 겹치는 예약 있으나 none 아닌 경우
full:    겹치는 예약 없음
```

---

### Feature 4 — 예약 소프트 삭제 ✅

| 항목 | 결과 |
|------|------|
| `DELETE /api/v1/admin/reservations/<id>/` | 204 반환, `is_deleted=True` + `deleted_at` 기록 |
| DB row | 삭제하지 않음 (이력 보존) |
| 영향 범위 | 일반 조회, 관리자 조회, 공간 점유 조회, 취소 API, 충돌 체크 전체에 `is_deleted=False` 필터 적용 |
| 인증 | Token 필수 (관리자 전용) |

---

### Feature 5 — 예약 티켓 이미지 다운로드 ✅

| 항목 | 결과 |
|------|------|
| `GET /api/v1/reservations/<id>/ticket/` | 600×900 px PNG 반환 |
| 인증 | `name` + `phone` query param 검증 (불일치 시 403) |
| 이미지 구성 | 헤더(THE PROMISE) / 공간명 / 9개 정보 필드 / 점선 tear line / QR코드 |
| QR코드 | 예약 ID 인코딩 (TODO: 추후 URL로 교체) |
| 폰트 | NanumGothic.ttf 번들 시 사용, 없으면 PIL 기본 폰트 폴백 |
| 라이브러리 | `Pillow`, `qrcode[pil]` |

---

## 4. 테스트 결과

### 4.1 전체 현황

```
Ran 77 tests in 26.784s
OK (38 → 77, +39 케이스)
```

### 4.2 클래스별 결과

| 테스트 클래스 | 케이스 | 결과 | 비고 |
|--------------|--------|------|------|
| `HasConflictTest` | 7 | ✅ 전체 통과 | 소프트 삭제 케이스 추가 |
| `SpaceListViewTest` | 3 | ✅ 전체 통과 | 변경 없음 |
| `ReservationCreateTest` | 8 | ✅ 전체 통과 | 삭제 예약 무시 케이스 추가 |
| `ReservationListViewTest` | 4 | ✅ 전체 통과 | 삭제 예약 미노출 케이스 추가 |
| `SpaceReservationListViewTest` | 7 | ✅ 전체 통과 | 삭제 예약 미노출 케이스 추가 |
| `AdminLoginViewTest` | 2 | ✅ 전체 통과 | 변경 없음 |
| `AdminReservationListViewTest` | 6 | ✅ 전체 통과 | 삭제 예약 미노출 케이스 추가 |
| `AdminReservationCancelViewTest` | 7 | ✅ 전체 통과 | 삭제 예약 취소 404 케이스 추가 |
| `TeamListViewTest` | 4 | ✅ 전체 통과 | **신규** |
| `SpaceAvailabilityViewTest` | 14 | ✅ 전체 통과 | **신규** |
| `AdminReservationDeleteViewTest` | 7 | ✅ 전체 통과 | **신규** |
| `ReservationTicketViewTest` | 7 | ✅ 전체 통과 | **신규** |

### 4.3 주요 테스트 케이스 (신규)

| 케이스 | 기댓값 | 결과 |
|--------|--------|------|
| 소프트 삭제 예약 → 충돌 체크 제외 | `has_conflict()` False | ✅ |
| 소프트 삭제 예약 → 가용성 full | `availability: full` | ✅ |
| 소프트 삭제 후 일반/관리자 조회 미노출 | 빈 배열 | ✅ |
| 소프트 삭제 후 DB row 존재 | `Reservation.objects.get(pk)` 성공 | ✅ |
| 중복 삭제 | 404 not_found | ✅ |
| 티켓 PNG magic bytes 확인 | `\x89PNG` | ✅ |
| 티켓 name/phone 불일치 | 403 forbidden | ✅ |
| 가용성 full→partial→none 정렬 순서 | index 순서 검증 | ✅ |

---

## 5. API 동작 검증 (실서버)

| 엔드포인트 | 시나리오 | 결과 |
|-----------|----------|------|
| `GET /api/v1/teams/` | 활성 팀 2개 반환, 비활성 팀 미포함 | ✅ |
| `GET /api/v1/spaces/availability/` | 예약 없는 공간 full / 부분 겹침 partial / 전체 차단 none | ✅ |
| `GET /api/v1/reservations/<id>/ticket/` | 600×900 PNG 생성 확인 | ✅ |
| `GET /api/v1/reservations/<id>/ticket/` | 이름 불일치 → 403 | ✅ |
| `GET /api/v1/reservations/<id>/ticket/` | phone 누락 → 400 | ✅ |
| `DELETE /api/v1/admin/reservations/<id>/` | 204 반환, is_deleted=True 확인 | ✅ |
| `DELETE /api/v1/admin/reservations/<id>/` | 재삭제 → 404 | ✅ |
| `DELETE /api/v1/admin/reservations/<id>/` | 토큰 없음 → 401 | ✅ |

---

## 6. 설계 대비 구현 GAP 분석

| 설계 항목 | 구현 | 상태 |
|-----------|------|------|
| `Team` 모델 (name unique, is_active) | ✅ 동일 | 일치 |
| `Reservation.is_deleted` + `deleted_at` | ✅ 동일 | 일치 |
| `has_conflict()` is_deleted 필터 | ✅ 동일 | 일치 |
| 기존 4개 View queryset is_deleted 필터 | ✅ 동일 | 일치 |
| `GET /teams/` — is_active=True만 | ✅ 동일 | 일치 |
| `GET /spaces/availability/` — 3단계 분류 + 정렬 | ✅ 동일 | 일치 |
| `DELETE /admin/reservations/<id>/` — 204 | ✅ 동일 | 일치 |
| `GET /reservations/<id>/ticket/` — PNG 반환 | ✅ 동일 | 일치 |
| 티켓 600×900 px 레이아웃 | ✅ 동일 | 일치 |
| `SpaceAvailabilityQuerySerializer.validate()` 에러 형식 | 설계는 dict, 구현은 string으로 수정 | **수정** |
| 폰트 파일 번들 | 폴백만 구현 (폰트 파일 미포함) | **미완** |

### 수정 사항 상세

**`SpaceAvailabilityQuerySerializer.validate()` 에러 형식 변경**
- 설계: `raise ValidationError({"error": ..., "message": ...})`
- 구현: `raise ValidationError("메시지 문자열")` + view에서 일관된 포맷으로 래핑
- 이유: DRF의 `non_field_errors` 래핑 구조로 인해 view에서 직접 포맷팅하는 것이 응답 일관성에 유리

**폰트 파일 미포함**
- 설계: `apps/api/reservations/static/fonts/NanumGothic.ttf` 번들
- 구현: 경로 로직 구현, PIL 기본 폰트 폴백 동작
- 이유: 폰트 파일 라이선스 및 번들 방식 추후 결정 필요
- 영향: 현재 티켓 이미지에서 한글이 □□□로 표시됨 → **폰트 번들 필요**

---

## 7. 완료 기준 체크

| 기준 | 결과 |
|------|------|
| `Team` 모델 및 migration | ✅ |
| `Reservation` 소프트 삭제 필드 및 migration | ✅ |
| 기존 모든 queryset `is_deleted=False` 필터 | ✅ |
| `has_conflict()` `is_deleted=False` 필터 | ✅ |
| `GET /api/v1/teams/` 정상 동작 | ✅ |
| `GET /api/v1/spaces/availability/` 3단계 정렬 | ✅ |
| `DELETE /api/v1/admin/reservations/<id>/` 소프트 삭제 | ✅ |
| `GET /api/v1/reservations/<id>/ticket/` PNG 반환 | ✅ |
| `python manage.py test reservations` 전체 통과 | ✅ 77/77 |

---

## 8. 회고 (Retrospective)

### 잘 된 점

- **Plan → Design → Do 흐름 일치율 높음**: 설계대로 구현, 변경은 1건(에러 포맷)으로 최소화
- **소프트 삭제 영향 범위 선제 분석**: has_conflict, 취소 API, 공간 점유 조회 등 연쇄 영향 지점을 design 단계에서 미리 정의하여 누락 없이 적용
- **테스트 커버리지**: 기존 38 → 77케이스로 2배 확장, 영향받는 기존 케이스 모두 보강

### 개선이 필요한 점

- **폰트 번들 미완**: 티켓 이미지의 핵심 UX인 한글 표시가 현재 작동하지 않음 → 최우선 후속 작업
- **가용성 API 성능**: 공간 수가 많을 경우 공간별 N+1 쿼리 발생 가능 → `prefetch_related`로 예약 데이터를 일괄 조회하는 최적화 검토 필요

---

## 9. 후속 작업 (Next Steps)

| 우선순위 | 작업 | 설명 |
|----------|------|------|
| 🔴 High | 폰트 파일 번들 | `NanumGothic.ttf` 추가 → 티켓 한글 정상 렌더링 |
| 🟡 Medium | 가용성 API N+1 쿼리 최적화 | 공간별 예약 prefetch로 쿼리 수 단순화 |
| 🟡 Medium | 티켓 QR → URL 교체 | 예약 상세 페이지 구축 후 QR 데이터를 URL로 변경 |
| 🟢 Low | Team CRUD 관리 API | 관리자가 팀 추가/수정/비활성화하는 API |
