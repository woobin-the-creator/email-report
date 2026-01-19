# Docker 환경 설정 가이드

이 문서는 Email Report System의 Docker 환경 구성 및 사용법을 설명합니다.

---

## 📋 목차

1. [시스템 구성](#시스템-구성)
2. [사전 준비](#사전-준비)
3. [환경 설정](#환경-설정)
4. [실행 방법](#실행-방법)
5. [개발 워크플로우](#개발-워크플로우)
6. [트러블슈팅](#트러블슈팅)

---

## 🏗️ 시스템 구성

### 컨테이너 구조

```
┌─────────────────────────────────────────────┐
│              Nginx (Port 80)                │
│         Reverse Proxy & Load Balancer       │
└────────┬────────────────────────┬───────────┘
         │                        │
    ┌────▼─────┐           ┌──────▼──────┐
    │ Frontend │           │   Backend   │
    │  React   │           │   Django    │
    │ (Port 3000)          │  (Port 8000)│
    └──────────┘           └──────┬──────┘
                                  │
                           ┌──────▼──────┐
                           │   MySQL     │
                           │  Database   │
                           │ (Port 3306) │
                           └─────────────┘
```

### 서비스 목록

| 서비스 | 컨테이너명 | 포트 | 설명 |
|--------|-----------|------|------|
| nginx | email_report_nginx | 80 | 리버스 프록시 |
| frontend | email_report_frontend | 3000 | React 앱 |
| backend | email_report_backend | 8000 | Django API |
| db | email_report_db | 3306 | MySQL DB |

---

## 🔧 사전 준비

### 필수 소프트웨어

- **Docker**: 20.10 이상
- **Docker Compose**: 2.0 이상

### 설치 확인

```bash
docker --version
docker-compose --version
```

---

## ⚙️ 환경 설정

### 1. 환경 변수 파일 생성

```bash
cp .env.example .env
```

### 2. .env 파일 수정

```bash
# 개발 환경
DEBUG=True
SECRET_KEY=your-secret-key-here

# 프로덕션 환경
DEBUG=False
SECRET_KEY=use-strong-random-secret-key
```

**중요**: 프로덕션에서는 반드시 `SECRET_KEY`를 강력한 랜덤 값으로 변경하세요.

---

## 🚀 실행 방법

### 1. 전체 시스템 실행

```bash
# 모든 컨테이너 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

### 2. 개별 서비스 실행

```bash
# Backend만 재시작
docker-compose restart backend

# Frontend만 빌드 및 실행
docker-compose up -d --build frontend
```

### 3. 시스템 종료

```bash
# 컨테이너 중지
docker-compose stop

# 컨테이너 삭제
docker-compose down

# 볼륨까지 삭제 (주의: 데이터베이스 삭제됨)
docker-compose down -v
```

---

## 🛠️ 개발 워크플로우

### 초기 설정

```bash
# 1. 프로젝트 클론 후 환경 변수 설정
cp .env.example .env

# 2. 컨테이너 빌드 및 실행
docker-compose up -d --build

# 3. Django 마이그레이션
docker-compose exec backend python manage.py migrate

# 4. Django 슈퍼유저 생성
docker-compose exec backend python manage.py createsuperuser

# 5. 브라우저에서 접속
# - Frontend: http://localhost
# - Backend API: http://localhost/api/
# - Django Admin: http://localhost/admin/
```

### 코드 수정 시

#### Backend (Django)

```bash
# 마이그레이션 생성
docker-compose exec backend python manage.py makemigrations

# 마이그레이션 적용
docker-compose exec backend python manage.py migrate

# Django Shell 접속
docker-compose exec backend python manage.py shell
```

#### Frontend (React)

Vite의 HMR(Hot Module Replacement)이 자동으로 작동하므로 코드 수정 시 자동 반영됩니다.

```bash
# Frontend 로그 확인
docker-compose logs -f frontend

# Frontend 컨테이너 재시작 (필요 시)
docker-compose restart frontend
```

### 데이터베이스 관리

```bash
# MySQL 접속
docker-compose exec db mysql -u django_user -p email_reports

# 데이터베이스 백업
docker-compose exec db mysqldump -u root -p email_reports > backup.sql

# 데이터베이스 복원
docker-compose exec -T db mysql -u root -p email_reports < backup.sql
```

---

## 🐛 트러블슈팅

### 1. 포트 충돌

**증상**: "port is already allocated" 오류

**해결**:
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :80
lsof -i :3000
lsof -i :8000
lsof -i :3306

# .env 파일에서 포트 변경
NGINX_PORT=8080
MYSQL_PORT=3307
```

### 2. 컨테이너 빌드 실패

**증상**: "build failed" 오류

**해결**:
```bash
# Docker 캐시 삭제 후 재빌드
docker-compose build --no-cache
docker-compose up -d
```

### 3. 데이터베이스 연결 실패

**증상**: "Can't connect to MySQL server"

**해결**:
```bash
# 데이터베이스 헬스체크 확인
docker-compose ps

# 데이터베이스 로그 확인
docker-compose logs db

# 데이터베이스 재시작
docker-compose restart db
```

### 4. Static/Media 파일 404

**증상**: Static files not found

**해결**:
```bash
# Collectstatic 재실행
docker-compose exec backend python manage.py collectstatic --noinput

# Nginx 재시작
docker-compose restart nginx
```

### 5. Frontend HMR 작동 안 함

**증상**: 코드 수정이 반영되지 않음

**해결**:
```bash
# Frontend 컨테이너 재시작
docker-compose restart frontend

# 또는 node_modules 볼륨 재생성
docker-compose down
docker volume rm email-report_node_modules
docker-compose up -d --build
```

---

## 📊 유용한 명령어

### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 목록
docker-compose ps

# 리소스 사용량 확인
docker stats

# 컨테이너 내부 접속
docker-compose exec backend sh
docker-compose exec frontend sh
```

### 로그 확인

```bash
# 전체 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs frontend

# 실시간 로그 (tail -f)
docker-compose logs -f backend
```

### 볼륨 관리

```bash
# 볼륨 목록
docker volume ls

# 사용하지 않는 볼륨 삭제
docker volume prune

# 특정 볼륨 삭제
docker volume rm email-report_mysql_data
```

---

## 🔐 보안 주의사항

1. **프로덕션 환경**에서는 반드시:
   - `DEBUG=False` 설정
   - 강력한 `SECRET_KEY` 사용
   - `ALLOWED_HOSTS` 제한
   - 데이터베이스 비밀번호 변경

2. **.env 파일**은 절대 Git에 커밋하지 마세요
   - `.gitignore`에 포함되어 있는지 확인

3. **사내 환경**에서는:
   - `.env` 파일에 사내 전용 설정 추가
   - 네트워크 보안 정책 준수

---

*이 문서는 프로젝트 진행에 따라 업데이트됩니다.*
