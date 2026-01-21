# REST API 테스트 가이드

REST API 구현이 완료되었습니다. 이 가이드를 따라 Docker 환경에서 API를 테스트하세요.

---

## 1. 구현 완료 내역

### ✅ Serializers (직렬화)
- `/backend/reports/serializers.py` (276줄)
  - ReportTemplateSerializer
  - ReportTemplateListSerializer
  - GeneratedReportSerializer

- `/backend/data_sources/serializers.py` (308줄)
  - DataSourceSerializer
  - DataSourceListSerializer
  - DataQuerySerializer

### ✅ Views (뷰)
- `/backend/reports/views.py` (307줄)
  - ReportTemplateViewSet
  - GeneratedReportViewSet

- `/backend/data_sources/views.py` (373줄)
  - DataSourceViewSet
  - DataQueryAPIView

### ✅ URLs (라우팅)
- `/backend/reports/urls.py`
- `/backend/data_sources/urls.py`

### ✅ Python 문법 검사
- 모든 파일 문법 검사 완료 (syntax error 없음)

---

## 2. Docker 환경 실행

### 2.1. Docker 컨테이너 시작

```bash
cd /home/user/email-report
docker compose up -d
```

### 2.2. 컨테이너 상태 확인

```bash
docker compose ps
```

예상 출력:
```
NAME                  STATUS
email-report-backend  running
email-report-db       running
email-report-nginx    running
email-report-frontend running
```

### 2.3. Django 마이그레이션 확인

```bash
docker compose exec backend python manage.py showmigrations
```

### 2.4. Django 서버 로그 확인

```bash
docker compose logs -f backend
```

---

## 3. API 엔드포인트 테스트

### 3.1. 서버 상태 확인

```bash
curl http://localhost:10004/admin/
```

정상이면 Django admin 페이지 HTML이 반환됩니다.

---

## 4. 템플릿 API 테스트

### 4.1. 템플릿 생성 (POST)

```bash
curl -X POST http://localhost:10004/api/reports/templates/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "일일 리포트 v1",
    "description": "매출 및 생산 현황",
    "layout": [
      {"i": "chart1", "x": 0, "y": 0, "w": 6, "h": 4},
      {"i": "chart2", "x": 6, "y": 0, "w": 6, "h": 4}
    ],
    "charts": [
      {
        "id": "chart1",
        "type": "bar",
        "title": "일일 매출",
        "dataBinding": {
          "dataSource": "daily_sales",
          "xAxis": "date",
          "yAxis": ["sales", "profit"]
        },
        "style": {
          "colors": ["#8884d8", "#82ca9d"]
        }
      },
      {
        "id": "chart2",
        "type": "line",
        "title": "생산 추이",
        "dataBinding": {
          "dataSource": "production_data",
          "xAxis": "date",
          "yAxis": ["quantity"]
        },
        "style": {
          "colors": ["#ff7300"]
        }
      }
    ],
    "is_active": true
  }'
```

**예상 응답 (201 Created):**
```json
{
  "id": 1,
  "name": "일일 리포트 v1",
  "description": "매출 및 생산 현황",
  "layout": [...],
  "charts": [...],
  "is_active": true,
  "created_at": "2025-01-21T10:30:00Z",
  "updated_at": "2025-01-21T10:30:00Z"
}
```

### 4.2. 템플릿 목록 조회 (GET)

```bash
curl http://localhost:10004/api/reports/templates/
```

**예상 응답:**
```json
[
  {
    "id": 1,
    "name": "일일 리포트 v1",
    "description": "매출 및 생산 현황",
    "is_active": true,
    "chart_count": 2,
    "updated_at": "2025-01-21T10:30:00Z"
  }
]
```

### 4.3. 템플릿 상세 조회 (GET)

```bash
curl http://localhost:10004/api/reports/templates/1/
```

### 4.4. 활성 템플릿만 조회 (GET - Custom Action)

```bash
curl http://localhost:10004/api/reports/templates/active/
```

### 4.5. 템플릿 복제 (POST - Custom Action)

```bash
curl -X POST http://localhost:10004/api/reports/templates/1/duplicate/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "일일 리포트 v2"
  }'
```

### 4.6. 템플릿 수정 (PATCH)

```bash
curl -X PATCH http://localhost:10004/api/reports/templates/1/ \
  -H "Content-Type: application/json" \
  -d '{
    "description": "매출, 생산, 재고 현황"
  }'
```

### 4.7. 템플릿 삭제 (DELETE)

```bash
curl -X DELETE http://localhost:10004/api/reports/templates/1/
```

---

## 5. 데이터 소스 API 테스트

### 5.1. 데이터 소스 생성 (POST)

```bash
curl -X POST http://localhost:10004/api/data-sources/sources/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "일일매출",
    "table_name": "daily_sales",
    "description": "일일 매출 데이터",
    "columns_metadata": {
      "date": {"type": "date", "label": "날짜"},
      "sales": {"type": "int", "label": "매출액"},
      "profit": {"type": "int", "label": "순이익"},
      "cost": {"type": "int", "label": "비용"}
    },
    "is_active": true
  }'
```

**예상 응답 (201 Created):**
```json
{
  "id": 1,
  "name": "일일매출",
  "table_name": "daily_sales",
  "description": "일일 매출 데이터",
  "columns_metadata": {...},
  "columns": ["date", "sales", "profit", "cost"],
  "is_active": true,
  "created_at": "2025-01-21T10:35:00Z",
  "updated_at": "2025-01-21T10:35:00Z"
}
```

### 5.2. 데이터 소스 목록 조회 (GET)

```bash
curl http://localhost:10004/api/data-sources/sources/
```

### 5.3. 데이터 소스 상세 조회 (GET)

```bash
curl http://localhost:10004/api/data-sources/sources/1/
```

### 5.4. 컬럼 목록 조회 (GET - Custom Action)

```bash
curl http://localhost:10004/api/data-sources/sources/1/columns/
```

**예상 응답:**
```json
{
  "data_source": {
    "id": 1,
    "name": "일일매출",
    "table_name": "daily_sales"
  },
  "columns": ["date", "sales", "profit", "cost"]
}
```

---

## 6. 데이터 조회 API 테스트 (핵심)

### 6.1. 기본 데이터 조회 (POST)

```bash
curl -X POST http://localhost:10004/api/data-sources/query/ \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "daily_sales",
    "limit": 10
  }'
```

**예상 응답:**
```json
{
  "data_source": {
    "id": 1,
    "name": "일일매출",
    "table_name": "daily_sales"
  },
  "query_params": {
    "limit": 10
  },
  "data": [
    {
      "date": "2025-01-21",
      "sales": 5000000,
      "profit": 1000000,
      "cost": 4000000
    },
    ...
  ],
  "count": 10
}
```

### 6.2. 날짜 범위 조회

```bash
curl -X POST http://localhost:10004/api/data-sources/query/ \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "daily_sales",
    "start_date": "2025-01-01",
    "end_date": "2025-01-21",
    "limit": 100
  }'
```

### 6.3. 특정 컬럼만 조회

```bash
curl -X POST http://localhost:10004/api/data-sources/query/ \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "daily_sales",
    "columns": ["date", "sales"],
    "limit": 50
  }'
```

---

## 7. SQL Injection 방어 테스트

### 7.1. 잘못된 테이블명 (차단되어야 함)

```bash
curl -X POST http://localhost:10004/api/data-sources/query/ \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "users; DROP TABLE users--"
  }'
```

**예상 응답 (400 Bad Request):**
```json
{
  "error": "유효한 데이터 소스를 찾을 수 없습니다",
  "details": "table_name 'users; DROP TABLE users--'는 등록되지 않은 데이터 소스입니다."
}
```

### 7.2. 잘못된 컬럼명 (차단되어야 함)

```bash
curl -X POST http://localhost:10004/api/data-sources/query/ \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "daily_sales",
    "columns": ["*; DELETE FROM users"]
  }'
```

**예상 응답 (400 Bad Request):**
```json
{
  "error": "유효하지 않은 컬럼명",
  "details": "컬럼명 '*; DELETE FROM users'이 유효하지 않습니다. 영문자로 시작하고 영문자/숫자/언더스코어만 사용 가능합니다."
}
```

### 7.3. 존재하지 않는 컬럼 (차단되어야 함)

```bash
curl -X POST http://localhost:10004/api/data-sources/query/ \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "daily_sales",
    "columns": ["non_existent_column"]
  }'
```

**예상 응답 (400 Bad Request):**
```json
{
  "error": "유효하지 않은 컬럼명",
  "details": "컬럼 'non_existent_column'은 테이블 'daily_sales'에 존재하지 않습니다.",
  "available_columns": ["date", "sales", "profit", "cost"]
}
```

---

## 8. 리포트 API 테스트

### 8.1. 리포트 목록 조회

```bash
curl http://localhost:10004/api/reports/reports/
```

### 8.2. 날짜별 리포트 조회

```bash
curl "http://localhost:10004/api/reports/reports/by_date/?date=2025-01-21"
```

### 8.3. 상태별 리포트 조회

```bash
curl "http://localhost:10004/api/reports/reports/?status=success"
```

---

## 9. 검증 체크리스트

테스트 완료 후 다음 항목을 확인하세요:

- [ ] 템플릿 CRUD 동작 (생성, 조회, 수정, 삭제)
- [ ] 템플릿 복제 기능
- [ ] 활성 템플릿 필터링
- [ ] 데이터 소스 CRUD 동작
- [ ] 컬럼 목록 조회
- [ ] 데이터 동적 조회 (테이블명 기반)
- [ ] 날짜 범위 필터링
- [ ] SQL Injection 방어 확인
- [ ] 존재하지 않는 컬럼/테이블 에러 처리
- [ ] HTTP 상태 코드 적절성 (200, 201, 400, 404, 500)
- [ ] 에러 메시지 한국어 출력

---

## 10. 문제 해결

### 10.1. "No module named 'rest_framework'"

```bash
docker compose exec backend pip install djangorestframework
```

### 10.2. "Table doesn't exist"

마이그레이션을 실행하세요:
```bash
docker compose exec backend python manage.py migrate
```

### 10.3. CORS 에러 (Frontend 연동 시)

`backend/config/settings.py`에서 CORS 설정 확인:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Frontend 개발 서버
]
```

### 10.4. 로그 확인

```bash
# Backend 로그
docker compose logs -f backend

# DB 로그
docker compose logs -f db

# Nginx 로그
docker compose logs -f nginx
```

---

## 11. 다음 단계

REST API 테스트가 완료되면:

1. **Frontend 연동**
   - React에서 fetch/axios로 API 호출
   - 차트 데이터 바인딩

2. **차트 컴포넌트 개발**
   - Bar, Line, Pie, Combination 차트 구현
   - Recharts 라이브러리 활용

3. **에디터 개발 (Phase 2)**
   - react-grid-layout으로 드래그앤드롭
   - 템플릿 저장/불러오기

4. **자동화 (Phase 3)**
   - django-crontab 설정
   - 자동 리포트 생성

---

## 12. API 문서 자동 생성 (선택)

Swagger/OpenAPI 문서를 자동 생성하려면:

```bash
# drf-spectacular 설치
docker compose exec backend pip install drf-spectacular

# settings.py에 추가
INSTALLED_APPS += ['drf_spectacular']

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# urls.py에 추가
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns += [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

접속: http://localhost:10004/api/docs/

---

**테스트를 완료하면 `Todos_phase1.md`의 4번 작업을 ✅로 표시하세요!**
