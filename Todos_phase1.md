# Phase 1: 기반 구축 - Todo 계획

## 1. 프로젝트 초기 설정

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 1 | Docker 환경 구성 | `docker-compose.yml`, Dockerfile 작성 (Nginx, Django, MySQL, React) | ✅ |

---

## 2. Backend (Django + DRF)

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 2 | Django 프로젝트 생성 | DRF 설정, CORS 설정, 기본 구조 | ✅ |
| 3 | DB 모델 생성 | `report_templates`, `data_sources`, `generated_reports` 테이블 | ✅ |
| 4 | REST API 구현 | `/api/data/`, `/api/templates/` 엔드포인트 | ✅ |

---

## 3. Frontend (React + TypeScript + Vite)

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 5 | React 프로젝트 생성 | Vite + TypeScript 기반 | ✅ |
| 6 | 라우트 구현 | React Router로 `/report/:date` 경로 설정 | ✅ |

---

## 4. Recharts 차트 구현

| No | 작업 | 기능 | 상태 |
|----|------|------|------|
| 7 | **Bar 차트** | Tooltip, Data Label, Threshold/Target Line | ✅ |
| 8 | **Line 차트** | Tooltip, Data Label, Threshold/Target Line | ✅ |
| 9 | **Pie 차트** | Tooltip, Data Label | ✅ |
| 10 | **Combination 차트** | Bar+Line 결합, Dual Y-Axis (좌: Bar, 우: Line), Tooltip, Data Label, Threshold/Target Line | ✅ |
| 11 | ReportPage 완성 | 하드코딩된 샘플 데이터로 차트들 배치 | ✅ |

### 차트 공통 기능 명세

| 기능 | Bar | Line | Pie | Combination |
|------|:---:|:----:|:---:|:-----------:|
| Tooltip (호버) | ✓ | ✓ | ✓ | ✓ |
| Data Label | ✓ | ✓ | ✓ | ✓ |
| Threshold/Target Line | ✓ | ✓ | - | ✓ |
| Dual Y-Axis | - | - | - | ✓ (좌:Bar, 우:Line) |

---

## 5. 데이터 연동 및 테스트

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 12 | API 연동 | Frontend에서 Django API 호출 및 차트 데이터 바인딩 | ✅ |
| 13 | Nginx 설정 | 프록시 설정 및 Docker 통합 테스트 | ✅ |
| 14 | iframe 테스트 | 테스트용 HTML 페이지에서 iframe 삽입 확인 | ✅ |
| 15 | 실제 환경 테스트 | fcc_data DataSource 등록 및 API 통합 테스트 | 🔄 |

### 작업 #12 상세 내역: API 연동 (완료)

#### 12-1. Backend API 집계 기능 추가 ✅
**파일**: `backend/data_sources/serializers.py`, `backend/data_sources/views.py`
- `AggregationFieldSerializer` 추가 (AVG, SUM, COUNT, MIN, MAX 지원)
- `DataQuerySerializer`에 집계 관련 필드 추가:
  - `group_by_period`: day/week/month/year 그룹화
  - `aggregations`: 집계 함수 배열
  - `columns`: GROUP BY에 사용 (집계 시 선택사항)
- `DataQueryAPIView` 쿼리 생성 로직 구현:
  - GROUP BY 절 자동 생성
  - 날짜 함수 적용 (DATE, YEARWEEK, DATE_FORMAT, YEAR)
  - 집계 결과 컬럼명 자동 생성 (예: `avg_fcc`, `max_fcc`)

**예시 요청** (집계 기능 포함):
```typescript
POST /api/data-sources/query/
{
  "table_name": "fcc_data",
  "columns": [],
  "start_date": "2025-01-20",
  "end_date": "2025-01-26",
  "date_column": "cdate",
  "group_by_period": "day",
  "aggregations": [
    { "column": "fcc", "function": "AVG", "alias": "avg_fcc" }
  ],
  "limit": 7
}
```

#### 12-2. DataSource 등록 Management Command 작성 ✅
**파일**: `backend/data_sources/management/commands/register_fcc_data.py`
- fcc_data 테이블 존재 확인
- 컬럼 정보 자동 조회
- DataSource 등록/업데이트 자동화
- 실행 방법: `python manage.py register_fcc_data`

#### 12-3. Frontend API 타입 정의 업데이트 ✅
**파일**: `frontend/src/types/api.ts`
- `AggregationField` 인터페이스 추가
- `DataQueryRequest`에 집계 관련 필드 추가:
  - `group_by_period?: 'day' | 'week' | 'month' | 'year'`
  - `aggregations?: AggregationField[]`
  - `columns?: string[]` (선택사항으로 변경)

#### 12-4. Report 페이지 fcc_data 기반 구현 ✅
**파일**: `frontend/src/pages/Report.tsx`
- 4개 차트를 fcc_data 기반으로 전면 수정:
  1. **Bar Chart**: 일별 FCC 평균 (최근 7일)
  2. **Line Chart**: 주별 FCC 추이 (최근 4주)
  3. **Pie Chart**: FCC 그룹별 평균 비율 (최근 1개월)
  4. **Combination Chart**: FCC 그룹별 평균 vs 최대값 (최근 1개월)
- API 호출 로직에 집계 함수 적용
- 날짜 범위 자동 계산 (최근 7일, 4주, 1개월)
- Promise.allSettled로 4개 차트 병렬 로딩

#### 12-5. 환경변수 설정 ✅
**파일**: `frontend/.env.development` (Git 제외)
```
VITE_API_BASE_URL=http://localhost:10003
VITE_USE_API=true
```

#### 12-6. Git 커밋 및 푸시 ✅
- 브랜치: `claude/plan-todo-phase1-nuOZa`
- 커밋 ID: `2c6f58f`
- 커밋 메시지: "feat: Backend API 집계 기능 및 fcc_data 기반 Report 페이지 구현"

### 작업 #15 상세 계획: 실제 환경 테스트 (다음 단계)

#### 15-1. fcc_data 테이블 준비
- [ ] fcc_data 테이블 존재 확인 (이미 있음)
- [ ] 실제 데이터 확인 (cdate, fcc_group, fcc, classname, classid)

#### 15-2. DataSource 등록
- [ ] `python manage.py register_fcc_data` 실행
- [ ] DataSource 등록 성공 확인

#### 15-3. API 연동 테스트
- [ ] Frontend 실행 (`npm run dev`)
- [ ] `/report/20250126` 페이지 접속
- [ ] 브라우저 개발자 도구에서 API 호출 확인:
  - POST `/api/data-sources/query/` 요청 4개
  - 집계된 데이터 응답 확인
- [ ] 4개 차트 정상 렌더링 확인

#### 15-4. 통합 검증
- [ ] Backend 로그에서 집계 쿼리 실행 확인
- [ ] 차트 데이터가 실제 fcc_data 기반인지 확인
- [ ] 날짜 범위별 데이터 정확성 확인
- [ ] 에러 처리 및 폴백 메커니즘 동작 확인

---

## 6. 추가 완료 작업 (Phase 1 외)

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 16 | Swagger API 문서화 | drf-spectacular 도입, OpenAPI 3.0 기반 자동 문서 생성 | ✅ |
| 17 | 포트 번호 변경 | Nginx(10003), Backend(10004), Frontend(10005), MySQL(3308) | ✅ |
| 18 | Backend API 집계 기능 | GROUP BY, AVG, SUM, COUNT, MIN, MAX 지원 | ✅ |
| 19 | fcc_data 기반 구현 | Report 페이지를 실제 운영 데이터 기반으로 전환 | ✅ |

---

## 상태 범례

- ⬜ 대기
- 🔄 진행 중
- ✅ 완료
