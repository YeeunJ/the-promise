-- PostgreSQL 초기화 스크립트
-- docker-compose의 db 서비스가 처음 실행될 때 자동으로 한 번 실행됩니다.
-- DB와 유저는 POSTGRES_DB / POSTGRES_USER / POSTGRES_PASSWORD 환경변수로 자동 생성되므로
-- 이 파일에서는 별도 생성 없이 추가 설정만 합니다.

-- 타임존 설정
SET timezone = 'Asia/Seoul';
