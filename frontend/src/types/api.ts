/**
 * Backend API 요청/응답 타입 정의
 */

// ==================== 데이터 조회 API ====================

/**
 * 집계 함수 정의
 */
export interface AggregationField {
  /** 집계할 컬럼명 */
  column: string

  /** 집계 함수 (AVG, SUM, COUNT, MIN, MAX) */
  function: 'AVG' | 'SUM' | 'COUNT' | 'MIN' | 'MAX'

  /** 결과 컬럼 별칭 (선택사항) */
  alias?: string
}

/**
 * 데이터 조회 요청 인터페이스
 *
 * POST /api/data-sources/query/
 *
 * 집계 기능 지원:
 * - columns: GROUP BY에 사용할 컬럼 (집계 시 선택사항)
 * - aggregations: AVG, SUM, COUNT, MIN, MAX 집계 함수
 * - group_by_period: day/week/month/year별 날짜 그룹화
 */
export interface DataQueryRequest {
  /** 조회할 테이블명 (DataSource에 등록된 테이블만 허용) */
  table_name: string

  /** 조회할 컬럼명 배열 (집계 시 GROUP BY에 사용) */
  columns?: string[]

  /** 시작 날짜 (YYYY-MM-DD) */
  start_date?: string

  /** 종료 날짜 (YYYY-MM-DD) */
  end_date?: string

  /** 날짜 필터링에 사용할 컬럼명 (기본값: 'date') */
  date_column?: string

  /** 조회 건수 제한 (기본값: 1000) */
  limit?: number

  /** 날짜 그룹화 기간 (day, week, month, year) */
  group_by_period?: 'day' | 'week' | 'month' | 'year'

  /** 집계 함수 배열 */
  aggregations?: AggregationField[]
}

/**
 * 데이터 조회 응답 인터페이스
 */
export interface DataQueryResponse {
  /** 조회된 데이터 배열 */
  data: ChartDataItem[]

  /** 조회된 데이터 건수 */
  count: number

  /** 조회한 테이블명 */
  table_name: string
}

/**
 * 차트 데이터 아이템
 *
 * 동적 필드를 가지는 객체 타입
 *
 * @example
 * { date: "2025-01-01", revenue: 10000, profit: 3000 }
 */
export interface ChartDataItem {
  [key: string]: string | number | null
}

// ==================== 에러 응답 ====================

/**
 * API 에러 응답 인터페이스
 */
export interface ApiErrorResponse {
  /** 에러 메시지 */
  error: string

  /** 사용 가능한 컬럼 목록 (컬럼명 검증 실패 시) */
  available_columns?: string[]
}

// ==================== 템플릿 API ====================

/**
 * 리포트 템플릿 인터페이스
 */
export interface ReportTemplate {
  id: number
  name: string
  description?: string
  layout: LayoutItem[]
  charts: ChartConfig[]
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 레이아웃 아이템 (react-grid-layout)
 */
export interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  static?: boolean
}

/**
 * 차트 설정 인터페이스
 */
export interface ChartConfig {
  id: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'combination'
  title: string
  dataBinding: DataBinding
  style: ChartStyle
}

/**
 * 데이터 바인딩 설정
 */
export interface DataBinding {
  /** X축에 사용할 컬럼명 */
  xAxis: string

  /** Y축에 사용할 컬럼명 배열 */
  yAxis: string[]

  /** 데이터 소스 테이블명 */
  dataSource: string
}

/**
 * 차트 스타일 설정
 */
export interface ChartStyle {
  /** 차트 색상 팔레트 */
  colors: string[]

  /** 임계값/목표선 표시 여부 */
  showThreshold?: boolean

  /** 임계값 */
  thresholdValue?: number

  /** 데이터 레이블 표시 여부 */
  showDataLabel?: boolean
}
