# Phase 2.2 Report — 안정화 및 사용성 개선 (회고)

> **기간**: 2026-05-24 ~ 2026-06-05
> **범위**: `apps/web/**` 중심 + 백엔드/인프라 일부
> **성격**: Phase 2.1(progressive wizard, #11) 이후 누적된 개선·수정·배포 안정화 작업을 회고 정리
> **배포**: 기간 내 `main` 다회 배포 (Railway + Vercel)

## Executive Summary

Phase 2.1에서 예약 위저드를 수직 누적 공개 방식으로 재구성한 뒤, 실제 사용·배포 과정에서 드러난 UX 문제와 데이터 정합성 이슈를 다수 수정하고, 신규 사용성 기능(장소 평면도, 내 예약 페이지 개선)을 추가한 구간입니다. 개별 변경은 작은 PR 단위로 머지되었으며, 본 문서는 그 흐름을 한곳에 정리합니다.

> 개별 fix의 상세는 각 PR 설명과 테스트 코드에 있습니다. 본 report는 "무엇이·왜 바뀌었는지"의 묶음 색인입니다.

---

## 1. Frontend — 사용성 개선

| PR | 변경 | 핵심 내용 |
|----|------|-----------|
| #32 | 장소 선택 평면도 미리보기 | 장소 선택 시 신청 현황 카드 아래에 건물·층 평면도 표시(읽기 전용). 본당 1F 인라인 SVG, 선택 방 sage green 강조. 미등록 층은 "평면도 준비중입니다". `components/booking/floorplan/` 신설 |
| #30 | 내 예약 페이지 개선 + 관리자 취소 UX | 내 예약 목록 표시·동작 개선, 관리자 예약 취소 흐름 UX 수정 |
| #15 | 예약 신청 UX 개선 | 신청 실패 화면 추가, 절차 안내 카드 순서 조정 |
| #14 | 장소 신청 단계 재정렬 + 중복예약 차단 | 신청 단계 순서 재정렬, 중복 예약 차단 로직, 머지로 유실된 파일 복구 |
| (2026-05-27) | 가용성 처리 정교화 | partial 가용성 장소도 클릭 차단, 실제 예약 시간 표시 |
| (2026-05-27) | 단계 재정렬 후속 수정 | 단계 재정렬 후 이동 불가·신청현황 순서 불일치 수정 |
| (2026-05-26) | UI/UX 7가지 개선 | 신청 흐름 전반의 세부 UI/UX 개선 묶음 |

---

## 2. Backend — 데이터 정합성 수정

조직 구조 재정비(Pastor·Department·Team, 마이그레이션 0003) 이후 잔존 참조·조회 오류를 정리한 구간입니다. 스키마 자체는 `docs/02-db-schema.md`에 반영됨.

| PR | 변경 | 핵심 내용 |
|----|------|-----------|
| #23 | `tests.py` 현재 스키마로 재작성 | 구 스키마 기준 테스트를 현재 모델(팀/부서/교역자, soft delete)에 맞게 정정 |
| #21 | 티켓 이미지 필드 참조 수정 | 제거된 `applicant_team` 필드를 참조하던 QR 티켓 생성 코드 수정 |
| #19 | 비활성 팀 제외 | 예약 부서 조회 시 `is_active=false` 팀을 결과에서 제외 |

---

## 3. 인프라 · 배포 · CI

| PR / 커밋 | 변경 |
|-----------|------|
| #28 | pnpm 워크스페이스에 npm/yarn lockfile 유입 방지 |
| #27 | `pnpm-lock.yaml`에 lucide-react 동기화 |
| #25 | 검증 CI 추가 + 배포 디렉토리 수정 + 테스트 정정 |
| #17 | 머지 충돌로 유실된 `apps/api/Dockerfile` CMD(migrate+collectstatic+gunicorn) 복원 |
| #12 | Vercel 빌드 오류 수정 — shared 패키지 임포트를 인라인 상수로 교체 |
| (2026-05-24) | `dj_database_url.parse()`로 `DATABASE_URL` 파싱 오류 수정 |
| (2026-05-26) | Railway/Vercel 배포 워크플로우 추가 및 API 토큰 방식 전환 |

> **배포 메모**: GitHub Secrets 미설정으로 Actions 자동 배포는 실패 상태이며, 배포는 로컬 CLI(Railway/Vercel) 수동 실행으로 진행됩니다. (`#17`의 Dockerfile CMD 유실은 502 회귀를 유발했다가 복원됨)

---

## 4. 품질 게이트

- 각 PR은 머지 전 **검증 CI(Backend Django tests / Frontend build+tests / GitGuardian)** 통과를 조건으로 함 (#25에서 CI 도입).
- 프론트 변경은 vitest 단위 테스트 + Vite production build 통과 확인 후 머지.
- 평면도(#32)는 신규 테스트(`FloorPlanCard`, `SummaryRail` 보강) 추가 및 실제 dev 서버 시각 확인.

---

## 5. 관련 문서

| 문서 | 경로 |
|------|------|
| Phase 2.1 리포트 (직전 단계) | `docs/frontend/phase2.1-frontend-report.md` |
| DB 스키마 (조직 구조·soft delete 반영) | `docs/02-db-schema.md` |
| 프로젝트 구조 (현행화) | `docs/03-project-structure.md` |
| 배포 절차 (수동 CLI) | 메모리 `env-deploy-manual` 참조 |

> 본 구간의 변경은 작은 PR 단위로 분산 머지되어 별도 plan 문서 없이 진행되었습니다. 본 report가 사후 색인 역할을 합니다.
