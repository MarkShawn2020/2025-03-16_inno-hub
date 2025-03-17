'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Treemap, Cell, Legend } from 'recharts';

// 颜色配置 - 更加美观的配色方案
const INDUSTRY_COLORS = [
  '#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', 
  '#1abc9c', '#f1c40f', '#e67e22', '#34495e', '#7f8c8d'
];

// 定义数据类型
type IndustryData = {
  name: string;
  value: number;
};

type IndustryChartsProps = {
  industryDistribution: IndustryData[];
};

// Treemap自定义内容组件
const TreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, value } = props;
  
  // 确保文本能够显示在矩形内
  const textWidth = width - 10;
  const textHeight = height - 10;
  
  // 只在矩形足够大时显示文本
  const shouldDisplayText = width > 50 && height > 30;
  
  // 百分比计算
  const total = root.children?.reduce((sum: number, item: any) => sum + item.value, 0) || 0;
  const percentage = total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '';
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: INDUSTRY_COLORS[index % INDUSTRY_COLORS.length],
          stroke: '#fff',
          strokeWidth: 2,
          opacity: 0.9,
          cursor: 'pointer',
          transition: 'opacity 0.3s'
        }}
      />
      {shouldDisplayText && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
            style={{
              textShadow: '0px 1px 2px rgba(0,0,0,0.3)',
              pointerEvents: 'none'
            }}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={11}
            style={{
              textShadow: '0px 1px 2px rgba(0,0,0,0.3)',
              pointerEvents: 'none'
            }}
          >
            {`${value}家 (${percentage})`}
          </text>
        </>
      )}
    </g>
  );
};

// 自定义提示框组件
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow text-xs">
        <p className="font-semibold">{data.name}</p>
        <p>企业数量: <span className="font-medium">{data.value}家</span></p>
        <p>占比: <span className="font-medium">{((data.value / payload[0].value) * 100).toFixed(1)}%</span></p>
      </div>
    );
  }
  return null;
};

export default function IndustryCharts({ industryDistribution }: IndustryChartsProps) {
  // 处理数据以适应Treemap格式，直接传递数组
  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <Card className="shadow-sm hover:shadow transition-shadow duration-300">
        <CardHeader>
          <CardTitle>企业行业分布 (矩形树图)</CardTitle>
          <CardDescription>
            矩形大小表示各行业企业数量占比
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {industryDistribution && industryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={industryDistribution}
                dataKey="value"
                aspectRatio={1}
                stroke="#fff"
                fill="#8884d8"
                content={<TreemapContent />}
                animationDuration={500}
                animationEasing="ease-out"
              >
                <Tooltip content={<CustomTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">暂无数据</p>
            </div>
          )}
        </CardContent>
      </Card>
      

    </div>
  );
} 