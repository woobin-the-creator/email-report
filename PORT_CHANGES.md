# 포트 번호 변경 내역

프로젝트의 모든 포트 번호가 변경되었습니다.

## 📊 변경 전후 비교

| 서비스 | 변경 전 | 변경 후 |
|--------|---------|---------|
| **Nginx** (메인 접속) | 80 | **10003** |
| **Django Backend** | 8000 | **10004** |
| **React Frontend** (Vite) | 3000 | **10005** |
| **MySQL Database** | 3306 | **3308** |

---

## 🔧 수정된 파일 목록

### 1. Docker 관련 설정
- ✅ `docker-compose.yml`
  - Nginx: `80:80` → `10003:80`
  - Backend: `8000:8000` → `10004:10004`
  - Frontend: `3000:3000` → `10005:10005`
  - MySQL: `3306:3306` → `3308:3306`
  - CORS 환경 변수 업데이트

### 2. Backend (Django)
- ✅ `backend/Dockerfile`
  - EXPOSE 8000 → EXPOSE 10004
  - gunicorn bind: 0.0.0.0:8000 → 0.0.0.0:10004
- ✅ `backend/config/settings.py`
  - CORS_ALLOWED_ORIGINS 기본값 업데이트

### 3. Frontend (React + Vite)
- ✅ `frontend/Dockerfile`
  - EXPOSE 3000 → EXPOSE 10005
- ✅ `frontend/vite.config.ts`
  - port: 3000 → port: 10005

### 4. Nginx 설정
- ✅ `docker/nginx/conf.d/default.conf`
  - upstream backend: backend:8000 → backend:10004
  - upstream frontend: frontend:3000 → frontend:10005

### 5. 환경 변수 및 문서
- ✅ `.env.example`
  - MYSQL_PORT: 3306 → 3308
  - NGINX_PORT: 80 → 10003
  - VITE_API_BASE_URL: http://localhost:8000 → http://localhost:10004
  - CORS_ALLOWED_ORIGINS 업데이트
- ✅ `API_TEST_GUIDE.md` - 모든 curl 예시 포트 업데이트
- ✅ `SWAGGER_GUIDE.md` - 모든 접속 URL 포트 업데이트

---

## 🌐 새로운 접속 주소

### Nginx를 통한 접속 (프로덕션)
```
http://localhost:10003/                  - React 앱
http://localhost:10003/api/              - Django API
http://localhost:10003/admin/            - Django Admin
```

### 직접 접속 (개발)
```
http://localhost:10004/api/docs/         - Swagger UI
http://localhost:10004/api/redoc/        - ReDoc
http://localhost:10004/api/schema/       - OpenAPI Schema
http://localhost:10004/admin/            - Django Admin

http://localhost:10005/                  - React 개발 서버 (Vite)

mysql://localhost:3308/                  - MySQL Database
```

---

## 🚀 적용 방법

### 1. 기존 컨테이너 정리 (필수)
```bash
cd /home/user/email-report

# 기존 컨테이너 중지 및 제거
docker compose down

# 볼륨 유지 (데이터 보존)
# 또는 완전 초기화: docker compose down -v
```

### 2. 이미지 재빌드
```bash
# 변경된 Dockerfile 반영
docker compose build --no-cache
```

### 3. 컨테이너 실행
```bash
# 새 포트로 컨테이너 시작
docker compose up -d
```

### 4. 확인
```bash
# 컨테이너 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f

# 포트 바인딩 확인
docker compose ps --format "table {{.Name}}\t{{.Ports}}"
```

### 5. 서비스 접속 테스트
```bash
# Nginx
curl http://localhost:10003/health

# Backend API
curl http://localhost:10004/api/docs/

# Frontend (브라우저)
open http://localhost:10005/

# MySQL
mysql -h 127.0.0.1 -P 3308 -u django_user -p
```

---

## 🐛 문제 해결

### "port is already allocated" 에러
```bash
# 포트 사용 중인 프로세스 확인 (Linux/Mac)
lsof -i :10003
lsof -i :10004
lsof -i :10005
lsof -i :3308

# 프로세스 종료
kill -9 <PID>

# 또는 Docker 완전 재시작
docker compose down
docker compose up -d
```

### CORS 에러
- Frontend에서 Backend API 호출 시 CORS 에러 발생하면:
  ```bash
  # .env 파일 생성 또는 수정
  CORS_ALLOWED_ORIGINS=http://localhost:10005,http://localhost:10003

  # 컨테이너 재시작
  docker compose restart backend
  ```

### API 호출 실패 (404)
- Frontend의 API base URL 확인:
  ```bash
  # .env 파일 확인
  VITE_API_BASE_URL=http://localhost:10004

  # 컨테이너 재빌드
  docker compose build frontend
  docker compose up -d frontend
  ```

---

## 📝 주의사항

### 1. 환경 변수 우선순위
```
1. .env 파일 (최우선)
2. docker-compose.yml의 기본값
3. settings.py의 하드코딩 값
```

### 2. 캐시 문제
- 포트 변경 후에는 반드시 `--no-cache` 옵션으로 재빌드
- 브라우저 캐시도 삭제 (Ctrl+Shift+R)

### 3. 방화벽 설정
내부 폐쇄망 환경에서 포트 개방 필요 시:
```bash
# 방화벽 포트 개방 (Linux 예시)
sudo firewall-cmd --permanent --add-port=10003/tcp
sudo firewall-cmd --permanent --add-port=10004/tcp
sudo firewall-cmd --permanent --add-port=10005/tcp
sudo firewall-cmd --permanent --add-port=3308/tcp
sudo firewall-cmd --reload
```

---

## 🔄 롤백 방법

포트 변경을 되돌리려면:
```bash
# 이전 커밋으로 복원
git log --oneline | head -5  # 커밋 목록 확인
git revert <commit-hash>      # 포트 변경 커밋 되돌리기

# 또는 직접 수정
# 위 "수정된 파일 목록"의 역순으로 포트 번호 원복
```

---

**변경 날짜:** 2025-01-21
**변경 사유:** 포트 번호 커스터마이징 (사용자 요청)
**테스트 상태:** ⬜ 미완료 (Docker 환경 테스트 필요)
