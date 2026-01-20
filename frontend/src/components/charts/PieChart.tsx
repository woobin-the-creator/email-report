import React, { useCallback } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PieChartProps, DEFAULT_COLORS } from './types';

/**
 * 커스텀 레이블 렌더링 함수
 * 각 조각에 이름과 퍼센트 표시
 */
interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: Omit<LabelProps, 'name'>) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // 너무 작은 조각은 레이블 생략
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/**
 * 외부 레이블 렌더링 (이름 표시)
 */
const renderOuterLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  percent,
}: LabelProps) => {
  if (percent < 0.05) return null;

  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: 11 }}
    >
      {name}
    </text>
  );
};

/**
 * Pie Chart 컴포넌트
 * - Tooltip (호버)
 * - Data Label (각 조각에 이름/퍼센트)
 */
const PieChart: React.FC<PieChartProps> = ({
  data,
  dataKey,
  nameKey,
  title,
  colors = DEFAULT_COLORS,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  showDataLabel = true,
}) => {
  // 전체 합계 계산 (퍼센트 계산용)
  const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);

  // 툴팁 포맷터
  const tooltipFormatter = useCallback(
    (value: number) => {
      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      return [`${value.toLocaleString()} (${percent}%)`, ''];
    },
    [total]
  );

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
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={showDataLabel}
            label={showDataLabel ? renderOuterLabel : undefined}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey={dataKey}
            nameKey={nameKey}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
            {/* 내부 퍼센트 레이블 */}
            {showDataLabel && (
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                dataKey={dataKey}
                nameKey={nameKey}
                label={renderCustomizedLabel}
                labelLine={false}
                isAnimationActive={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-inner-${index}`}
                    fill="transparent"
                  />
                ))}
              </Pie>
            )}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={tooltipFormatter}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
