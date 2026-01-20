import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from 'recharts';
import { BarChartProps, DEFAULT_COLORS, THRESHOLD_COLOR } from './types';

/**
 * Bar Chart 컴포넌트
 * - Tooltip (호버)
 * - Data Label (막대 위 값 표시)
 * - Threshold/Target Line (수평선)
 */
const BarChart: React.FC<BarChartProps> = ({
  data,
  xAxisKey,
  yAxisKey,
  title,
  colors = DEFAULT_COLORS,
  height = 300,
  thresholdValue,
  thresholdLabel = '목표',
  showDataLabel = true,
}) => {
  // yAxisKey를 배열로 정규화
  const yAxisKeys = Array.isArray(yAxisKey) ? yAxisKey : [yAxisKey];

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
        <RechartsBarChart
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
          <YAxis
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
          {yAxisKeys.length > 1 && (
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
            />
          )}

          {/* Threshold/Target Line */}
          {thresholdValue !== undefined && (
            <ReferenceLine
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
          {yAxisKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
              name={key}
            >
              {/* 단일 시리즈일 때 각 막대에 다른 색상 적용 가능 */}
              {yAxisKeys.length === 1 &&
                data.map((_, cellIndex) => (
                  <Cell
                    key={`cell-${cellIndex}`}
                    fill={colors[cellIndex % colors.length]}
                  />
                ))}

              {/* Data Label */}
              {showDataLabel && (
                <LabelList
                  dataKey={key}
                  position="top"
                  style={{ fontSize: 11, fill: '#374151' }}
                />
              )}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
