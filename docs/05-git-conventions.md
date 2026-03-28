# 05. Git 컨벤션

2명이 함께 작업할 때 코드가 뒤섞이지 않도록 브랜치, 커밋, PR 규칙을 정합니다.

---

## 브랜치 전략

GitHub Flow를 기반으로, `develop` 브랜치를 추가한 구조를 사용합니다.

```
main
 └── develop
       ├── feature/reservation-form
       ├── feature/admin-calendar
       ├── fix/phone-validation
       └── docs/db-schema
```

### 브랜치 종류

| 브랜치 | 역할 | 생성 기준 | 머지 대상 |
|--------|------|----------|----------|
| `main` | 실제 서비스 배포본 | 처음 1회 생성 | 배포 시에만 `develop` → `main` |
| `develop` | 개발 통합 브랜치 | 처음 1회 생성 | 각 feature/fix 브랜치 머지 |
| `feature/...` | 새 기능 개발 | 작업 시작할 때 | `develop` |
| `fix/...` | 버그 수정 | 버그 발견 시 | `develop` |
| `docs/...` | 문서 작업 | 문서 작성 시 | `develop` |

### 브랜치 이름 규칙

```
{타입}/{간단한-설명}
```

- 영어 소문자, 단어는 하이픈(`-`)으로 연결
- 너무 길지 않게 (30자 이내 권장)

```bash
# Good
feature/reservation-form
feature/admin-calendar
fix/duplicate-booking-check
docs/api-spec

# Bad
feature/예약폼만들기         # 한국어 X
feature/make-reservation-form-page-with-validation  # 너무 김
myBranch                    # 타입 없음
```

### 브랜치 작업 흐름

```bash
# 1. develop에서 최신 코드 받기
git checkout develop
git pull origin develop

# 2. 내 작업 브랜치 만들기
git checkout -b feature/reservation-form

# 3. 작업 후 커밋
git add .
git commit -m "feat: 예약 신청 폼 UI 구현"

# 4. PR 올리기 전에 develop 최신화 (충돌 방지)
git fetch origin
git rebase origin/develop

# 5. GitHub에 push
git push origin feature/reservation-form

# 6. GitHub에서 PR 생성 (develop 방향으로)
```

---

## 커밋 메시지

### 형식

```
{타입}: {변경 내용 요약}

(선택) 더 자세한 설명이 필요하면 한 줄 띄우고 작성
```

### 타입 목록

| 타입 | 언제 쓰나 | 예시 |
|------|----------|------|
| `feat` | 새 기능 추가 | `feat: 예약 신청 폼 구현` |
| `fix` | 버그 수정 | `fix: 중복 예약 시 오류 메시지 미표시 수정` |
| `docs` | 문서 수정 | `docs: DB 스키마 설명 추가` |
| `style` | 코드 포맷, 세미콜론 등 (로직 변경 없음) | `style: 들여쓰기 정리` |
| `refactor` | 동작은 그대로, 코드 구조 개선 | `refactor: 예약 생성 로직을 서비스 함수로 분리` |
| `chore` | 빌드 설정, 패키지 추가 등 | `chore: axios 패키지 추가` |

### 좋은 커밋 메시지 예시

```
feat: 예약 신청 폼 UI 구현

- 신청자 이름, 연락처, 팀, 공간 선택, 목적 입력 필드 포함
- 공간 선택은 건물 → 공간 순서로 필터링
```

```
fix: 시간 중복 판단 로직 오류 수정

종료시간과 시작시간이 정확히 일치하는 경우(연속 예약)를
중복으로 잘못 판단하는 버그 수정
```

### 하지 말아야 할 커밋 메시지

```
# Bad: 무슨 내용인지 모름
수정
fix
작업중
asdf

# Bad: 한 커밋에 여러 작업이 섞임
feat: 폼 구현 + 중복 체크 + 관리자 페이지 + 스타일 수정
```

> **커밋을 작게 하는 이유**: 나중에 "이 코드가 왜 생겼지?"를 추적할 때 큰 커밋 하나보다 작은 커밋 여러 개가 훨씬 찾기 쉽습니다. 또한 코드 리뷰도 작은 단위가 더 잘 됩니다.

---

## Pull Request (PR)

### PR을 올리는 기준

- 기능 하나, 또는 버그 하나가 완성되었을 때
- 절대 `main`에 직접 push하지 않습니다
- `develop`에도 직접 push하지 않습니다 — 반드시 PR로 머지

### PR 제목

```
{타입}: {변경 내용 요약}
```

커밋 메시지 형식과 동일하게 작성합니다.

```
feat: 예약 신청 폼 UI 구현
fix: 중복 예약 시 오류 메시지 미표시 수정
```

### PR 본문 템플릿

PR을 올릴 때 아래 내용을 채워서 작성합니다.

```markdown
## 작업 내용
<!-- 무엇을 만들었는지/고쳤는지 간단히 설명 -->

## 변경 사항
- 변경 1
- 변경 2

## 확인 방법
<!-- 리뷰어가 어떻게 테스트해볼 수 있는지 -->
1. ...
2. ...

## 관련 이슈
<!-- 해당하는 경우 -->
closes #이슈번호
```

### 리뷰 규칙

| 규칙 | 내용 |
|------|------|
| 최소 승인 수 | 1명 이상의 팀원 승인 후 머지 |
| 리뷰 기한 | PR 올린 후 24시간 내에 리뷰 시작 |
| 머지 방법 | Squash and merge 권장 (커밋 히스토리 정리) |

> **Squash and merge란?** feature 브랜치에서 작업하면서 생긴 "작업중", "수정" 같은 커밋들을 하나로 합쳐서 develop에 머지하는 방식입니다. develop 브랜치의 히스토리가 깔끔해집니다.

### 리뷰어 코멘트 기준

| 접두어 | 의미 |
|--------|------|
| `[필수]` | 반드시 수정해야 머지 가능 |
| `[제안]` | 수정하면 좋지만 머지는 가능 |
| `[질문]` | 이해가 안 되어서 물어보는 것 |

---

## .gitignore 주요 항목

아래 파일들은 절대 git에 올리지 않습니다.

```
# 환경변수 (비밀 정보 포함)
.env
.env.local

# Python
__pycache__/
*.pyc
venv/
.venv/

# Node
node_modules/

# 에디터 설정
.vscode/
.idea/

# OS 파일
.DS_Store
Thumbs.db
```

---

## 요약: 작업 흐름 한눈에 보기

```
develop 최신화
    ↓
feature/내작업 브랜치 생성
    ↓
작업 + 작은 단위로 커밋
    ↓
develop 최신화 후 rebase
    ↓
GitHub에 push
    ↓
PR 생성 (develop 방향)
    ↓
팀원 1명 이상 리뷰 + 승인
    ↓
Squash and merge → develop
    ↓
(배포 시) develop → main PR
```
