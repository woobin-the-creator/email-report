/**
 * 차트 에디터 상태 관리 Context
 *
 * useReducer 기반으로 에디터의 모든 상태를 관리합니다.
 */

import React, { createContext, useContext, useReducer } from 'react'
import type { ChartConfig } from '../types/api'
import type { EditorState, EditorAction } from '../types/editor'
import { initialEditorState } from '../types/editor'

// ==================== 리듀서 ====================

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'LOAD_TEMPLATE': {
      const template = action.payload
      const chartsRecord: Record<string, ChartConfig> = {}
      for (const chart of template.charts) {
        chartsRecord[chart.id] = chart
      }
      return {
        ...state,
        templateId: template.id,
        templateName: template.name,
        description: template.description ?? '',
        layout: template.layout,
        charts: chartsRecord,
        selectedChartId: null,
        isDirty: false,
        isLoading: false,
        error: null,
      }
    }

    case 'SET_TEMPLATE_NAME':
      return { ...state, templateName: action.payload, isDirty: true }

    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload, isDirty: true }

    case 'UPDATE_LAYOUT':
      return { ...state, layout: action.payload, isDirty: true }

    case 'ADD_CHART': {
      const { id, config, layoutItem } = action.payload
      return {
        ...state,
        charts: { ...state.charts, [id]: config },
        layout: [...state.layout, layoutItem],
        selectedChartId: id,
        isDirty: true,
      }
    }

    case 'REMOVE_CHART': {
      const chartId = action.payload
      const remainingCharts = Object.fromEntries(
        Object.entries(state.charts).filter(([k]) => k !== chartId)
      )
      return {
        ...state,
        charts: remainingCharts,
        layout: state.layout.filter(item => item.i !== chartId),
        selectedChartId: state.selectedChartId === chartId ? null : state.selectedChartId,
        isDirty: true,
      }
    }

    case 'DUPLICATE_CHART': {
      const sourceId = action.payload
      const sourceChart = state.charts[sourceId]
      const sourceLayout = state.layout.find(l => l.i === sourceId)
      if (!sourceChart || !sourceLayout) return state

      const newId = crypto.randomUUID()
      const newChart: ChartConfig = {
        ...sourceChart,
        id: newId,
        title: `${sourceChart.title} (복사)`,
      }
      const newLayout = {
        ...sourceLayout,
        i: newId,
        y: sourceLayout.y + sourceLayout.h,
      }

      return {
        ...state,
        charts: { ...state.charts, [newId]: newChart },
        layout: [...state.layout, newLayout],
        selectedChartId: newId,
        isDirty: true,
      }
    }

    case 'UPDATE_CHART': {
      const { id, config } = action.payload
      const existing = state.charts[id]
      if (!existing) return state
      return {
        ...state,
        charts: {
          ...state.charts,
          [id]: { ...existing, ...config } as ChartConfig,
        },
        isDirty: true,
      }
    }

    case 'SELECT_CHART':
      return { ...state, selectedChartId: action.payload }

    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload }

    case 'RESET_EDITOR':
      return {
        ...initialEditorState,
        dataSources: state.dataSources,
        columnCache: state.columnCache,
      }

    case 'SAVE_START':
      return { ...state, isSaving: true, error: null }

    case 'SAVE_SUCCESS':
      return { ...state, templateId: action.payload.id, isSaving: false, isDirty: false }

    case 'SAVE_ERROR':
      return { ...state, isSaving: false, error: action.payload }

    case 'LOAD_START':
      return { ...state, isLoading: true, error: null }

    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload }

    case 'SET_DATA_SOURCES':
      return { ...state, dataSources: action.payload }

    case 'CACHE_COLUMNS':
      return {
        ...state,
        columnCache: {
          ...state.columnCache,
          [action.payload.tableName]: action.payload.columns,
        },
      }
  }
}

// ==================== Context ====================

interface EditorContextType {
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
}

const EditorContext = createContext<EditorContextType | null>(null)

/** 에디터 상태 Provider */
export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState)

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  )
}

/** 에디터 Context 직접 접근 훅 */
// eslint-disable-next-line react-refresh/only-export-components
export function useEditorContext(): EditorContextType {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext는 EditorProvider 내부에서 사용해야 합니다')
  }
  return context
}
