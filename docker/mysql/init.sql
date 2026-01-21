-- MySQL 초기화 스크립트
-- UTF-8 설정 및 기본 설정

-- 데이터베이스가 존재하지 않으면 생성
CREATE DATABASE IF NOT EXISTS email_reports CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 및 권한 설정
-- MySQL 8.0에서는 CREATE USER가 필수
-- PyMySQL 호환성을 위해 mysql_native_password 사용
CREATE USER IF NOT EXISTS 'django_user'@'%' IDENTIFIED WITH mysql_native_password BY 'django_password';
GRANT ALL PRIVILEGES ON email_reports.* TO 'django_user'@'%';
FLUSH PRIVILEGES;

-- 기본 설정
USE email_reports;

-- 타임존 설정
SET time_zone = '+09:00';
