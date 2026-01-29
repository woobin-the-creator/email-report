/**
 * Backend API 클라이언트 함수
 *
 * Django REST API와 통신하는 함수들을 정의합니다.
 */

import type {
  DataQueryRequest,
  DataQueryResponse,
  ApiErrorResponse,
  ReportTemplate,
  TemplateListItem,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  DataSourceListItem,
  ColumnsResponse,
} from '../types/api'

// 환경변수에서 API Base URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10003'

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: ApiErrorResponse
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 동적 데이터 조회 API 호출
 *
 * POST /api/data-sources/query/
 *
 * @param request - 데이터 조회 요청 파라미터
 * @returns 조회된 데이터 배열
 * @throws {ApiError} API 호출 실패 시
 *
 * @example
 * ```typescript
 * const response = await fetchDataQuery({
 *   table_name: 'monthly_sales',
 *   columns: ['month', 'sales', 'target'],
 *   start_date: '2025-01-01',
 *   end_date: '2025-12-31',
 *   limit: 12
 * })
 * console.log(response.data) // [{ month: '1월', sales: 4200, target: 4000 }, ...]
 * ```
 */
export async function fetchDataQuery(
  request: DataQueryRequest
): Promise<DataQueryResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/data-sources/query/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new ApiError(
        errorData.error || `API 호출 실패: ${response.status}`,
        response.status,
        errorData
      )
    }

    const data: DataQueryResponse = await response.json()
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // 네트워크 에러 등
    throw new ApiError(
      error instanceof Error ? error.message : 'API 호출 중 알 수 없는 오류 발생'
    )
  }
}

/**
 * 날짜 형식 변환: YYYYMMDD → YYYY-MM-DD
 *
 * @param yyyymmdd - YYYYMMDD 형식 문자열 (예: "20250121")
 * @returns YYYY-MM-DD 형식 문자열 (예: "2025-01-21")
 * @throws {Error} 날짜 형식이 올바르지 않은 경우
 *
 * @example
 * ```typescript
 * formatDateForApi("20250121") // "2025-01-21"
 * ```
 */
export function formatDateForApi(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) {
    throw new Error('날짜 형식이 올바르지 않습니다 (YYYYMMDD 8자리 필요)')
  }

  // 숫자만 포함하는지 검증
  if (!/^\d{8}$/.test(yyyymmdd)) {
    throw new Error('날짜는 숫자만 포함해야 합니다')
  }

  const year = yyyymmdd.slice(0, 4)
  const month = yyyymmdd.slice(4, 6)
  const day = yyyymmdd.slice(6, 8)

  return `${year}-${month}-${day}`
}

/**
 * 날짜 형식 변환: YYYY-MM-DD → YYYYMMDD
 *
 * @param date - YYYY-MM-DD 형식 문자열 (예: "2025-01-21")
 * @returns YYYYMMDD 형식 문자열 (예: "20250121")
 *
 * @example
 * ```typescript
 * formatDateFromApi("2025-01-21") // "20250121"
 * ```
 */
export function formatDateFromApi(date: string): string {
  return date.replace(/-/g, '')
}

/**
 * 날짜 범위 생성 헬퍼 함수
 *
 * 특정 날짜 기준으로 범위를 생성합니다.
 *
 * @param yyyymmdd - 기준 날짜 (YYYYMMDD)
 * @param range - 범위 타입
 * @returns { start_date, end_date } (YYYY-MM-DD 형식)
 *
 * @example
 * ```typescript
 * getDateRange("20250121", "month")
 * // { start_date: "2025-01-01", end_date: "2025-01-31" }
 * ```
 */
export function getDateRange(
  yyyymmdd: string,
  range: 'day' | 'week' | 'month' | 'year'
): { start_date: string; end_date: string } {
  const date = new Date(
    parseInt(yyyymmdd.slice(0, 4)),
    parseInt(yyyymmdd.slice(4, 6)) - 1,
    parseInt(yyyymmdd.slice(6, 8))
  )

  let startDate: Date
  let endDate: Date

  switch (range) {
    case 'day':
      startDate = date
      endDate = date
      break

    case 'week': {
      // 해당 주의 월요일 ~ 일요일
      const dayOfWeek = date.getDay()
      const monday = new Date(date)
      monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      startDate = monday
      endDate = sunday
      break
    }

    case 'month':
      // 해당 월의 1일 ~ 말일
      startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      break

    case 'year':
      // 해당 년도의 1월 1일 ~ 12월 31일
      startDate = new Date(date.getFullYear(), 0, 1)
      endDate = new Date(date.getFullYear(), 11, 31)
      break

    default:
      startDate = date
      endDate = date
  }

  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  }
}

// ==================== 템플릿 API ====================

/** 템플릿 목록 조회 */
export async function fetchTemplates(): Promise<TemplateListItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/templates/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new ApiError(
        errorData.error || `API 호출 실패: ${response.status}`,
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : '템플릿 목록 조회 중 알 수 없는 오류 발생'
    )
  }
}

/** 템플릿 상세 조회 */
export async function fetchTemplate(id: number): Promise<ReportTemplate> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/templates/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new ApiError(
        errorData.error || `API 호출 실패: ${response.status}`,
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : '템플릿 조회 중 알 수 없는 오류 발생'
    )
  }
}

/** 템플릿 생성 */
export async function createTemplate(data: CreateTemplateRequest): Promise<ReportTemplate> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/templates/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new ApiError(
        errorData.error || `API 호출 실패: ${response.status}`,
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : '템플릿 생성 중 알 수 없는 오류 발생'
    )
  }
}

/** 템플릿 수정 */
export async function updateTemplate(
  id: number,
  data: UpdateTemplateRequest
): Promise<ReportTemplate> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/templates/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new ApiError(
        errorData.error || `API 호출 실패: ${response.status}`,
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : '템플릿 수정 중 알 수 없는 오류 발생'
    )
  }
}

/** 템플릿 삭제 */
export async function deleteTemplate(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/templates/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new ApiError(
        errorData.error || `API 호출 실패: ${response.status}`,
        response.status,
        errorData
      )
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : '템플릿 삭제 중 알 수 없는 오류 발생'
    )
  }
}

// ==================== 데이터 소스 API ====================

/** 데이터 소스 목록 조회 */
export async function fetchDataSources(): Promise<DataSourceListItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/data-sources/sources/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new ApiError(
        errorData.error || `API 호출 실패: ${response.status}`,
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : '데이터 소스 조회 중 알 수 없는 오류 발생'
    )
  }
}

/** 데이터 소스 컬럼 조회 */
export async function fetchColumns(dataSourceId: number): Promise<ColumnsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/data-sources/sources/${dataSourceId}/columns/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new ApiError(
        errorData.error || `API 호출 실패: ${response.status}`,
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : '컬럼 조회 중 알 수 없는 오류 발생'
    )
  }
}
