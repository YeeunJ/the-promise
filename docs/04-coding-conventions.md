# 04. 코딩 컨벤션

팀원 모두가 같은 방식으로 코드를 작성해야 나중에 서로의 코드를 읽기 쉽습니다.
"왜 이렇게 쓰나?"가 명확하지 않은 규칙은 따르기 어렵기 때문에, 각 규칙에 이유를 함께 적었습니다.

---

## 공통

### 언어
- 코드(변수명, 함수명, 클래스명)는 **영어**로 작성
- 주석은 **한국어** 가능
- 커밋 메시지는 아래 git 컨벤션 참고

### 들여쓰기
- Python: 공백 4칸
- TypeScript/TSX: 공백 2칸

### 파일 끝 줄바꿈
- 모든 파일의 마지막에 빈 줄 1개를 추가합니다 (많은 에디터가 자동 처리)

---

## Python / Django

### 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수, 함수 | snake_case | `applicant_name`, `get_reservations()` |
| 클래스 | PascalCase | `Reservation`, `SpaceSerializer` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RESERVATION_HOURS = 12` |
| 파일명 | snake_case | `reservation_views.py` |

### 모델

```python
# Good: 메타 클래스로 테이블명과 정렬 기준 명시
class Reservation(models.Model):
    space = models.ForeignKey(Space, on_delete=models.PROTECT)
    applicant_name = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reservations"          # DB 테이블 이름을 명시적으로 지정
        ordering = ["-created_at"]         # 기본 정렬: 최신순
```

```python
# 상태값은 클래스 내부에 choices로 정의 (문자열을 직접 쓰지 않음)
class Status(models.TextChoices):
    PENDING   = "pending",   "대기 중"
    CONFIRMED = "confirmed", "승인됨"
    REJECTED  = "rejected",  "거절됨"
    CANCELLED = "cancelled", "취소됨"
```

> **왜 choices를 쓰나?** `status = "confirmd"` 처럼 오타가 나도 에러가 없습니다. choices를 쓰면 Django가 유효하지 않은 값을 막아줍니다.

### 뷰 (Views)

```python
# DRF의 ViewSet 또는 APIView를 사용
# 비즈니스 로직은 views.py에 직접 쓰지 않고, 모델 메서드나 별도 함수로 분리

# Good
class ReservationCreateView(APIView):
    def post(self, request):
        serializer = ReservationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation = serializer.save()
        return Response(ReservationSerializer(reservation).data, status=201)

# Bad: 뷰 안에 비즈니스 로직을 직접 작성
class ReservationCreateView(APIView):
    def post(self, request):
        # ... 중복 확인 쿼리 직접 작성 ...
        # ... 상태 결정 로직 직접 작성 ...
```

### 임포트 순서

```python
# 1. 표준 라이브러리
import os
from datetime import datetime

# 2. 서드파티 라이브러리 (Django, DRF 등)
from django.db import models
from rest_framework.views import APIView

# 3. 프로젝트 내부 모듈
from reservations.models import Space
```

---

## React / TypeScript

### 네이밍

프론트엔드 네이밍은 **대상에 따라 규칙이 다릅니다.** API 응답 데이터는 백엔드(Python)와 일치시키고, React 내부 로직은 JS/TS 관례를 따릅니다.

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일/함수 | PascalCase | `ReservationForm.tsx`, `function ReservationForm()` |
| React state, 이벤트 핸들러, 일반 변수/함수 | camelCase | `isLoading`, `handleSubmit()` |
| 상수 | UPPER_SNAKE_CASE | `TIME_SLOT_MINUTES`, `RESERVATION_STATUS` |
| 타입/인터페이스 이름 | PascalCase | `Reservation`, `ReservationFormProps` |
| **타입/인터페이스 필드** | **snake_case** | `applicant_name`, `start_datetime` |
| CSS 클래스 | kebab-case | `reservation-form`, `submit-button` |

> **왜 타입 필드만 snake_case인가?** 백엔드 API 응답을 그대로 매핑하기 때문입니다. 변환 로직 없이 응답을 바로 타입으로 쓸 수 있습니다.

> **왜 state, 이벤트 핸들러는 camelCase인가?** React 자체가 camelCase 기반입니다 (`useState`, `onClick`, `onChange` 등). 이 부분까지 snake_case로 바꾸면 React 생태계와 충돌하고 오히려 혼란이 생깁니다.

### 파일 확장자

| 용도 | 확장자 |
|------|--------|
| React 컴포넌트 | `.tsx` |
| 일반 TypeScript (유틸, 상수 등) | `.ts` |

### 타입 정의

API 응답 타입은 백엔드 필드명(snake_case)과 일치시켜 정의합니다.

```typescript
// 예약 신청 요청 타입: 폼에서 백엔드로 보내는 데이터
interface ReservationFormData {
  space: number;          // 공간 ID (space_id가 아닌 space)
  applicant_name: string;
  applicant_phone: string;
  applicant_team: string;
  leader_phone: string;   // 책임자 연락처
  headcount: number;      // 예상 인원
  purpose: string;
  start_datetime: string; // ISO 8601 (예: "2026-04-10T13:00:00+09:00")
  end_datetime: string;
}

// API 응답 타입: 백엔드 필드명 그대로 snake_case
interface Reservation {
  id: number;
  applicant_name: string;
  applicant_phone: string;
  applicant_team: string;
  leader_phone: string;
  headcount: number;
  space: Space;
  start_datetime: string;  // ISO 8601
  end_datetime: string;
  status: 'confirmed' | 'rejected' | 'cancelled' | 'pending';
  admin_note: string | null;
  created_at: string;
}

interface Building {
  id: number;
  name: string;
  description: string | null;
}

interface Space {
  id: number;
  building: Building;     // nested 객체 (building_name 문자열이 아님)
  name: string;
  floor: number | null;
  capacity: number | null;
  description: string | null;
}

// GET /api/v1/spaces/ 응답 타입: 건물별 공간 목록
interface BuildingWithSpaces extends Building {
  spaces: Space[];
}
```

### 컴포넌트 작성

```tsx
// props 타입을 interface로 명시 + 구조분해
interface ReservationCardProps {
  reservation: Reservation;  // API 응답 타입 그대로 전달
}

function ReservationCard({ reservation }: ReservationCardProps) {
  // 내부 변수/로직은 camelCase
  const formattedDate = formatDatetime(reservation.start_datetime);
  const isConfirmed = reservation.status === 'confirmed';

  return (
    <div className="reservation-card">
      <span>{reservation.applicant_name}</span>
      <span>{formattedDate}</span>
    </div>
  );
}

// Bad: props 타입 없음
function ReservationCard(props: any) {
  return <div>{props.applicant_name}</div>;
}
```

### API 호출

API 호출은 각 페이지/컴포넌트 파일 안에서 직접 작성합니다.

```tsx
// pages/ReservationPage.tsx

function ReservationPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchReservations(name: string, phone: string) {
    setIsLoading(true);
    try {
      const response = await axios.get<Reservation[]>(
        `${import.meta.env.VITE_API_BASE_URL}/reservations/`,
        { params: { name, phone } }
      );
      setReservations(response.data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(formData: ReservationFormData) {
    const response = await axios.post<Reservation>(
      `${import.meta.env.VITE_API_BASE_URL}/reservations/`,
      formData
    );
    return response.data;
  }

  // ...
}
```

> **`import.meta.env.VITE_API_BASE_URL`이란?** Vite에서 환경변수를 읽는 방법입니다. `process.env`는 Node.js 전용이라 Vite 프로젝트에서는 동작하지 않습니다. `VITE_` 접두사가 있는 변수만 브라우저에 노출됩니다.

### 파일 구조

- 컴포넌트 1개당 파일 1개
- 한 파일이 200줄을 넘으면 분리를 고려

---

## API 응답 형식

백엔드 API는 아래 형식을 통일해서 응답합니다.

### 성공 응답

```json
{
  "id": 1,
  "applicant_name": "홍길동",
  "space": { "id": 3, "name": "2층 세미나실 A" },
  "start_datetime": "2025-04-01T10:00:00+09:00",
  "end_datetime": "2025-04-01T12:00:00+09:00",
  "status": "confirmed",
  "created_at": "2025-03-26T09:00:00+09:00"
}
```

### 에러 응답

```json
{
  "error": "time_conflict",
  "message": "해당 시간에 이미 예약이 있습니다."
}
```

> **에러 코드(`error`)를 별도로 두는 이유**: 특정 에러에만 다른 처리를 할 때 `message` 문자열 대신 `error` 코드를 기준으로 분기하면 더 안정적입니다.

### 날짜/시간 형식

- 항상 **ISO 8601 + timezone** 형식: `2025-04-01T10:00:00+09:00`
- 프론트엔드에서 사용자에게 보여줄 때는 `utils/` 의 포맷 함수를 사용

---

## 하지 말아야 할 것

| 하지 말 것 | 이유 |
|-----------|------|
| `console.log` 를 커밋에 포함 | 운영 환경 로그 오염 |
| 비밀번호, API 키를 코드에 직접 작성 | 보안 사고 위험 |
| 한 함수에 너무 많은 일을 몰아넣기 | 읽기 어렵고, 테스트하기 어려움 |
| 영어/한국어 변수명 혼용 | 일관성 저하 |
| `any` 타입 사용 | TypeScript를 쓰는 의미가 없어짐. 모르면 `unknown` 후 타입 좁히기 |
