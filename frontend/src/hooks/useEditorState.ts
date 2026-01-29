/**
 * 에디터 상태 관리 편의 훅
 *
 * EditorContext를 래핑하여 액션 함수, 계산된 값, 유효성 검증을 제공합니다.
 */

import { useCallback } from 'react'
import { useEditorContext } from '../contexts/EditorContext'
import { DEFAULT_COLORS } from '../components/charts/types'
import type { ChartConfig, LayoutItem, ReportTemplate } from '../types/api'
import type {
  ChartType,
  DataSource,
  ColumnInfo,
  ValidationResult,
  ValidationError,
} from '../types/editor'
import { CHART_SIZE_CONFIG, CHART_TYPE_LABELS } from '../types/editor'

export function useEditorState() {
  const { state, dispatch } = useEditorContext()

  // ==================== 템플릿 액션 ====================

  const loadTemplate = useCallback((template: ReportTemplate) => {
    dispatch({ type: 'LOAD_TEMPLATE', payload: template })
  }, [dispatch])

  const setTemplateName = useCallback((name: string) => {
    dispatch({ type: 'SET_TEMPLATE_NAME', payload: name })
  }, [dispatch])

  const setDescription = useCallback((desc: string) => {
    dispatch({ type: 'SET_DESCRIPTION', payload: desc })
  }, [dispatch])

  // ==================== 레이아웃 액션 ====================

  const updateLayout = useCallback((layout: LayoutItem[]) => {
    dispatch({ type: 'UPDATE_LAYOUT', payload: layout })
  }, [dispatch])

  // ==================== 차트 액션 ====================

  const addChart = useCallback((type: ChartType): string => {
    const id = crypto.randomUUID()
    const sizeConfig = CHART_SIZE_CONFIG[type]
    const label = CHART_TYPE_LABELS[type]

    const config: ChartConfig = {
      id,
      type,
      title: `새 ${label} 차트`,
      dataBinding: { xAxis: '', yAxis: [], dataSource: '' },
      style: { colors: DEFAULT_COLORS.slice(0, 3) },
    }

    const layoutItem: LayoutItem = {
      i: id,
      x: 0,
      y: Infinity, // react-grid-layout이 하단에 배치
      w: sizeConfig.default.w,
      h: sizeConfig.default.h,
      minW: sizeConfig.min.w,
      minH: sizeConfig.min.h,
    }

    dispatch({ type: 'ADD_CHART', payload: { id, config, layoutItem } })
    return id
  }, [dispatch])

  const removeChart = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CHART', payload: id })
  }, [dispatch])

  const duplicateChart = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_CHART', payload: id })
  }, [dispatch])

  const updateChart = useCallback((id: string, config: Partial<ChartConfig>) => {
    dispatch({ type: 'UPDATE_CHART', payload: { id, config } })
  }, [dispatch])

  const selectChart = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_CHART', payload: id })
  }, [dispatch])

  // ==================== 저장/로딩 상태 ====================

  const startSave = useCallback(() => {
    dispatch({ type: 'SAVE_START' })
  }, [dispatch])

  const saveSuccess = useCallback((id: number) => {
    dispatch({ type: 'SAVE_SUCCESS', payload: { id } })
  }, [dispatch])

  const saveError = useCallback((error: string) => {
    dispatch({ type: 'SAVE_ERROR', payload: error })
  }, [dispatch])

  const startLoad = useCallback(() => {
    dispatch({ type: 'LOAD_START' })
  }, [dispatch])

  const loadError = useCallback((error: string) => {
    dispatch({ type: 'LOAD_ERROR', payload: error })
  }, [dispatch])

  const resetEditor = useCallback(() => {
    dispatch({ type: 'RESET_EDITOR' })
  }, [dispatch])

  // ==================== 데이터 소스 ====================

  const setDataSources = useCallback((sources: DataSource[]) => {
    dispatch({ type: 'SET_DATA_SOURCES', payload: sources })
  }, [dispatch])

  const cacheColumns = useCallback((tableName: string, columns: ColumnInfo[]) => {
    dispatch({ type: 'CACHE_COLUMNS', payload: { tableName, columns } })
  }, [dispatch])

  // ==================== 계산된 값 ====================

  const selectedChart = state.selectedChartId
    ? state.charts[state.selectedChartId] ?? null
    : null

  const chartCount = Object.keys(state.charts).length
  const hasCharts = chartCount > 0

  // ==================== 변환 헬퍼 ====================

  /** Record → Array 변환 (API 전송용) */
  const getChartsArray = useCallback((): ChartConfig[] => {
    return Object.values(state.charts)
  }, [state.charts])

  // ==================== 유효성 검증 ====================

  /** 단일 차트 설정 유효성 검증 */
  const validateChart = useCallback((config: ChartConfig): ValidationResult => {
    const errors: ValidationError[] = []

    if (!config.title?.trim()) {
      errors.push({ field: 'title', message: '차트 제목을 입력해주세요' })
    }

    if (!config.dataBinding?.dataSource) {
      errors.push({ field: 'dataSource', message: '데이터 소스를 선택해주세요' })
    } else {
      const ds = state.dataSources.find(
        d => d.table_name === config.dataBinding.dataSource
      )
      if (!ds) {
        errors.push({ field: 'dataSource', message: '존재하지 않는 데이터 소스입니다' })
      }
    }

    if (config.type !== 'pie' && !config.dataBinding?.xAxis) {
      errors.push({ field: 'xAxis', message: 'X축 컬럼을 선택해주세요' })
    }

    if (!config.dataBinding?.yAxis?.length) {
      errors.push({ field: 'yAxis', message: 'Y축 컬럼을 최소 1개 선택해주세요' })
    }

    if (config.type === 'combination' && (config.dataBinding?.yAxis?.length ?? 0) < 2) {
      errors.push({
        field: 'yAxis',
        message: 'Combination 차트는 Y축 컬럼 2개 이상 필요합니다',
      })
    }

    return { isValid: errors.length === 0, errors }
  }, [state.dataSources])

  /** 전체 차트 유효성 검증 */
  const validateAllCharts = useCallback((): ValidationResult => {
    const allErrors: ValidationError[] = []

    for (const [id, config] of Object.entries(state.charts)) {
      const result = validateChart(config)
      if (!result.isValid) {
        for (const err of result.errors) {
          allErrors.push({
            field: `${id}.${err.field}`,
            message: `[${config.title}] ${err.message}`,
          })
        }
      }
    }

    return { isValid: allErrors.length === 0, errors: allErrors }
  }, [state.charts, validateChart])

  return {
    // 상태 (읽기 전용)
    state,
    selectedChart,
    chartCount,
    hasCharts,

    // 템플릿 액션
    loadTemplate,
    setTemplateName,
    setDescription,

    // 레이아웃 액션
    updateLayout,

    // 차트 액션
    addChart,
    removeChart,
    duplicateChart,
    updateChart,
    selectChart,

    // 저장/로딩
    startSave,
    saveSuccess,
    saveError,
    startLoad,
    loadError,
    resetEditor,

    // 데이터 소스
    setDataSources,
    cacheColumns,

    // 헬퍼
    getChartsArray,
    validateChart,
    validateAllCharts,
  }
}
