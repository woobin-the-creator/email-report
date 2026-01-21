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
| 12 | API 연동 | Frontend에서 Django API 호출 및 차트 데이터 바인딩 | 🔄 |
| 13 | Nginx 설정 | 프록시 설정 및 Docker 통합 테스트 | ✅ |
| 14 | iframe 테스트 | 테스트용 HTML 페이지에서 iframe 삽입 확인 | ⬜ |

### 작업 #12 상세 계획: API 연동

#### 12-1. API 클라이언트 함수 작성
**파일**: `frontend/src/api/client.ts`
- `fetchDataQuery()` - 데이터 소스 쿼리 API 호출
- `fetchTemplateByDate()` - 날짜별 템플릿 조회
- Axios 또는 Fetch API 사용
- 에러 처리 및 타입 정의

**예시 요청**:
```typescript
POST /api/data-sources/query/
{
  "data_source_id": 1,
  "columns": ["month", "sales", "target"],
  "filters": [
    {
      "column": "date",
      "operator": "gte",
      "value": "2025-01-01"
    }
  ],
  "order_by": ["month"]
}
```

#### 12-2. 타입 정의 추가
**파일**: `frontend/src/types/api.ts`
- `DataQueryRequest` - 쿼리 요청 인터페이스
- `DataQueryResponse` - 쿼리 응답 인터페이스
- `ChartDataItem` - 차트 데이터 아이템 타입

#### 12-3. Report 페이지 API 연동
**파일**: `frontend/src/pages/Report.tsx`
- `useEffect`에서 날짜 파라미터로 API 호출
- 샘플 데이터를 API 응답 데이터로 교체
- 로딩 상태, 에러 상태 관리
- 데이터가 없을 경우 폴백 처리

#### 12-4. 환경변수 설정
**파일**: `frontend/.env.development`
```
VITE_API_BASE_URL=http://localhost:10003
```

#### 12-5. 테스트
- [ ] API 호출 성공 확인
- [ ] 차트에 데이터 정상 렌더링
- [ ] 로딩 상태 UI 확인
- [ ] 에러 처리 확인
- [ ] 네트워크 탭 검증

---

## 6. 추가 완료 작업 (Phase 1 외)

| No | 작업 | 설명 | 상태 |
|----|------|------|------|
| 15 | Swagger API 문서화 | drf-spectacular 도입, OpenAPI 3.0 기반 자동 문서 생성 | ✅ |
| 16 | 포트 번호 변경 | Nginx(10003), Backend(10004), Frontend(10005), MySQL(3308) | ✅ |

---

## 상태 범례

- ⬜ 대기
- 🔄 진행 중
- ✅ 완료
