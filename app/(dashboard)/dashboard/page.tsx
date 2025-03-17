import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Building, FileText, BriefcaseBusiness, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { getUser, getDashboardStats, getRecentDemands, getRecentMatches, getCompanyIndustryDistribution } from '@/lib/db/queries';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import IndustryCharts from './industry-charts';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // 获取统计数据
  const stats = await getDashboardStats();
  const recentDemands = await getRecentDemands(2);
  const industryDistribution = await getCompanyIndustryDistribution();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">商机匹配平台概览</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总需求数</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDemands || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.demandChange && stats.demandChange > 0 ? (
                <span className="text-green-500 inline-flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {stats.demandChange}
                </span>
              ) : stats?.demandChange && stats.demandChange < 0 ? (
                <span className="text-red-500 inline-flex items-center">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {Math.abs(stats.demandChange)}
                </span>
              ) : (
                <span className="text-gray-500 inline-flex items-center">
                  0
                </span>
              )}{' '}
              vs 上月
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">企业数量</CardTitle>
            <Building className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.companyChange && stats.companyChange > 0 ? (
                <span className="text-green-500 inline-flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {stats.companyChange}
                </span>
              ) : stats?.companyChange && stats.companyChange < 0 ? (
                <span className="text-red-500 inline-flex items-center">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {Math.abs(stats.companyChange)}
                </span>
              ) : (
                <span className="text-gray-500 inline-flex items-center">
                  0
                </span>
              )}{' '}
              vs 上月
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">匹配成功</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successfulMatches || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.matchChange && stats.matchChange > 0 ? (
                <span className="text-green-500 inline-flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {stats.matchChange}
                </span>
              ) : stats?.matchChange && stats.matchChange < 0 ? (
                <span className="text-red-500 inline-flex items-center">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {Math.abs(stats.matchChange)}
                </span>
              ) : (
                <span className="text-gray-500 inline-flex items-center">
                  0
                </span>
              )}{' '}
              vs 上月
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">匹配率</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.matchRate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.matchRateChange && stats.matchRateChange > 0 ? (
                <span className="text-green-500 inline-flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {stats.matchRateChange}%
                </span>
              ) : stats?.matchRateChange && stats.matchRateChange < 0 ? (
                <span className="text-red-500 inline-flex items-center">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {Math.abs(stats.matchRateChange)}%
                </span>
              ) : (
                <span className="text-gray-500 inline-flex items-center">
                  0%
                </span>
              )}{' '}
              vs 上月
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>最近需求</CardTitle>
            <CardDescription>
              您最近创建的需求
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDemands && recentDemands.length > 0 ? (
                recentDemands.map(demand => (
                  <div className="border rounded-md p-4" key={demand.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{demand.title}</h3>
                        <p className="text-sm text-gray-500">{demand.cooperationType || '未指定'}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs 
                        ${demand.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          demand.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {demand.status === 'new' ? '新需求' : 
                         demand.status === 'in_progress' ? '进行中' : 
                         demand.status === 'completed' ? '已完成' : 
                         demand.status === 'matched' ? '已匹配' : '进行中'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {demand.description}
                    </p>
                    <Link href={`/dashboard/demands/${demand.id}`} className="text-sm text-blue-600 hover:underline">
                      查看详情
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暂无需求记录
                </div>
              )}
              
              {recentDemands && recentDemands.length > 0 && (
                <div className="text-center">
                  <Link href="/dashboard/demands" className="text-sm text-blue-600 hover:underline">
                    查看全部需求
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
      </div>
      
      {/* 图表区域 */}
      <IndustryCharts industryDistribution={industryDistribution} />
    </div>
  );
}
