-- MySQL 초기화 스크립트
-- UTF-8 설정 및 기본 설정

-- 데이터베이스가 존재하지 않으면 생성
CREATE DATABASE IF NOT EXISTS email_reports CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 권한 설정 (환경 변수로 생성된 사용자에게 권한 부여)
GRANT ALL PRIVILEGES ON email_reports.* TO 'django_user'@'%';
FLUSH PRIVILEGES;

-- 기본 설정
USE email_reports;

-- 타임존 설정
SET time_zone = '+09:00';
