// 차트 컴포넌트 공통 타입 정의

export interface BaseChartProps {
  /** 차트 제목 */
  title?: string;
  /** 차트 데이터 배열 */
  data: Record<string, any>[];
  /** 커스텀 색상 배열 */
  colors?: string[];
  /** 차트 높이 (기본값: 300) */
  height?: number;
}

export interface AxisChartProps extends BaseChartProps {
  /** X축 데이터 키 */
  xAxisKey: string;
  /** Y축 데이터 키 (단일 또는 배열) */
  yAxisKey: string | string[];
  /** 임계값/목표선 (수평선) */
  thresholdValue?: number;
  /** 임계선 레이블 */
  thresholdLabel?: string;
}

export interface BarChartProps extends AxisChartProps {
  /** 막대 위 데이터 레이블 표시 여부 */
  showDataLabel?: boolean;
}

export interface LineChartProps extends AxisChartProps {
  /** 점 위 데이터 레이블 표시 여부 */
  showDataLabel?: boolean;
  /** 선 타입 */
  lineType?: 'linear' | 'monotone' | 'step';
}

export interface PieChartProps extends BaseChartProps {
  /** 값 데이터 키 */
  dataKey: string;
  /** 이름 데이터 키 */
  nameKey: string;
  /** 내부 반지름 (도넛 차트용) */
  innerRadius?: number;
  /** 외부 반지름 */
  outerRadius?: number;
  /** 데이터 레이블 표시 여부 */
  showDataLabel?: boolean;
}

export interface CombinationChartProps extends BaseChartProps {
  /** X축 데이터 키 */
  xAxisKey: string;
  /** Bar 차트 데이터 키 */
  barKey: string | string[];
  /** Line 차트 데이터 키 */
  lineKey: string | string[];
  /** 임계값/목표선 */
  thresholdValue?: number;
  /** 임계선 레이블 */
  thresholdLabel?: string;
  /** 데이터 레이블 표시 여부 */
  showDataLabel?: boolean;
}

// 기본 색상 팔레트
export const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

// 임계선 기본 색상
export const THRESHOLD_COLOR = '#EF4444';
