import React from 'react';
import { BarChart, LineChart, PieChart, CombinationChart } from '../components/charts';
import type { ChartConfig } from '../types/api';
import type { ChartType } from '../types/editor';

/** ChartConfig + 데이터를 받아 적절한 차트 컴포넌트를 렌더링한다. */
export function renderChart(
  config: ChartConfig,
  data: Record<string, unknown>[],
  height?: number,
): React.ReactNode {
  const { type, title, dataBinding, style } = config;
  const { xAxis, yAxis } = dataBinding;
  const { colors, showThreshold, thresholdValue, showDataLabel } = style;

  const thresholdProps = showThreshold && thresholdValue !== undefined
    ? { thresholdValue }
    : {};

  switch (type) {
    case 'bar':
      return (
        <BarChart
          data={data}
          xAxisKey={xAxis}
          yAxisKey={yAxis}
          title={title}
          colors={colors}
          height={height}
          showDataLabel={showDataLabel}
          {...thresholdProps}
        />
      );

    case 'line':
      return (
        <LineChart
          data={data}
          xAxisKey={xAxis}
          yAxisKey={yAxis}
          title={title}
          colors={colors}
          height={height}
          showDataLabel={showDataLabel}
          lineType="monotone"
          {...thresholdProps}
        />
      );

    case 'area':
      // AreaChart 미구현 - LineChart로 대체
      return (
        <LineChart
          data={data}
          xAxisKey={xAxis}
          yAxisKey={yAxis}
          title={title}
          colors={colors}
          height={height}
          showDataLabel={showDataLabel}
          lineType="monotone"
          {...thresholdProps}
        />
      );

    case 'pie':
      return (
        <PieChart
          data={data}
          dataKey={yAxis[0]}
          nameKey={xAxis}
          title={title}
          colors={colors}
          height={height}
          showDataLabel={showDataLabel}
        />
      );

    case 'combination':
      return (
        <CombinationChart
          data={data}
          xAxisKey={xAxis}
          barKey={yAxis[0]}
          lineKey={yAxis[1] ?? yAxis[0]}
          title={title}
          colors={colors}
          height={height}
          showDataLabel={showDataLabel}
          {...thresholdProps}
        />
      );

    default: {
      const _exhaustive: never = type;
      return <div>지원하지 않는 차트 타입: {_exhaustive}</div>;
    }
  }
}

/** 에디터 미리보기용 플레이스홀더 데이터를 생성한다. */
export function generatePlaceholderData(
  chartType: ChartType,
): Record<string, unknown>[] {
  switch (chartType) {
    case 'bar':
      return [
        { category: 'A', value: 120, value2: 80 },
        { category: 'B', value: 200, value2: 130 },
        { category: 'C', value: 150, value2: 100 },
        { category: 'D', value: 180, value2: 160 },
        { category: 'E', value: 90, value2: 70 },
      ];

    case 'line':
    case 'area':
      return [
        { date: '01/01', value: 30, value2: 50 },
        { date: '01/02', value: 45, value2: 42 },
        { date: '01/03', value: 38, value2: 55 },
        { date: '01/04', value: 60, value2: 48 },
        { date: '01/05', value: 52, value2: 62 },
        { date: '01/06', value: 70, value2: 58 },
      ];

    case 'pie':
      return [
        { name: 'A', value: 400 },
        { name: 'B', value: 300 },
        { name: 'C', value: 200 },
        { name: 'D', value: 100 },
      ];

    case 'combination':
      return [
        { month: '1월', sales: 400, rate: 75 },
        { month: '2월', sales: 300, rate: 68 },
        { month: '3월', sales: 500, rate: 82 },
        { month: '4월', sales: 450, rate: 78 },
        { month: '5월', sales: 600, rate: 88 },
      ];

    default: {
      const _exhaustive: never = chartType;
      return [{ label: 'sample', value: _exhaustive }];
    }
  }
}
