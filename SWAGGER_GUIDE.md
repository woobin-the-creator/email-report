# Swagger API 문서 사용 가이드

drf-spectacular를 사용한 OpenAPI 3.0 기반 API 문서화가 완료되었습니다.

---

## 📚 접속 방법

### 1. Swagger UI (인터랙티브)
```
http://localhost:10004/api/docs/
```

**기능:**
- ✅ 실시간 API 테스트
- ✅ Try it out 버튼으로 즉시 요청 전송
- ✅ 요청/응답 예시 확인
- ✅ 인증 토큰 설정 (필요 시)

### 2. ReDoc (읽기 전용)
```
http://localhost:10004/api/redoc/
```

**기능:**
- ✅ 깔끔한 3단 레이아웃
- ✅ 검색 기능
- ✅ 인쇄 및 공유에 최적화

### 3. OpenAPI Schema (JSON)
```
http://localhost:10004/api/schema/
```

**사용처:**
- Postman에서 Collection으로 import
- Insomnia에서 import
- 자동 코드 생성 도구 (openapi-generator)

---

## 🚀 빠른 시작

### Docker 환경에서 실행

```bash
# 1. Docker Compose로 전체 환경 시작
cd /home/user/email-report
docker compose up -d

# 2. Backend 컨테이너에서 패키지 설치 (최초 1회)
docker compose exec backend pip install -r requirements.txt

# 3. 브라우저에서 Swagger UI 접속
# http://localhost:10004/api/docs/
```

### 로컬 환경에서 실행

```bash
# 1. 가상환경 활성화 (선택)
cd /home/user/email-report/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 패키지 설치
pip install -r requirements.txt

# 3. Django 서버 실행
python manage.py runserver

# 4. 브라우저에서 접속
# http://localhost:10004/api/docs/
```

---

## 📖 API 구조

### API 태그별 엔드포인트

#### 1. **reports** - 리포트 템플릿 관리
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/reports/templates/` | 템플릿 목록 조회 |
| POST | `/api/reports/templates/` | 템플릿 생성 |
| GET | `/api/reports/templates/{id}/` | 템플릿 상세 조회 |
| PUT | `/api/reports/templates/{id}/` | 템플릿 전체 수정 |
| PATCH | `/api/reports/templates/{id}/` | 템플릿 부분 수정 |
| DELETE | `/api/reports/templates/{id}/` | 템플릿 삭제 |
| GET | `/api/reports/templates/active/` | 활성 템플릿만 조회 |
| POST | `/api/reports/templates/{id}/duplicate/` | 템플릿 복제 |

#### 2. **generated-reports** - 생성된 리포트 조회
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/reports/reports/` | 리포트 목록 조회 |
| GET | `/api/reports/reports/{id}/` | 리포트 상세 조회 |
| GET | `/api/reports/reports/by_date/` | 날짜별 리포트 조회 |

#### 3. **data-sources** - 데이터 소스 관리
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/data-sources/sources/` | 데이터 소스 목록 조회 |
| POST | `/api/data-sources/sources/` | 데이터 소스 생성 |
| GET | `/api/data-sources/sources/{id}/` | 데이터 소스 상세 조회 |
| PUT | `/api/data-sources/sources/{id}/` | 데이터 소스 수정 |
| DELETE | `/api/data-sources/sources/{id}/` | 데이터 소스 삭제 |
| GET | `/api/data-sources/sources/{id}/columns/` | 컬럼 목록 조회 |
| POST | `/api/data-sources/sources/{id}/test/` | 연결 테스트 |

#### 4. **data-query** - 동적 데이터 조회
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/data-sources/query/` | 데이터 조회 (핵심) |

---

## 🎯 Swagger UI 사용 방법

### 1. API 테스트하기

#### Step 1: 엔드포인트 선택
- Swagger UI에서 원하는 엔드포인트 클릭
- 예: `POST /api/reports/templates/` (템플릿 생성)

#### Step 2: Try it out 클릭
- 우측 상단의 **Try it out** 버튼 클릭
- Request Body 영역이 편집 가능해짐

#### Step 3: 요청 데이터 입력
- 미리 제공된 예시를 수정하거나
- 직접 JSON 작성

**예시 (템플릿 생성):**
```json
{
  "name": "일일 매출 리포트",
  "description": "매출 및 이익 추이",
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
    }
  ],
  "is_active": true
}
```

#### Step 4: Execute 클릭
- **Execute** 버튼 클릭
- 실제 API 요청이 전송됨

#### Step 5: 응답 확인
- **Server response** 섹션에서 확인:
  - HTTP 상태 코드 (200, 201, 400, etc.)
  - Response body (JSON)
  - Response headers

### 2. 쿼리 파라미터 사용

**예시: 활성 템플릿만 조회**

1. `GET /api/reports/templates/` 선택
2. Try it out 클릭
3. **Parameters** 섹션에서 `is_active` 입력:
   - Name: `is_active`
   - Value: `true`
4. Execute 클릭

### 3. 복잡한 JSON 구조 확인

**데이터 조회 API 예시:**

1. `POST /api/data-sources/query/` 선택
2. Try it out 클릭
3. Request body:
   ```json
   {
     "table_name": "daily_sales",
     "start_date": "2025-01-01",
     "end_date": "2025-01-21",
     "limit": 100
   }
   ```
4. Execute 클릭
5. 응답 예시 확인:
   ```json
   {
     "data_source": {
       "id": 1,
       "name": "일일매출",
       "table_name": "daily_sales"
     },
     "data": [
       {
         "date": "2025-01-21",
         "sales": 5000000,
         "profit": 1000000
       }
     ],
     "count": 100
   }
   ```

---

## 🔍 주요 기능

### 1. 스키마 다이어그램

각 엔드포인트의 요청/응답 구조를 **Schema** 탭에서 시각적으로 확인 가능:

**ReportTemplateSerializer:**
```
{
  id: integer (read-only)
  name: string (required)
  description: string (optional)
  layout: array [
    {
      i: string
      x: number
      y: number
      w: number
      h: number
    }
  ]
  charts: array [
    {
      id: string
      type: enum (bar, line, pie, area)
      title: string
      dataBinding: {
        dataSource: string
        xAxis: string
        yAxis: array[string]
      }
    }
  ]
  is_active: boolean
  created_at: datetime (read-only)
  updated_at: datetime (read-only)
}
```

### 2. 필터링 및 검색

Swagger UI 상단의 **Filter by tag** 또는 검색창 사용:
- `reports`로 검색 → 템플릿 관련 API만 표시
- `data`로 검색 → 데이터 관련 API만 표시

### 3. 예시 응답 확인

각 엔드포인트의 **Responses** 섹션에서:
- 200: 성공 응답 예시
- 201: 생성 성공 예시
- 400: 유효성 검사 실패 예시
- 404: 리소스 없음 예시

---

## 📦 Postman/Insomnia에서 사용

### Postman

1. Postman 실행
2. **Import** 클릭
3. **Link** 탭 선택
4. URL 입력:
   ```
   http://localhost:10004/api/schema/
   ```
5. **Continue** → **Import**
6. 모든 API가 Collection으로 import됨

### Insomnia

1. Insomnia 실행
2. **Import/Export** → **Import Data** → **From URL**
3. URL 입력:
   ```
   http://localhost:10004/api/schema/
   ```
4. **Fetch and Import**

---

## 🛠️ 커스터마이징

### 1. API 설명 수정

`/home/user/email-report/backend/config/settings.py`:

```python
SPECTACULAR_SETTINGS = {
    'TITLE': 'Email Report API',  # 변경 가능
    'DESCRIPTION': '...',           # 변경 가능
    'VERSION': '1.0.0',            # 버전 업데이트
    'CONTACT': {
        'name': 'Your Team',       # 팀명 변경
        'email': 'team@example.com'
    },
}
```

### 2. 특정 엔드포인트 문서화 개선

ViewSet의 메서드에 `@extend_schema` 데코레이터 추가:

```python
from drf_spectacular.utils import extend_schema

@extend_schema(
    summary="템플릿 생성",
    description="새로운 리포트 템플릿을 생성합니다. layout과 charts 필드는 JSON 형식입니다.",
    request=ReportTemplateSerializer,
    responses={201: ReportTemplateSerializer},
    examples=[
        OpenApiExample(
            'Example 1',
            value={
                "name": "일일 리포트",
                "layout": [...]
            }
        )
    ]
)
def create(self, request, *args, **kwargs):
    # ...
```

### 3. 인증 추가 (향후)

```python
SPECTACULAR_SETTINGS = {
    # ... 기존 설정
    'SECURITY': [
        {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
        }
    ],
}
```

---

## 🎨 UI 스타일링

### Swagger UI 색상 변경

`/home/user/email-report/backend/config/urls.py`:

```python
from drf_spectacular.views import SpectacularSwaggerView

urlpatterns = [
    # ...
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(
            url_name='schema',
            template_name='swagger_ui.html'  # 커스텀 템플릿
        ),
        name='swagger-ui'
    ),
]
```

커스텀 템플릿 생성: `templates/swagger_ui.html`

---

## 🔧 문제 해결

### 1. "Module 'drf_spectacular' not found"

```bash
pip install drf-spectacular
```

### 2. Swagger UI에서 엔드포인트가 안 보임

```bash
# Django 서버 재시작
python manage.py runserver
```

### 3. CORS 에러 (Frontend 연동 시)

`backend/config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite frontend
]
```

### 4. 예시 데이터가 안 나옴

ViewSet에 `@extend_schema` 데코레이터가 적용되었는지 확인

---

## 📊 통계 및 메타데이터

### 현재 문서화된 API

| 카테고리 | 엔드포인트 수 | 설명 |
|---------|-------------|------|
| **reports** | 8개 | 템플릿 CRUD + 커스텀 액션 |
| **generated-reports** | 3개 | 리포트 조회 |
| **data-sources** | 7개 | 데이터 소스 CRUD |
| **data-query** | 1개 | 동적 데이터 조회 |
| **합계** | **19개** | 전체 API 엔드포인트 |

### 문서화 수준

- ✅ 모든 엔드포인트 설명 포함
- ✅ 쿼리 파라미터 타입 명시
- ✅ 요청/응답 스키마 자동 생성
- ✅ 예시 데이터 제공
- ✅ 한국어 설명

---

## 🚀 다음 단계

1. **Frontend 연동**
   - Swagger에서 생성된 스키마를 기반으로 TypeScript 타입 생성
   - `openapi-typescript-codegen` 사용 권장

2. **테스트 자동화**
   - Swagger 스키마 기반 API 테스트 작성
   - `dredd` 또는 `schemathesis` 도구 활용

3. **버전 관리**
   - API 버전업 시 SPECTACULAR_SETTINGS의 VERSION 업데이트
   - 변경 이력 문서화

---

## 📚 참고 자료

- [drf-spectacular 공식 문서](https://drf-spectacular.readthedocs.io/)
- [OpenAPI 3.0 스펙](https://swagger.io/specification/)
- [Swagger UI 가이드](https://swagger.io/tools/swagger-ui/)

---

**Swagger API 문서화가 완료되었습니다!** 브라우저에서 `http://localhost:10004/api/docs/`를 열어 확인하세요.
