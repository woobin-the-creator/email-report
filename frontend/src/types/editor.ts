/**
 * Phase 2 에디터 관련 타입 정의
 *
 * EditorState, EditorAction 및 에디터에서 사용하는 모든 타입을 정의합니다.
 * 기준 타입은 types/api.ts에서 가져옵니다.
 */

import type {
  ChartConfig,
  LayoutItem,
  ReportTemplate,
} from './api'

// ==================== 차트 타입 통합 ====================

/** 차트 타입 (combination 포함) */
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'combination'

// ==================== 데이터 소스 관련 ====================

/** 데이터 소스 */
export interface DataSource {
  id: number
  name: string
  table_name: string
  description?: string
}

/** 컬럼 정보 */
export interface ColumnInfo {
  name: string
  type: 'string' | 'number' | 'date'
}

// ==================== 에디터 상태 ====================

/** 에디터 전체 상태 */
export interface EditorState {
  /** 템플릿 ID (null = 새 템플릿) */
  templateId: number | null
  /** 템플릿 이름 */
  templateName: string
  /** 템플릿 설명 */
  description: string

  /** 레이아웃 아이템 배열 (react-grid-layout) */
  layout: LayoutItem[]
  /** 차트 설정 (ID 기반 Record) */
  charts: Record<string, ChartConfig>

  /** 현재 선택된 차트 ID */
  selectedChartId: string | null
  /** 변경사항 존재 여부 */
  isDirty: boolean
  /** 저장 중 여부 */
  isSaving: boolean
  /** 로딩 중 여부 */
  isLoading: boolean
  /** 에러 메시지 */
  error: string | null

  /** 데이터 소스 목록 */
  dataSources: DataSource[]
  /** 테이블별 컬럼 캐시 */
  columnCache: Record<string, ColumnInfo[]>
}

// ==================== 에디터 액션 ====================

/** 에디터 리듀서 액션 */
export type EditorAction =
  | { type: 'LOAD_TEMPLATE'; payload: ReportTemplate }
  | { type: 'SET_TEMPLATE_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'UPDATE_LAYOUT'; payload: LayoutItem[] }
  | { type: 'ADD_CHART'; payload: { id: string; config: ChartConfig; layoutItem: LayoutItem } }
  | { type: 'REMOVE_CHART'; payload: string }
  | { type: 'DUPLICATE_CHART'; payload: string }
  | { type: 'UPDATE_CHART'; payload: { id: string; config: Partial<ChartConfig> } }
  | { type: 'SELECT_CHART'; payload: string | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'RESET_EDITOR' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: { id: number } }
  | { type: 'SAVE_ERROR'; payload: string }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'SET_DATA_SOURCES'; payload: DataSource[] }
  | { type: 'CACHE_COLUMNS'; payload: { tableName: string; columns: ColumnInfo[] } }

// ==================== 유효성 검증 ====================

/** 유효성 검증 결과 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/** 유효성 검증 에러 */
export interface ValidationError {
  field: string
  message: string
}

// ==================== 차트 팔레트 ====================

/** 차트 팔레트 아이템 */
export interface ChartPaletteItem {
  type: ChartType
  label: string
  defaultConfig: Partial<ChartConfig>
  defaultSize: { w: number; h: number }
}

// ==================== 그리드 설정 상수 ====================

/** react-grid-layout 기본 설정 */
export const GRID_CONFIG = {
  cols: 12,
  rowHeight: 60,
  margin: [10, 10] as [number, number],
  containerPadding: [10, 10] as [number, number],
  compactType: 'vertical' as const,
  preventCollision: false,
  isResizable: true,
  isDraggable: true,
}

/** 차트 타입별 기본 크기 및 최소 크기 */
export const CHART_SIZE_CONFIG: Record<ChartType, {
  default: { w: number; h: number }
  min: { w: number; h: number }
}> = {
  bar:         { default: { w: 6, h: 4 }, min: { w: 3, h: 3 } },
  line:        { default: { w: 6, h: 4 }, min: { w: 3, h: 3 } },
  pie:         { default: { w: 4, h: 5 }, min: { w: 3, h: 4 } },
  area:        { default: { w: 6, h: 4 }, min: { w: 3, h: 3 } },
  combination: { default: { w: 8, h: 5 }, min: { w: 4, h: 4 } },
}

/** 차트 타입별 미리보기 데이터 제한 수 */
export const PREVIEW_LIMITS: Record<ChartType, number> = {
  bar: 15,
  line: 20,
  pie: 8,
  area: 20,
  combination: 15,
}

/** 차트 타입 한국어 라벨 */
export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  bar: '막대',
  line: '꺾은선',
  pie: '원형',
  area: '영역',
  combination: '복합',
}

// ==================== 초기 상태 ====================

/** 에디터 초기 상태 */
export const initialEditorState: EditorState = {
  templateId: null,
  templateName: '새 템플릿',
  description: '',
  layout: [],
  charts: {},
  selectedChartId: null,
  isDirty: false,
  isSaving: false,
  isLoading: false,
  error: null,
  dataSources: [],
  columnCache: {},
}

// ==================== 재export (편의용) ====================

export type { ChartConfig, LayoutItem, DataBinding, ChartStyle, ReportTemplate } from './api'
