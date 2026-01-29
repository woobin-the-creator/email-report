// types/api.ts를 기준 타입으로 사용하여 중복 제거

import type { ChartConfig, LayoutItem } from './api'

export type { ChartConfig, LayoutItem } from './api'

export interface ChartTemplate {
  id: string
  name: string
  layout: LayoutItem[]
  charts: ChartConfig[]
}

export interface ReportData {
  template: ChartTemplate
  data: Record<string, unknown[]>
  report_date: string
}
