# The Promise — 교회 공간 대여 시스템

교회 공간을 온라인으로 신청하고 관리하는 시스템입니다.

## 폴더 구조

pnpm workspaces 기반 모노레포입니다. `apps/api/`(Python)는 pnpm 범위 밖이며 폴더로만 존재합니다.

```
ThePromise/
├── apps/
│   ├── api/                ← Django + DRF + Celery (백엔드)
│   └── web/                ← React + TypeScript + Vite (프론트엔드)
├── packages/
│   └── shared/             ← 프론트엔드 공용 상수 (@the-promise/shared)
├── infra/
│   ├── docker-compose.yml  ← 로컬 전체 서비스 실행
│   └── init.sql            ← DB 초기 생성 스크립트
├── docs/                   ← 프로젝트 문서 모음
├── .env.example            ← 환경변수 항목 안내
├── package.json            ← pnpm workspace 루트
├── pnpm-workspace.yaml     ← workspace 패키지 경로 정의
├── Makefile                ← 자주 쓰는 명령어 모음
└── README.md
```

## 빠른 시작

```bash
# 1. 환경변수 설정
cp .env.example .env

# 2. 전체 서비스 실행
make dev

# 3. DB 마이그레이션 + 초기 공간 데이터 삽입 (최초 1회)
make migrate
make seed
```

| 서비스 | 주소 |
|--------|------|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000/api/v1 |
| Django Admin | http://localhost:8000/django-admin |

## Makefile 명령어

| 명령어 | 동작 |
|--------|------|
| `make dev` | 전체 서비스 실행 |
| `make stop` | 전체 서비스 종료 |
| `make logs` | 전체 로그 스트림 |
| `make migrate` | Django DB 마이그레이션 |
| `make seed` | 초기 공간 데이터 삽입 (rooms.json) |
| `make shell-api` | Django shell 접속 |
| `make shell-worker` | Celery worker 컨테이너 bash |

## 문서 목록

| 파일 | 내용 |
|------|------|
| [01-project-overview.md](docs/01-project-overview.md) | 프로젝트 목표, 개발 단계, 기술 스택 |
| [02-db-schema.md](docs/02-db-schema.md) | DB 테이블 설계 및 설계 이유 |
| [03-project-structure.md](docs/03-project-structure.md) | 폴더/파일 구조 및 역할 설명 |
| [04-coding-conventions.md](docs/04-coding-conventions.md) | Python/Django, React/TS, API 컨벤션 |
| [05-git-conventions.md](docs/05-git-conventions.md) | 브랜치 전략, 커밋 메시지, PR 규칙 |
| [06-backend-setup.md](docs/06-backend-setup.md) | 백엔드 개발 환경 세팅 및 실행 방법 |
| [07-frontend-setup.md](docs/07-frontend-setup.md) | 프론트엔드 개발 환경 세팅 및 실행 방법 |

처음 합류하는 팀원은 `01 → 02 → 03 → 04 → 05 → 06 → 07` 순서로 읽어주세요.
