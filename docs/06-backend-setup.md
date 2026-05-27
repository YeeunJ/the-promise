# 06. 백엔드 개발 환경 세팅 및 실행

## 사전 준비

아래 도구가 설치되어 있어야 합니다.

- Python 3.12+
- Docker Desktop (실행 중이어야 함)
- Git

---

## 최초 세팅 (처음 한 번만)

### 1. 저장소 클론 및 브랜치 이동

```bash
git clone https://github.com/YeeunJ/the-promise.git
cd the-promise
git checkout develop
```

### 2. 환경변수 파일 생성

```bash
cp .env.example .env
```

`.env` 파일을 열어 값을 채워주세요.

```bash
SECRET_KEY=원하는-시크릿-키
DEBUG=True
DATABASE_URL=postgresql://thepromise:thepromise@localhost:5432/thepromise
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
ADMIN_USERNAME=admin
ADMIN_PASSWORD=원하는-비밀번호
```

> `DATABASE_URL`과 `REDIS_URL`은 Docker Compose 기본값과 맞춰져 있어 로컬 개발 시 그대로 써도 됩니다.

### 3. Python 가상환경 생성 및 패키지 설치

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. PostgreSQL 컨테이너 실행

```bash
cd ../../infra
docker compose up -d db
```

### 5. DB 마이그레이션

```bash
cd ../apps/api
source .venv/bin/activate
python manage.py migrate
```

### 6. 초기 공간 데이터 삽입 (건물 3개, 공간 44개)

```bash
python manage.py loaddata rooms.json
```

### 7. 관리자 계정 생성

```bash
python manage.py createsuperuser
```

---

## 서버 실행

```bash
cd apps/api
source .venv/bin/activate
python manage.py runserver
```

서버가 `http://localhost:8000` 에서 실행됩니다.

---

## API 문서 확인

서버 실행 후 브라우저에서 접속하세요.

| 주소 | 설명 |
|------|------|
| `http://localhost:8000/api/schema/swagger-ui/` | Swagger UI (Java Swagger와 동일한 형태) |
| `http://localhost:8000/api/schema/redoc/` | ReDoc (읽기 전용 문서) |
| `http://localhost:8000/django-admin/` | Django 관리자 화면 |

---

## 테스트 실행

```bash
cd apps/api
source .venv/bin/activate
python manage.py test reservations
```

테스트 DB는 실행 시 자동으로 생성되고 종료 시 삭제됩니다. 실서비스 DB에 영향 없음.

```
Ran 28 tests in ~10s

OK
```

---

## 자주 쓰는 명령어

```bash
# 모델 변경 후 마이그레이션
python manage.py makemigrations
python manage.py migrate

# DB 초기화 후 데이터 다시 넣기
python manage.py flush --no-input
python manage.py loaddata rooms.json

# Django shell 접속
python manage.py shell
```

---

## 전체 서비스 실행 (Docker Compose)

DB만이 아니라 API 서버, Celery worker까지 한번에 올리려면 `infra/` 에서 실행합니다.

```bash
cd infra
docker compose up -d
```

> 이 경우 `apps/api/Dockerfile` 기반으로 이미지를 빌드합니다.
> 코드 변경 시 `docker compose up -d --build` 로 재빌드가 필요합니다.

---

## 트러블슈팅

**`could not connect to server` 에러**
→ Docker Desktop이 실행 중인지, `docker compose up -d db` 가 완료됐는지 확인

**`ModuleNotFoundError: No module named 'django'`**
→ 가상환경이 활성화됐는지 확인 (`source .venv/bin/activate`)

**포트 5432 충돌**
→ 로컬에 PostgreSQL이 이미 설치되어 실행 중인 경우. `infra/docker-compose.yml` 에서 포트를 `"5433:5432"` 로 변경하고 `.env`의 `DATABASE_URL` 포트도 함께 수정
