import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart, ChevronDown, Download, Filter, 
  Search, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';

export const metadata: Metadata = {
  title: '匹配结果 | 商机匹配平台',
  description: '查看所有匹配结果',
};

// 模拟匹配数据
const matches = [
  {
    id: '1',
    demandId: '1',
    demandTitle: '智慧城市解决方案',
    companyId: '101',
    companyName: '上海科技有限公司',
    matchScore: 92,
    category: '新能源',
    date: '2023-03-15',
    status: 'new',
  },
  {
    id: '2',
    demandId: '2',
    demandTitle: '无人机应用开发',
    companyId: '102',
    companyName: '北京航空科技有限公司',
    matchScore: 87,
    category: '无人机',
    date: '2023-03-12',
    status: 'contacted',
  },
  {
    id: '3',
    demandId: '1',
    demandTitle: '智慧城市解决方案',
    companyId: '103',
    companyName: '深圳智能科技有限公司',
    matchScore: 85,
    category: '新能源',
    date: '2023-03-15',
    status: 'new',
  },
  {
    id: '4',
    demandId: '3',
    demandTitle: '能源管理系统',
    companyId: '104',
    companyName: '广州能源科技有限公司',
    matchScore: 78,
    category: '能源管理',
    date: '2023-03-10',
    status: 'contacted',
  },
  {
    id: '5',
    demandId: '2',
    demandTitle: '无人机应用开发',
    companyId: '105',
    companyName: '杭州科技有限公司',
    matchScore: 76,
    category: '无人机',
    date: '2023-03-12',
    status: 'negotiating',
  },
];

export default function MatchesPage() {
  return (
    <div className="max-w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">匹配结果</h1>
          <p className="text-gray-500">查看系统为您的需求找到的匹配企业</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">导出</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">分析</span>
          </Button>
        </div>
      </div>
      
      {/* 筛选和搜索 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索匹配结果..."
                className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <select className="appearance-none py-2 pl-3 pr-10 border border-gray-300 rounded-md">
                  <option value="">全部分类</option>
                  <option value="新能源">新能源</option>
                  <option value="无人机">无人机</option>
                  <option value="能源管理">能源管理</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="relative">
                <select className="appearance-none py-2 pl-3 pr-10 border border-gray-300 rounded-md">
                  <option value="">全部状态</option>
                  <option value="new">未联系</option>
                  <option value="contacted">已联系</option>
                  <option value="negotiating">谈判中</option>
                  <option value="successful">成功合作</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">筛选</span>
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">高级筛选</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 匹配结果表格 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium">
                  <div className="flex items-center gap-1 cursor-pointer">
                    需求名称
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <div className="flex items-center gap-1 cursor-pointer">
                    匹配企业
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <div className="flex items-center gap-1 cursor-pointer">
                    分类
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <div className="flex items-center gap-1 cursor-pointer">
                    匹配度
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <div className="flex items-center gap-1 cursor-pointer">
                    状态
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <div className="flex items-center gap-1 cursor-pointer">
                    生成日期
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {matches.map((match) => (
                <tr key={match.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/demands/${match.demandId}`} className="text-blue-600 hover:underline">
                      {match.demandTitle}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/companies/${match.companyId}`} className="text-blue-600 hover:underline">
                      {match.companyName}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs bg-gray-100 text-gray-800">
                      {match.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className={`font-medium ${match.matchScore >= 85 ? 'text-green-600' : match.matchScore >= 70 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {match.matchScore}%
                      </span>
                      <div className="ml-2 h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${match.matchScore >= 85 ? 'bg-green-500' : match.matchScore >= 70 ? 'bg-yellow-500' : 'bg-gray-500'}`}
                          style={{ width: `${match.matchScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                      match.status === 'new' 
                        ? 'bg-blue-100 text-blue-800' 
                        : match.status === 'contacted' 
                        ? 'bg-purple-100 text-purple-800'
                        : match.status === 'negotiating'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {match.status === 'new' ? '未联系' : 
                       match.status === 'contacted' ? '已联系' :
                       match.status === 'negotiating' ? '谈判中' : '成功合作'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {match.date}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/dashboard/matches/${match.id}`}>
                      <Button size="sm" variant="outline">详情</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 分页 */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            显示第 1-5 条，共 5 条结果
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>上一页</Button>
            <Button variant="outline" size="sm" disabled>下一页</Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 