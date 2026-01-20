import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { CombinationChartProps, DEFAULT_COLORS, THRESHOLD_COLOR } from './types';

/**
 * Combination Chart 컴포넌트 (Bar + Line)
 * - Dual Y-Axis (좌측: Bar, 우측: Line)
 * - Tooltip (호버)
 * - Data Label
 * - Threshold/Target Line
 */
const CombinationChart: React.FC<CombinationChartProps> = ({
  data,
  xAxisKey,
  barKey,
  lineKey,
  title,
  colors = DEFAULT_COLORS,
  height = 300,
  thresholdValue,
  thresholdLabel = '목표',
  showDataLabel = true,
}) => {
  // barKey와 lineKey를 배열로 정규화
  const barKeys = Array.isArray(barKey) ? barKey : [barKey];
  const lineKeys = Array.isArray(lineKey) ? lineKey : [lineKey];

  // Bar와 Line에 사용할 색상 분리
  const barColors = colors.slice(0, barKeys.length);
  const lineColors = colors.slice(barKeys.length, barKeys.length + lineKeys.length);

  // 색상이 부족할 경우 기본 색상 사용
  const getBarColor = (index: number) =>
    barColors[index] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  const getLineColor = (index: number) =>
    lineColors[index] || DEFAULT_COLORS[(barKeys.length + index) % DEFAULT_COLORS.length];

  return (
    <div className="chart-container" style={{ width: '100%', height: '100%' }}>
      {title && (
        <h3
          style={{
            textAlign: 'center',
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
          }}
        >
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#D1D5DB' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          {/* 좌측 Y축 (Bar용) */}
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#D1D5DB' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          {/* 우측 Y축 (Line용) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#D1D5DB' }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ fontWeight: 600, color: '#374151' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="rect"
          />

          {/* Threshold/Target Line (좌측 Y축 기준) */}
          {thresholdValue !== undefined && (
            <ReferenceLine
              yAxisId="left"
              y={thresholdValue}
              stroke={THRESHOLD_COLOR}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: thresholdLabel,
                position: 'right',
                fill: THRESHOLD_COLOR,
                fontSize: 12,
              }}
            />
          )}

          {/* Bar 렌더링 */}
          {barKeys.map((key, index) => (
            <Bar
              key={`bar-${key}`}
              yAxisId="left"
              dataKey={key}
              fill={getBarColor(index)}
              radius={[4, 4, 0, 0]}
              name={key}
            >
              {showDataLabel && (
                <LabelList
                  dataKey={key}
                  position="top"
                  style={{ fontSize: 10, fill: '#374151' }}
                />
              )}
            </Bar>
          ))}

          {/* Line 렌더링 */}
          {lineKeys.map((key, index) => (
            <Line
              key={`line-${key}`}
              yAxisId="right"
              type="monotone"
              dataKey={key}
              stroke={getLineColor(index)}
              strokeWidth={2}
              dot={{
                fill: getLineColor(index),
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
              }}
              name={key}
            >
              {showDataLabel && (
                <LabelList
                  dataKey={key}
                  position="top"
                  style={{ fontSize: 10, fill: '#374151' }}
                  offset={8}
                />
              )}
            </Line>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinationChart;
