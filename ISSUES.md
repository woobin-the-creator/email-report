# 프로젝트 이슈 목록

이 문서는 코드 리뷰 및 개발 과정에서 발견된 이슈들을 추적합니다.

---

## 🚨 Critical (즉시 수정 필요)

### #1 Nginx 보안 헤더 누락
**파일**: `docker/nginx/conf.d/default.conf`
**심각도**: Critical
**상태**: Open

**문제**:
- XSS, Clickjacking 등의 공격에 취약
- X-Frame-Options, X-Content-Type-Options, CSP 등 보안 헤더가 없음

**수정 방안**:
```nginx
# 모든 location 블록에 추가
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

**예상 소요 시간**: 5분

---

### #2 CORS Wildcard 설정
**파일**: `docker/nginx/conf.d/default.conf:37`
**심각도**: Critical
**상태**: Open

**문제**:
- `Access-Control-Allow-Origin: *`로 모든 도메인 허용
- 보안상 매우 위험

**수정 방안**:
```nginx
# Nginx에서 CORS 헤더 제거하고 Django에서만 처리
# 라인 37-40 삭제
```

**예상 소요 시간**: 5분

---

### #3 Root 사용자로 컨테이너 실행
**파일**: `backend/Dockerfile`
**심각도**: Critical
**상태**: Open

**문제**:
- Django 앱이 root 권한으로 실행되어 보안 취약
- 컨테이너 탈출 시 호스트 시스템 위험

**수정 방안**:
```dockerfile
# 라인 26 이후 추가
RUN addgroup --system django && \
    adduser --system --ingroup django django && \
    chown -R django:django /app

USER django
```

**예상 소요 시간**: 10분

---

### #4 약한 비밀번호 기본값
**파일**: `docker-compose.yml`, `.env.example`
**심각도**: Critical
**상태**: Open

**문제**:
- `rootpassword`, `django_password` 등 약한 기본값
- 프로덕션 환경에서 그대로 사용될 위험

**수정 방안**:
```yaml
# docker-compose.yml에서 기본값 제거
MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:?ERROR: MYSQL_ROOT_PASSWORD not set}
SECRET_KEY: ${SECRET_KEY:?ERROR: SECRET_KEY not set}
```

```bash
# .env.example에 경고 추가
SECRET_KEY=CHANGE_THIS_IN_PRODUCTION_USE_DJANGO_SECRET_KEY_GENERATOR
MYSQL_ROOT_PASSWORD=CHANGE_THIS_STRONG_PASSWORD_REQUIRED
```

**예상 소요 시간**: 2분

**합계**: **4개 Critical 이슈, 예상 수정 시간 22분**

---

## ⚠️ High Priority

### #5 MySQL 포트 외부 노출
**파일**: `docker-compose.yml:17-18`
**심각도**: High
**상태**: Open

**문제**:
- 3306 포트가 호스트에 노출됨
- 내부 네트워크만 사용하면 충분

**수정 방안**:
```yaml
# ports 섹션 제거 또는 주석 처리
# ports:
#   - "${MYSQL_PORT:-3306}:3306"
```

---

### #6 Python 패키지 버전 고정 부족
**파일**: `backend/requirements.txt`
**심각도**: High
**상태**: Open

**문제**:
- 상한만 지정되어 재현 가능성 낮음
- `Django>=4.2,<5.0` → 4.2.x의 어느 버전인지 불확실

**수정 방안**:
```txt
Django==4.2.9
djangorestframework==3.14.0
mysqlclient==2.2.4
django-cors-headers==4.3.1
gunicorn==21.2.0
python-dotenv==1.0.0
django-crontab==0.7.1
pytz==2023.3.post1
python-dateutil==2.8.2
```

---

### #7 중요 Django 패키지 누락
**파일**: `backend/requirements.txt`
**심각도**: High
**상태**: Open

**문제**:
- 보안 및 프로덕션 필수 패키지 누락

**수정 방안**:
```txt
# 추가 필요 패키지
django-environ>=0.11.2  # 환경 변수 관리
whitenoise>=6.6.0      # Static file serving
django-health-check>=3.18.0  # Health check endpoint
# sentry-sdk>=1.39.0     # 에러 추적 (선택)
```

---

### #8 Backend Health Check 누락
**파일**: `docker-compose.yml` (backend 서비스)
**심각도**: High
**상태**: Open

**문제**:
- DB는 있지만 backend, frontend, nginx에는 health check 없음
- 컨테이너 상태 모니터링 불가

**수정 방안**:
```yaml
# backend 서비스에 추가
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**합계**: **4개 High Priority 이슈**

---

## 📌 Medium Priority

### #9 매 컨테이너 시작 시 Migration 실행
**파일**: `docker-compose.yml:34-37`
**심각도**: Medium
**상태**: Open

**문제**:
- 매번 migrate/collectstatic 실행하여 비효율적
- Scale-out 시 동시 실행 문제

**수정 방안**:
- entrypoint.sh 스크립트로 조건부 실행
- 환경 변수로 제어 (`RUN_MIGRATIONS=true/false`)

---

### #10 Nginx Rate Limiting 없음
**파일**: `docker/nginx/conf.d/default.conf`
**심각도**: Medium
**상태**: Open

**문제**:
- DDoS 공격에 취약
- API 과다 호출 방지 불가

**수정 방안**:
```nginx
# nginx.conf에 추가
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# default.conf location /api/에 적용
limit_req zone=api_limit burst=20 nodelay;
```

---

### #11 Frontend Dockerfile Stage 불일치
**파일**: `frontend/Dockerfile`, `docker-compose.yml`
**심각도**: Medium
**상태**: Open

**문제**:
- Multi-stage build는 있지만 docker-compose에서 target 미지정

**수정 방안**:
```yaml
frontend:
  build:
    target: development  # 또는 production
```

---

### #12 Gunicorn Worker 수 하드코딩
**파일**: `backend/Dockerfile`
**심각도**: Medium
**상태**: Open

**문제**:
- 모든 환경에서 3 workers 고정
- CPU 코어 수에 따라 조정 필요

**수정 방안**:
```dockerfile
CMD ["sh", "-c", "gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3}"]
```

**합계**: **4개 Medium Priority 이슈**

---

## 💡 Low Priority (개선 권장)

### #13 로깅 설정 부족
**파일**: `docker-compose.yml`
**심각도**: Low
**상태**: Open

**수정 방안**:
```yaml
backend:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
```

---

### #14 Docker Compose 버전 표기 Deprecated
**파일**: `docker-compose.yml:1`
**심각도**: Low
**상태**: Open

**문제**:
- `version: '3.8'`은 Compose V2에서 deprecated

**수정 방안**:
```yaml
# version 키 제거
# version: '3.8'  <- 삭제
services:
  ...
```

---

### #15 Nginx Gzip 최적화
**파일**: `docker/nginx/nginx.conf`
**심각도**: Low
**상태**: Open

**수정 방안**:
```nginx
gzip_min_length 1000;
gzip_buffers 16 8k;
gzip_disable "msie6";
```

---

## 📊 이슈 통계

| 심각도 | 개수 | 예상 수정 시간 |
|--------|------|---------------|
| Critical | 4 | 22분 |
| High | 4 | 1시간 |
| Medium | 4 | 2시간 |
| Low | 3 | 30분 |
| **합계** | **15개** | **~4시간** |

---

## 🎯 권장 수정 로드맵

### Phase 1: 즉시 수정 (22분)
- [ ] #1 Nginx 보안 헤더 추가
- [ ] #2 CORS wildcard 제거
- [ ] #3 Backend non-root user 설정
- [ ] #4 약한 비밀번호 기본값 제거

### Phase 2: 1주일 내 (1시간)
- [ ] #5 MySQL 포트 노출 제거
- [ ] #6 Python 패키지 버전 고정
- [ ] #7 필수 Django 패키지 추가
- [ ] #8 Health checks 추가

### Phase 3: 2주일 내 (2시간)
- [ ] #9 Migration 실행 로직 개선
- [ ] #10 Rate limiting 설정
- [ ] #11 Frontend Dockerfile target 명시
- [ ] #12 Gunicorn 설정 유연화

### Phase 4: 지속 개선 (30분)
- [ ] #13 로깅 설정
- [ ] #14 Docker Compose 버전 제거
- [ ] #15 Nginx Gzip 최적화

---

## 📝 프로덕션 체크리스트

배포 전 반드시 확인:

### 보안
- [ ] 모든 Critical 이슈 해결
- [ ] SSL/TLS 인증서 설정
- [ ] 강력한 비밀번호 사용
- [ ] Django SECRET_KEY 변경
- [ ] DEBUG=False 설정

### 성능
- [ ] Gunicorn workers 최적화
- [ ] Nginx gzip 압축 확인
- [ ] Static files CDN 고려

### 모니터링
- [ ] Health checks 작동 확인
- [ ] 로그 수집 설정
- [ ] 에러 추적 (Sentry 등)

### 백업
- [ ] MySQL 백업 전략 수립
- [ ] Volume 백업 스크립트

---

*이 문서는 이슈 해결 시 지속적으로 업데이트됩니다.*
*마지막 업데이트: 2026-01-18 (Docker 환경 구성 코드 리뷰)*
