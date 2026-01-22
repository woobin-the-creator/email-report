# API 연동 작업 계획서

**작성일**: 2025-01-21
**작업 범위**: Frontend-Backend API 연동 및 동적 데이터 바인딩

---

## 1. 목표

- Phase 1 완성: 하드코딩된 샘플 데이터를 Backend API 데이터로 교체
- 날짜 파라미터(`/report/yyyymmdd`)에 따른 동적 데이터 로딩
- 에러 처리 및 로딩 상태 관리

---

## 2. Backend API 분석

### 2.1 핵심 엔드포인트

**동적 데이터 조회 API**
```
POST /api/data-sources/query/
```

**요청 본문 예시**:
```json
{
  "table_name": "daily_sales",
  "columns": ["date", "revenue", "profit"],
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "date_column": "date",
  "limit": 1000
}
```

**응답 예시**:
```json
{
  "data": [
    {"date": "2025-01-01", "revenue": 10000, "profit": 3000},
    {"date": "2025-01-02", "revenue": 12000, "profit": 3500}
  ],
  "count": 2,
  "table_name": "daily_sales"
}
```

### 2.2 보안 기능

- ✅ SQL Injection 방지 (테이블명/컬럼명 화이트리스트)
- ✅ 파라미터화된 쿼리 (날짜 등 사용자 입력값)
- ✅ 백틱(`) 감싸기로 추가 보호

---

## 3. 작업 단계

### 단계 1: 환경변수 설정

**파일**: `frontend/.env.development`
```env
VITE_API_BASE_URL=http://localhost:10003
```

**파일**: `frontend/.env.production`
```env
VITE_API_BASE_URL=http://{실제배포주소}
```

---

### 단계 2: API 타입 정의

**파일**: `frontend/src/types/api.ts` (신규 생성)

```typescript
/**
 * API 요청/응답 타입 정의
 */

// 데이터 조회 요청
export interface DataQueryRequest {
  table_name: string
  columns: string[]
  start_date?: string  // YYYY-MM-DD
  end_date?: string    // YYYY-MM-DD
  date_column?: string
  limit?: number
}

// 데이터 조회 응답
export interface DataQueryResponse {
  data: ChartDataItem[]
  count: number
  table_name: string
}

// 차트 데이터 아이템 (동적 필드)
export interface ChartDataItem {
  [key: string]: string | number | null
}

// API 에러 응답
export interface ApiErrorResponse {
  error: string
  available_columns?: string[]
}
```

---

### 단계 3: API 클라이언트 함수 작성

**파일**: `frontend/src/api/client.ts` (신규 생성)

```typescript
/**
 * Backend API 클라이언트 함수
 */

import type { DataQueryRequest, DataQueryResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10003'

/**
 * 동적 데이터 조회 API 호출
 *
 * @param request - 데이터 조회 요청 파라미터
 * @returns 조회된 데이터 배열
 */
export async function fetchDataQuery(
  request: DataQueryRequest
): Promise<DataQueryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/data-sources/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || `API 호출 실패: ${response.status}`)
  }

  return response.json()
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 *
 * @param yyyymmdd - YYYYMMDD 형식 문자열
 * @returns YYYY-MM-DD 형식 문자열
 */
export function formatDateForApi(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) {
    throw new Error('날짜 형식이 올바르지 않습니다 (YYYYMMDD 필요)')
  }

  const year = yyyymmdd.slice(0, 4)
  const month = yyyymmdd.slice(4, 6)
  const day = yyyymmdd.slice(6, 8)

  return `${year}-${month}-${day}`
}
```

---

### 단계 4: Report 페이지 API 연동

**파일**: `frontend/src/pages/Report.tsx` (수정)

#### 4-1. Import 추가

```typescript
import { fetchDataQuery, formatDateForApi } from '../api/client'
import type { ChartDataItem } from '../types/api'
```

#### 4-2. 상태 관리 추가

```typescript
const [monthlySalesData, setMonthlySalesData] = useState<ChartDataItem[]>([])
const [dailyVisitorsData, setDailyVisitorsData] = useState<ChartDataItem[]>([])
const [categoryData, setCategoryData] = useState<ChartDataItem[]>([])
const [salesProfitData, setSalesProfitData] = useState<ChartDataItem[]>([])
const [error, setError] = useState<string | null>(null)
```

#### 4-3. useEffect에서 API 호출

```typescript
useEffect(() => {
  const loadReportData = async () => {
    if (!date) {
      setError('날짜 파라미터가 없습니다')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 날짜 형식 변환 (yyyymmdd → yyyy-mm-dd)
      const apiDate = formatDateForApi(date)

      // 4개 차트 데이터 병렬 로딩
      const [monthlySales, dailyVisitors, category, salesProfit] = await Promise.all([
        // Bar Chart - 월별 매출
        fetchDataQuery({
          table_name: 'monthly_sales',
          columns: ['month', 'sales', 'target'],
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          limit: 12,
        }),

        // Line Chart - 일별 방문자
        fetchDataQuery({
          table_name: 'daily_visitors',
          columns: ['day', 'visitors', 'pageViews'],
          start_date: apiDate,
          end_date: apiDate,
          date_column: 'date',
          limit: 7,
        }),

        // Pie Chart - 카테고리별 매출
        fetchDataQuery({
          table_name: 'category_sales',
          columns: ['name', 'value'],
          start_date: apiDate,
          end_date: apiDate,
          limit: 10,
        }),

        // Combination Chart - 매출 vs 수익
        fetchDataQuery({
          table_name: 'sales_profit',
          columns: ['month', 'sales', 'profit'],
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          limit: 12,
        }),
      ])

      // 상태 업데이트
      setMonthlySalesData(monthlySales.data)
      setDailyVisitorsData(dailyVisitors.data)
      setCategoryData(category.data)
      setSalesProfitData(salesProfit.data)

    } catch (err) {
      console.error('리포트 데이터 로딩 실패:', err)
      setError(err instanceof Error ? err.message : '데이터 로딩 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  loadReportData()
}, [date])
```

#### 4-4. 에러 UI 추가

```typescript
// 에러 상태 렌더링
if (error) {
  return (
    <div style={styles.errorContainer}>
      <h2>⚠️ 데이터 로딩 실패</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>
        다시 시도
      </button>
    </div>
  )
}
```

---

### 단계 5: 데이터 소스 테이블 생성 (Backend)

**참고**: 실제 환경에서는 사내 PC에 다음 테이블들이 필요합니다.

```sql
-- 1. 월별 매출 데이터
CREATE TABLE monthly_sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    month VARCHAR(10),
    sales INT,
    target INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 일별 방문자 데이터
CREATE TABLE daily_visitors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE,
    day VARCHAR(10),
    visitors INT,
    pageViews INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 카테고리별 매출
CREATE TABLE category_sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE,
    name VARCHAR(50),
    value INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 매출 및 수익 데이터
CREATE TABLE sales_profit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    month VARCHAR(10),
    sales INT,
    profit INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Django 관리자에서 DataSource 등록**:
1. `/admin`에서 DataSource 4개 생성
2. `table_name`을 위 테이블명으로 설정
3. `is_active=True` 설정

---

## 4. 테스트 체크리스트

### 4-1. API 클라이언트 테스트

```bash
# Frontend 개발 서버 실행
cd frontend
npm run dev
```

**브라우저 개발자 도구 확인**:
- [ ] Network 탭에서 `/api/data-sources/query/` 호출 확인
- [ ] 응답 상태 코드 200 확인
- [ ] 응답 데이터 구조 확인

### 4-2. 차트 렌더링 테스트

**URL 접속**: `http://localhost:10005/report/20250121`

- [ ] Bar 차트 데이터 정상 렌더링
- [ ] Line 차트 데이터 정상 렌더링
- [ ] Pie 차트 데이터 정상 렌더링
- [ ] Combination 차트 데이터 정상 렌더링

### 4-3. 에러 처리 테스트

- [ ] 존재하지 않는 테이블명 → 에러 메시지 표시
- [ ] 네트워크 오류 → 에러 메시지 표시
- [ ] 잘못된 날짜 형식 → 에러 메시지 표시

### 4-4. 로딩 상태 테스트

- [ ] 데이터 로딩 중 스피너 표시
- [ ] 로딩 완료 후 차트 표시

---

## 5. 폴백 전략 (Phase 1용)

### 5-1. 샘플 데이터 유지 옵션

테이블이 없는 경우 샘플 데이터로 폴백:

```typescript
// API 호출 실패 시 샘플 데이터 사용
const FALLBACK_DATA = {
  monthlySales: [ /* 기존 샘플 데이터 */ ],
  dailyVisitors: [ /* 기존 샘플 데이터 */ ],
  // ...
}

try {
  const apiData = await fetchDataQuery(...)
  setData(apiData.data)
} catch (err) {
  console.warn('API 호출 실패, 샘플 데이터 사용:', err)
  setData(FALLBACK_DATA.monthlySales)
}
```

### 5-2. 개발/프로덕션 분기

```typescript
const isDevelopment = import.meta.env.DEV

if (isDevelopment) {
  // 개발 환경: 샘플 데이터 사용
  setData(SAMPLE_DATA)
} else {
  // 프로덕션: API 호출
  const apiData = await fetchDataQuery(...)
  setData(apiData.data)
}
```

---

## 6. 예상 소요 시간

| 단계 | 작업 | 예상 시간 |
|------|------|----------|
| 1 | 환경변수 설정 | 5분 |
| 2 | API 타입 정의 | 10분 |
| 3 | API 클라이언트 함수 작성 | 20분 |
| 4 | Report 페이지 API 연동 | 30분 |
| 5 | 테스트 및 디버깅 | 20분 |
| **합계** | | **1시간 25분** |

---

## 7. 다음 단계 (Phase 2 준비)

API 연동 완료 후:
- [ ] iframe 테스트 (작업 #14)
- [ ] Phase 1 완료 보고
- [ ] Phase 2 Editor 개발 계획 수립
- [ ] ISSUES.md의 Critical 보안 이슈 해결

---

## 8. 주의사항

### 8-1. CORS 설정 확인

Backend `settings.py`에서 CORS 허용 확인:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:10005',
    'http://localhost:3000',
]
```

### 8-2. Nginx 프록시 설정

Nginx가 `/api/` 경로를 Backend로 프록시하는지 확인:
```nginx
location /api/ {
    proxy_pass http://backend:8000;
}
```

### 8-3. 사내 환경 고려

- GitHub 레포에는 샘플 데이터 유지
- 사내 PC에서만 실제 테이블 연결
- 환경변수로 API URL 분리

---

**작성자**: Claude Code
**최종 수정**: 2025-01-21
