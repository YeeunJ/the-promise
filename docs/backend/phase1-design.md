# Phase 1 백엔드 Design

## 모델 설계

### Building

```python
class Building(models.Model):
    name         = models.CharField(max_length=100)
    description  = models.TextField(blank=True, null=True)
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "buildings"

    def __str__(self):
        return self.name
```

### Space

```python
class Space(models.Model):
    building    = models.ForeignKey(Building, on_delete=models.PROTECT, related_name="spaces")
    name        = models.CharField(max_length=100)
    floor       = models.IntegerField(blank=True, null=True)
    capacity    = models.IntegerField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "spaces"

    def __str__(self):
        return f"{self.building.name} - {self.name}"
```

### Reservation

```python
class Reservation(models.Model):

    class Status(models.TextChoices):
        PENDING   = "pending",   "대기 중"
        CONFIRMED = "confirmed", "승인됨"
        REJECTED  = "rejected",  "거절됨"
        CANCELLED = "cancelled", "취소됨"

    space           = models.ForeignKey(Space, on_delete=models.PROTECT, related_name="reservations")
    applicant_name  = models.CharField(max_length=50)
    applicant_phone = models.CharField(max_length=20)
    applicant_team  = models.CharField(max_length=100)
    leader_phone    = models.CharField(max_length=20)
    headcount       = models.PositiveIntegerField()
    purpose         = models.TextField()
    start_datetime  = models.DateTimeField()
    end_datetime    = models.DateTimeField()
    status          = models.CharField(
                          max_length=20,
                          choices=Status.choices,
                          default=Status.CONFIRMED,
                      )
    admin_note      = models.TextField(blank=True, null=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reservations"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["applicant_name", "applicant_phone"]),
            models.Index(fields=["space", "start_datetime", "end_datetime"]),
        ]

    def has_conflict(self) -> bool:
        """
        같은 공간에 시간이 겹치는 confirmed 예약이 존재하면 True.
        판단 기준: 신청 시작 < 기존 종료 AND 신청 종료 > 기존 시작
        """
        qs = Reservation.objects.filter(
            space=self.space,
            status=Reservation.Status.CONFIRMED,
            start_datetime__lt=self.end_datetime,
            end_datetime__gt=self.start_datetime,
        )
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        return qs.exists()
```

---

## Serializer 설계

### SpaceSerializer (응답용)

```python
class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ["id", "name", "description"]

class SpaceSerializer(serializers.ModelSerializer):
    building = BuildingSerializer(read_only=True)

    class Meta:
        model = Space
        fields = ["id", "building", "name", "floor", "capacity", "description"]

class BuildingWithSpacesSerializer(serializers.ModelSerializer):
    spaces = SpaceSerializer(many=True, read_only=True)

    class Meta:
        model = Building
        fields = ["id", "name", "description", "spaces"]
```

> `GET /api/v1/spaces/` 응답에서 건물별 공간 목록을 중첩하여 반환하기 위한 Serializer.

### ReservationSerializer (응답용)

```python
class ReservationSerializer(serializers.ModelSerializer):
    space = SpaceSerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "space", "applicant_name", "applicant_phone",
            "applicant_team", "leader_phone", "headcount",
            "purpose", "start_datetime", "end_datetime",
            "status", "created_at",
        ]
```

### 예외 처리 설계

#### 날짜 형식 검증 (views)

`AdminReservationListView`, `SpaceReservationListView`에서 `date` 파라미터를 받을 때 형식 검증:

```python
import datetime

try:
    datetime.date.fromisoformat(date)
except ValueError:
    return Response(
        {"error": "validation_error", "message": "날짜 형식이 올바르지 않습니다. (예: 2026-04-01)"},
        status=400,
    )
```

#### 예약 신청 추가 검증 (ReservationCreateSerializer.validate)

| 조건 | 에러 메시지 |
|------|------------|
| `space.is_active=False` | "예약이 불가능한 공간입니다." |
| `start_datetime < now` | "과거 시간으로는 예약할 수 없습니다." |

---

### ReservationCreateSerializer (신청 입력 + 자동 승인/거절)

```python
class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = [
            "space", "applicant_name", "applicant_phone",
            "applicant_team", "leader_phone", "headcount",
            "purpose", "start_datetime", "end_datetime",
        ]

    def validate(self, data):
        # 종료시간이 시작시간보다 늦어야 함
        if data["end_datetime"] <= data["start_datetime"]:
            raise serializers.ValidationError({
                "error": "validation_error",
                "message": "종료 시간은 시작 시간보다 늦어야 합니다.",
            })
        # 30분 단위 검증 (total_seconds 사용 — 24시간 초과 시 .seconds는 오작동)
        duration = data["end_datetime"] - data["start_datetime"]
        if int(duration.total_seconds()) % 1800 != 0:
            raise serializers.ValidationError({
                "error": "validation_error",
                "message": "예약은 30분 단위로만 신청할 수 있습니다.",
            })
        return data

    def create(self, validated_data):
        with transaction.atomic():
            # 같은 공간에 대한 동시 요청을 직렬화
            # select_for_update()로 space row를 잠가 conflict 체크~저장을 원자적으로 처리
            Space.objects.select_for_update().get(pk=validated_data['space'].pk)

            reservation = Reservation(**validated_data)
            if reservation.has_conflict():
                reservation.status = Reservation.Status.REJECTED
            else:
                reservation.status = Reservation.Status.CONFIRMED
            reservation.save()
        return reservation
```

### ReservationQuerySerializer (조회 쿼리 검증)

```python
class ReservationQuerySerializer(serializers.Serializer):
    name  = serializers.CharField()
    phone = serializers.CharField()
```

### ReservationCancelSerializer (관리자 취소)

```python
class ReservationCancelSerializer(serializers.Serializer):
    admin_note = serializers.CharField(required=False, allow_blank=True, default="")
```

---

## API 설계

### GET `/api/v1/spaces/`

활성화된 건물 + 공간 목록을 반환합니다.

**응답 예시**

```json
[
  {
    "id": 1,
    "name": "본당",
    "description": null,
    "spaces": [
      {
        "id": 1,
        "building": { "id": 1, "name": "본당", "description": null },
        "name": "2층 세미나실 A",
        "floor": 2,
        "capacity": 20,
        "description": null
      }
    ]
  }
]
```

> 건물별로 그룹화하여 반환합니다. view에서 `Building` 쿼리 후 관련 `Space`를 `prefetch_related`로 조회합니다.

---

### GET `/api/v1/reservations/?name=홍길동&phone=01012345678`

이름 + 연락처로 본인 예약 목록을 조회합니다.

**응답 예시**

```json
[
  {
    "id": 10,
    "space": { "id": 3, "building": { "id": 1, "name": "본당" }, "name": "자람뜰홀", ... },
    "applicant_name": "홍길동",
    "applicant_phone": "01012345678",
    "applicant_team": "청년부",
    "purpose": "팀 모임",
    "start_datetime": "2025-04-01T10:00:00+09:00",
    "end_datetime": "2025-04-01T12:00:00+09:00",
    "status": "confirmed",
    "created_at": "2025-03-26T09:00:00+09:00"
  }
]
```

---

### POST `/api/v1/reservations/`

예약을 신청합니다. 시간 중복 여부에 따라 자동으로 `confirmed` 또는 `rejected`를 반환합니다.

**요청 Body**

```json
{
  "space": 3,
  "applicant_name": "홍길동",
  "applicant_phone": "01012345678",
  "applicant_team": "청년부",
  "leader_phone": "01098765432",
  "headcount": 15,
  "purpose": "팀 모임",
  "start_datetime": "2025-04-01T10:00:00+09:00",
  "end_datetime": "2025-04-01T12:00:00+09:00"
}
```

**응답 — 승인 (201)**

```json
{
  "id": 10,
  "status": "confirmed",
  ...
}
```

**응답 — 거절 (201)**

```json
{
  "id": 11,
  "status": "rejected",
  ...
}
```

> 중복이어도 예약 레코드는 저장되고 status만 `rejected`로 설정됩니다. 이력 보존을 위해 400 에러로 처리하지 않습니다.

---

### POST `/api/v1/admin/login/`

**요청 Body**

```json
{
  "username": "admin",
  "password": "password"
}
```

**응답 (200)**

```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

> DRF `TokenAuthentication` 사용. 토큰을 이후 요청 헤더에 `Authorization: Token <token>` 형태로 전달합니다.

---

### GET `/api/v1/admin/reservations/`

전체 예약 목록을 반환합니다. 관리자 토큰 필요.

**쿼리 파라미터 (선택)**

| 파라미터 | 설명 |
|---------|------|
| `date` | 특정 날짜 예약만 조회 (예: `2025-04-01`) |
| `status` | 상태 필터 (예: `confirmed`) |

---

### POST `/api/v1/admin/reservations/<id>/cancel/`

예약을 취소합니다. 관리자 토큰 필요.

**요청 Body**

```json
{
  "admin_note": "행사 일정 변경으로 취소"
}
```

**응답 (200)**

```json
{
  "id": 10,
  "status": "cancelled",
  "admin_note": "행사 일정 변경으로 취소",
  ...
}
```

**에러 — 이미 취소된 예약 (400)**

```json
{
  "error": "already_cancelled",
  "message": "이미 취소된 예약입니다."
}
```

**에러 — 거절된 예약 취소 시도 (400)**

```json
{
  "error": "cannot_cancel_rejected",
  "message": "거절된 예약은 취소할 수 없습니다."
}
```

---

### GET `/api/v1/spaces/<id>/reservations/?date=YYYY-MM-DD`

특정 날짜에 해당 공간의 confirmed 예약 목록을 반환합니다.
프론트엔드에서 날짜별 예약 현황(점유 시간)을 표시하기 위한 API입니다.

**쿼리 파라미터**

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `date` | ✅ | 조회할 날짜 (예: `2026-04-10`) |

**응답 예시 (200)**

```json
[
  {
    "start_datetime": "2026-04-10T10:00:00+09:00",
    "end_datetime": "2026-04-10T12:00:00+09:00"
  },
  {
    "start_datetime": "2026-04-10T14:00:00+09:00",
    "end_datetime": "2026-04-10T15:30:00+09:00"
  }
]
```

**에러 — date 파라미터 누락 (400)**

```json
{
  "error": "validation_error",
  "message": "date 파라미터가 필요합니다."
}
```

> `confirmed` 상태의 예약만 반환합니다. `rejected`, `cancelled`는 제외됩니다.

---

## URL 설계

### `config/urls.py`

```python
urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/v1/", include("reservations.urls")),
    # API 문서
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
```

### `reservations/urls.py`

```python
urlpatterns = [
    path("spaces/",                               SpaceListView.as_view()),
    path("reservations/",                         ReservationListCreateView.as_view()),
    path("admin/login/",                          AdminLoginView.as_view()),
    path("admin/reservations/",                   AdminReservationListView.as_view()),
    path("admin/reservations/<int:pk>/cancel/",   AdminReservationCancelView.as_view()),
    path("spaces/<int:pk>/reservations/",         SpaceReservationListView.as_view()),
]
```

---

## 인증 설계

| 엔드포인트 | 인증 |
|-----------|------|
| `GET /spaces/` | 불필요 |
| `GET /reservations/` | 불필요 |
| `POST /reservations/` | 불필요 |
| `POST /admin/login/` | 불필요 |
| `GET /admin/reservations/` | Token 필요 |
| `POST /admin/reservations/<id>/cancel/` | Token 필요 |

> `IsAuthenticated` + `TokenAuthentication`을 관리자 뷰에 적용합니다.
> Django superuser 계정을 settings에서 `ADMIN_USERNAME`, `ADMIN_PASSWORD` 환경변수로 초기 생성합니다.

---

## settings.py 핵심 설정

```python
INSTALLED_APPS = [
    # django 기본
    "django.contrib.admin",
    "django.contrib.auth",
    ...
    # 서드파티
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "drf_spectacular",
    # 로컬
    "reservations",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

DATABASES = {
    "default": dj_database_url.config(default=config("DATABASE_URL"))
}

CELERY_BROKER_URL = config("REDIS_URL")
CELERY_RESULT_BACKEND = config("REDIS_URL")

TIME_ZONE = "Asia/Seoul"
USE_TZ = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

---

## fixtures 구조 (`rooms.json`)

```json
[
  {
    "model": "reservations.building",
    "pk": 1,
    "fields": { "name": "본당", "description": null, "is_active": true }
  },
  {
    "model": "reservations.space",
    "pk": 1,
    "fields": { "building_id": 1, "name": "2층 세미나실 A", "floor": 2, "capacity": 20, "is_active": true }
  },
  ...
]
```

---

## 인프라 설계

### docker-compose.yml 서비스 구성

| 서비스 | 이미지 | 포트 | 의존 |
|--------|--------|------|------|
| `db` | postgres:16 | 5432 | — |
| `redis` | redis:7-alpine | 6379 | — |
| `api` | 로컬 빌드 | 8000 | db, redis |
| `worker` | 로컬 빌드 (api와 동일 이미지) | — | db, redis |
| `web` | 로컬 빌드 | 5173 | — |

> `api`와 `worker`는 `apps/api/`에 `Dockerfile` 추가 필요.

### apps/api/Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
```

---

## 테스트 설계 (`reservations/tests.py`)

### 구조

- 테스트 DB는 Django가 자동으로 생성/삭제 — 실서비스 DB에 영향 없음
- `BaseTestCase`에서 공통 픽스처(건물, 공간, 관리자 계정) 생성
- 각 테스트 클래스는 `BaseTestCase`를 상속

### 테스트 케이스 목록

#### `HasConflictTest` — 모델 메서드

| 케이스 | 기댓값 |
|--------|--------|
| 예약 없을 때 | `False` |
| 시간 겹칠 때 | `True` |
| 인접 시간 (끝나는 순간 = 시작) | `False` |
| 거절된 예약과 겹칠 때 | `False` (거절은 충돌 대상 아님) |
| 자기 자신과 비교 | `False` (self-exclusion) |
| 다른 공간의 같은 시간 | `False` |

#### `SpaceListViewTest` — `GET /api/v1/spaces/`

| 케이스 | 기댓값 |
|--------|--------|
| 활성 건물·공간 반환 | 200, 공간 포함 |
| 비활성 공간 제외 | 응답에 없음 |
| 비활성 건물 제외 | 응답에 없음 |

#### `ReservationCreateTest` — `POST /api/v1/reservations/`

| 케이스 | 기댓값 |
|--------|--------|
| 중복 없음 | 201, `status: confirmed` |
| 시간 중복 | 201, `status: rejected` |
| 거절돼도 레코드 저장 | DB에 `rejected` 1건 존재 |
| 종료 < 시작 | 400, `error: validation_error` |
| 30분 단위 아님 | 400, `error: validation_error` |

#### `ReservationListViewTest` — `GET /api/v1/reservations/`

| 케이스 | 기댓값 |
|--------|--------|
| 이름+연락처 일치 | 200, 해당 예약 반환 |
| 연락처 불일치 | 200, 빈 배열 |
| 파라미터 누락 | 400, `error: validation_error` |

#### `AdminLoginViewTest` — `POST /api/v1/admin/login/`

| 케이스 | 기댓값 |
|--------|--------|
| 올바른 계정 | 200, `token` 포함 |
| 틀린 비밀번호 | 401, `error: unauthorized` |

#### `AdminReservationListViewTest` — `GET /api/v1/admin/reservations/`

| 케이스 | 기댓값 |
|--------|--------|
| 토큰 있음 | 200, 전체 목록 |
| 토큰 없음 | 401 |
| `date` 필터 | 해당 날짜 예약만 |
| `status` 필터 | 해당 상태 예약만 |

#### `AdminReservationCancelViewTest` — `POST /api/v1/admin/reservations/<id>/cancel/`

| 케이스 | 기댓값 |
|--------|--------|
| 정상 취소 | 200, `status: cancelled` |
| `admin_note` 없이 취소 | 200 (선택 필드) |
| 이미 취소된 예약 | 400, `error: already_cancelled` |
| 존재하지 않는 예약 | 404, `error: not_found` |
| 토큰 없음 | 401 |

---

## 완료 기준 (Design 관점)

- [ ] 모델 3개 (`Building`, `Space`, `Reservation`) 정의 완료
- [ ] `Reservation.has_conflict()` 메서드로 중복 체크 로직 모델에 집중
- [ ] Serializer에서 자동 승인/거절 처리 (`create` 오버라이드)
- [ ] 뷰는 단순 위임 — 비즈니스 로직이 뷰에 없음
- [ ] 관리자 엔드포인트는 `TokenAuthentication`으로 보호
- [ ] Docker Compose로 로컬 전체 서비스 기동 가능
- [ ] `python manage.py test reservations` 전체 통과
