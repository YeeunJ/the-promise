# Phase 1.5.1 백엔드 Design

## 모델 설계

### Team (신규)

```python
class Team(models.Model):
    name         = models.CharField(max_length=100, unique=True)
    leader_phone = models.CharField(max_length=20)
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "teams"

    def __str__(self):
        return self.name
```

### Reservation (변경)

`is_deleted`, `deleted_at` 필드 추가.

```python
class Reservation(models.Model):
    # ... 기존 필드 동일 ...

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def has_conflict(self) -> bool:
        qs = Reservation.objects.filter(
            space=self.space,
            status=Reservation.Status.CONFIRMED,
            is_deleted=False,           # 소프트 삭제된 예약은 충돌 대상 제외
            start_datetime__lt=self.end_datetime,
            end_datetime__gt=self.start_datetime,
        )
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        return qs.exists()
```

> `is_deleted=True` 예약은 충돌 체크에서도 제외합니다.

---

## Serializer 설계

### TeamSerializer

```python
class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "name", "leader_phone"]
```

### SpaceAvailabilitySerializer (응답용)

```python
class OverlappingSlotSerializer(serializers.Serializer):
    start_datetime = serializers.DateTimeField()
    end_datetime   = serializers.DateTimeField()

class SpaceAvailabilitySerializer(serializers.Serializer):
    id                      = serializers.IntegerField()
    building                = BuildingSerializer()
    name                    = serializers.CharField()
    floor                   = serializers.IntegerField(allow_null=True)
    capacity                = serializers.IntegerField(allow_null=True)
    description             = serializers.CharField(allow_null=True)
    availability            = serializers.ChoiceField(choices=["full", "partial", "none"])
    overlapping_reservations = OverlappingSlotSerializer(many=True)
```

### SpaceAvailabilityQuerySerializer (입력 검증용)

```python
class SpaceAvailabilityQuerySerializer(serializers.Serializer):
    start_datetime   = serializers.DateTimeField()
    end_datetime     = serializers.DateTimeField()
    show_unavailable = serializers.ChoiceField(choices=["Y", "N"])
    building_id      = serializers.IntegerField(required=False)
    floor            = serializers.IntegerField(required=False)
    keyword          = serializers.CharField(required=False)

    def validate(self, data):
        if data["end_datetime"] <= data["start_datetime"]:
            raise serializers.ValidationError({
                "error": "validation_error",
                "message": "종료 일시는 시작 일시보다 늦어야 합니다.",
            })
        return data
```

### ReservationSerializer (변경)

`is_deleted` 필드는 응답에서 제외합니다. 기존 필드 목록 유지.

---

## 가용성 분류 로직

요청 시간대 `[S, E)`와 confirmed + not deleted 예약 `[rs, re)`의 겹침 조건:
`rs < E AND re > S`

| 분류 | 조건 |
|------|------|
| `full` | 겹치는 예약 없음 |
| `none` | `rs <= S AND re >= E`를 만족하는 예약이 하나 이상 존재 (전체 차단) |
| `partial` | 겹치는 예약은 있으나 `none` 조건 미해당 |

> `partial`인 경우 겹치는 예약의 `start_datetime`, `end_datetime` 목록을 함께 반환합니다.
> `none`인 경우도 겹치는 예약 목록을 반환합니다.

---

## View 설계

### TeamListView

```python
class TeamListView(APIView):
    def get(self, request):
        teams = Team.objects.filter(is_active=True)
        return Response(TeamSerializer(teams, many=True).data)
```

---

### SpaceAvailabilityView

```python
class SpaceAvailabilityView(APIView):
    def get(self, request):
        query_serializer = SpaceAvailabilityQuerySerializer(data=request.query_params)
        if not query_serializer.is_valid():
            return Response(..., status=400)

        data = query_serializer.validated_data
        S, E = data["start_datetime"], data["end_datetime"]
        show_unavailable = data["show_unavailable"] == "Y"

        # 공간 필터링
        spaces = Space.objects.filter(is_active=True).select_related("building")
        if "building_id" in data:
            spaces = spaces.filter(building_id=data["building_id"])
        if "floor" in data:
            spaces = spaces.filter(floor=data["floor"])
        if "keyword" in data:
            spaces = spaces.filter(name__icontains=data["keyword"])

        # 가용성 분류
        results = []
        for space in spaces:
            overlapping = list(
                Reservation.objects.filter(
                    space=space,
                    status=Reservation.Status.CONFIRMED,
                    is_deleted=False,
                    start_datetime__lt=E,
                    end_datetime__gt=S,
                ).values("start_datetime", "end_datetime")
            )

            if not overlapping:
                availability = "full"
            elif any(r["start_datetime"] <= S and r["end_datetime"] >= E for r in overlapping):
                availability = "none"
            else:
                availability = "partial"

            if availability == "none" and not show_unavailable:
                continue

            results.append({
                "id": space.id,
                "building": space.building,
                "name": space.name,
                "floor": space.floor,
                "capacity": space.capacity,
                "description": space.description,
                "availability": availability,
                "overlapping_reservations": overlapping if availability != "full" else [],
            })

        # 정렬: full → partial → none
        order = {"full": 0, "partial": 1, "none": 2}
        results.sort(key=lambda x: order[x["availability"]])

        return Response(SpaceAvailabilitySerializer(results, many=True).data)
```

---

### AdminReservationDeleteView (소프트 삭제)

```python
class AdminReservationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk, is_deleted=False)
        except Reservation.DoesNotExist:
            return Response(
                {"error": "not_found", "message": "예약을 찾을 수 없습니다."},
                status=404,
            )
        reservation.is_deleted = True
        reservation.deleted_at = timezone.now()
        reservation.save()
        return Response(status=204)
```

---

### ReservationTicketView

```python
class ReservationTicketView(APIView):
    def get(self, request, pk):
        name  = request.query_params.get("name")
        phone = request.query_params.get("phone")
        if not name or not phone:
            return Response(
                {"error": "validation_error", "message": "name과 phone 파라미터가 필요합니다."},
                status=400,
            )
        try:
            reservation = Reservation.objects.select_related("space__building").get(
                pk=pk, is_deleted=False
            )
        except Reservation.DoesNotExist:
            return Response({"error": "not_found", "message": "예약을 찾을 수 없습니다."}, status=404)

        if reservation.applicant_name != name or reservation.applicant_phone != phone:
            return Response(
                {"error": "forbidden", "message": "예약 정보가 일치하지 않습니다."},
                status=403,
            )

        image = generate_ticket_image(reservation)  # Pillow로 이미지 생성
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        return HttpResponse(buffer, content_type="image/png")
```

---

### 기존 View queryset 변경

`is_deleted=False` 필터를 아래 위치에 추가합니다.

| View | 변경 위치 |
|------|-----------|
| `ReservationListCreateView.get` | `Reservation.objects.filter(...)` |
| `AdminReservationListView.get` | `Reservation.objects.select_related(...)` |
| `SpaceReservationListView.get` | `Reservation.objects.filter(...)` |
| `AdminReservationCancelView.post` | `Reservation.objects.get(pk=pk)` |

---

## 티켓 이미지 생성 (`generate_ticket_image`)

### 사용 라이브러리

```
Pillow
qrcode[pil]
```

### 레이아웃 (600 × 900 px)

```
┌─────────────────────────────────────┐  y=0
│         THE PROMISE                 │  헤더 (배경: #1a1a2e, 텍스트: #e0e0e0)
│         [공간 이름]                  │  타이틀 (폰트 크게)
├─────────────────────────────────────┤  y=200
│  신청자      홍길동                   │
│  연락처      010-1234-5678           │
│  팀          청년부                   │
│  리더 연락처  010-9876-5432           │
│  목적        예배                     │  정보 영역 (배경: #16213e)
│  시작        2026-04-11 10:00        │
│  종료        2026-04-11 12:00        │
│  상태        승인됨                   │
│  확인일자    2026-04-11              │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤  점선 (tear line)
│            [QR코드]                  │  하단 영역 (배경: #0f3460)
│         예약번호 #{id}               │
└─────────────────────────────────────┘  y=900
```

### 색상 팔레트

| 요소 | 색상 |
|------|------|
| 헤더 배경 | `#1a1a2e` |
| 정보 영역 배경 | `#16213e` |
| QR 영역 배경 | `#0f3460` |
| 기본 텍스트 | `#e0e0e0` |
| 강조 텍스트 (공간명, 상태) | `#e94560` |
| 라벨 텍스트 | `#a0a0b0` |
| tear line | `#ffffff` (점선) |

### QR코드

```python
import qrcode

# TODO: 추후 예약 상세 페이지 URL로 변경 예정 (현재는 예약 ID만 인코딩)
qr_data = str(reservation.id)
qr_img = qrcode.make(qr_data)
```

### 폰트

`apps/api/reservations/static/fonts/NanumGothic.ttf` 번들.
PIL `ImageFont.truetype`으로 로드. 없을 경우 `ImageFont.load_default()` 폴백.

---

## API 설계

### GET `/api/v1/teams/`

활성화된 팀 목록 반환.

**응답 예시 (200)**

```json
[
  { "id": 1, "name": "청년부", "leader_phone": "01012345678" },
  { "id": 2, "name": "찬양팀", "leader_phone": "01098765432" }
]
```

---

### GET `/api/v1/spaces/availability/`

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `start_datetime` | datetime | Y | 조회 시작일시 (ISO 8601) |
| `end_datetime` | datetime | Y | 조회 종료일시 (ISO 8601) |
| `show_unavailable` | Y/N | Y | 완전 불가능한 방 포함 여부 |
| `building_id` | int | N | 건물 필터 |
| `floor` | int | N | 층 필터 |
| `keyword` | string | N | 공간 이름 포함 검색 |

**응답 예시 (200)**

```json
[
  {
    "id": 1,
    "building": { "id": 1, "name": "본당" },
    "name": "세미나실 A",
    "floor": 2,
    "capacity": 20,
    "description": null,
    "availability": "full",
    "overlapping_reservations": []
  },
  {
    "id": 2,
    "building": { "id": 1, "name": "본당" },
    "name": "세미나실 B",
    "floor": 2,
    "capacity": 30,
    "description": null,
    "availability": "partial",
    "overlapping_reservations": [
      {
        "start_datetime": "2026-04-11T09:00:00+09:00",
        "end_datetime": "2026-04-11T11:00:00+09:00"
      }
    ]
  },
  {
    "id": 3,
    "building": { "id": 1, "name": "본당" },
    "name": "대예배실",
    "floor": 1,
    "capacity": 500,
    "description": null,
    "availability": "none",
    "overlapping_reservations": [
      {
        "start_datetime": "2026-04-11T08:00:00+09:00",
        "end_datetime": "2026-04-11T18:00:00+09:00"
      }
    ]
  }
]
```

**에러 — 파라미터 오류 (400)**

```json
{
  "error": "validation_error",
  "message": "종료 일시는 시작 일시보다 늦어야 합니다."
}
```

---

### DELETE `/api/v1/admin/reservations/<id>/`

관리자 전용. 예약 소프트 삭제.

- 성공: `204 No Content`
- 이미 삭제된 예약 또는 없는 예약: `404 not_found`
- 토큰 없음: `401`

---

### GET `/api/v1/reservations/<id>/ticket/?name=홍길동&phone=01012345678`

예약 티켓 PNG 이미지 반환.

- 성공: `200 image/png`
- name/phone 누락: `400 validation_error`
- 예약 없음: `404 not_found`
- name/phone 불일치: `403 forbidden`

---

## URL 설계 변경

### `reservations/urls.py` (추가분)

```python
urlpatterns = [
    # 기존 유지
    path("spaces/",                                    SpaceListView.as_view()),
    path("reservations/",                              ReservationListCreateView.as_view()),
    path("admin/login/",                               AdminLoginView.as_view()),
    path("admin/reservations/",                        AdminReservationListView.as_view()),
    path("admin/reservations/<int:pk>/cancel/",        AdminReservationCancelView.as_view()),
    path("spaces/<int:pk>/reservations/",              SpaceReservationListView.as_view()),

    # 신규
    path("teams/",                                     TeamListView.as_view()),
    path("spaces/availability/",                       SpaceAvailabilityView.as_view()),
    path("admin/reservations/<int:pk>/",               AdminReservationDeleteView.as_view()),
    path("reservations/<int:pk>/ticket/",              ReservationTicketView.as_view()),
]
```

---

## 인증 설계 (추가분)

| 엔드포인트 | 인증 |
|-----------|------|
| `GET /teams/` | 불필요 |
| `GET /spaces/availability/` | 불필요 |
| `DELETE /admin/reservations/<id>/` | Token 필요 |
| `GET /reservations/<id>/ticket/` | 불필요 (name+phone 검증) |

---

## 의존성 추가 (`requirements.txt`)

```
Pillow
qrcode[pil]
```

---

## 테스트 설계

### `TeamListViewTest` — `GET /api/v1/teams/`

| 케이스 | 기댓값 |
|--------|--------|
| 활성 팀 반환 | 200, 팀 목록 |
| 비활성 팀 제외 | 응답에 없음 |

### `SpaceAvailabilityViewTest` — `GET /api/v1/spaces/availability/`

| 케이스 | 기댓값 |
|--------|--------|
| 예약 없는 공간 | `availability: full` |
| 일부 겹치는 공간 | `availability: partial`, slots 포함 |
| 전체 차단 공간 + show_unavailable=Y | `availability: none` 포함 |
| 전체 차단 공간 + show_unavailable=N | 응답에서 제외 |
| building_id 필터 | 해당 건물만 |
| floor 필터 | 해당 층만 |
| keyword 필터 | 이름 포함 공간만 |
| end <= start | 400 validation_error |
| 소프트 삭제된 예약은 충돌 대상 아님 | full로 분류 |

### `AdminReservationDeleteViewTest` — `DELETE /api/v1/admin/reservations/<id>/`

| 케이스 | 기댓값 |
|--------|--------|
| 정상 삭제 | 204, is_deleted=True |
| 이미 삭제된 예약 | 404 |
| 없는 예약 | 404 |
| 토큰 없음 | 401 |
| 삭제 후 일반 조회에서 미노출 | 조회 결과에 없음 |
| 삭제 후 관리자 조회에서 미노출 | 조회 결과에 없음 |

### `ReservationTicketViewTest` — `GET /api/v1/reservations/<id>/ticket/`

| 케이스 | 기댓값 |
|--------|--------|
| 정상 요청 | 200, image/png |
| name/phone 불일치 | 403 |
| name/phone 누락 | 400 |
| 없는 예약 | 404 |
| 소프트 삭제된 예약 | 404 |

---

## 완료 기준

- [ ] `Team` 모델 및 migration 완료
- [ ] `Reservation`에 `is_deleted`, `deleted_at` 필드 추가 및 migration 완료
- [ ] 기존 모든 queryset에 `is_deleted=False` 필터 적용
- [ ] `has_conflict()`에 `is_deleted=False` 필터 추가
- [ ] `GET /api/v1/teams/` 정상 동작
- [ ] `GET /api/v1/spaces/availability/` 3단계 정렬 정상 동작
- [ ] `DELETE /api/v1/admin/reservations/<id>/` 소프트 삭제 정상 동작
- [ ] `GET /api/v1/reservations/<id>/ticket/` PNG 반환 정상 동작
- [ ] `python manage.py test reservations` 전체 통과
