'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// 颜色配置
const INDUSTRY_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', 
  '#8884D8', '#83A6ED', '#8DD1E1', '#D0ED57', '#6C8893'
];

// 定义数据类型
type IndustryData = {
  name: string;
  value: number;
};

type IndustryChartsProps = {
  industryDistribution: IndustryData[];
};

export default function IndustryCharts({ industryDistribution }: IndustryChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>企业行业分布</CardTitle>
          <CardDescription>
            所有企业按行业分类的统计
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {industryDistribution && industryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  data={industryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {industryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={INDUSTRY_COLORS[index % INDUSTRY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}家企业`, '数量']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">暂无数据</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>企业数量排名</CardTitle>
          <CardDescription>
            按数量排序的行业分布
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {industryDistribution && industryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={industryDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={70}
                />
                <Tooltip 
                  formatter={(value) => [`${value}家企业`, '数量']}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {industryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={INDUSTRY_COLORS[index % INDUSTRY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
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