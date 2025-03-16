import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Building, FileText, BriefcaseBusiness, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/db/queries';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                2
              </span>{' '}
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
            <div className="text-2xl font-bold">68</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                12
              </span>{' '}
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
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                1
              </span>{' '}
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
            <div className="text-2xl font-bold">58%</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-red-500 inline-flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                3%
              </span>{' '}
              vs 上月
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>最近需求</CardTitle>
            <CardDescription>
              您最近创建的需求
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">智慧城市解决方案</h3>
                    <p className="text-sm text-gray-500">新能源</p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs bg-blue-100 text-blue-800">
                    进行中
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  寻找智慧城市领域的解决方案，重点关注交通管理和能源监控系统...
                </p>
                <Link href="/dashboard/demands/1" className="text-sm text-blue-600 hover:underline">
                  查看详情
                </Link>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">无人机应用开发</h3>
                    <p className="text-sm text-gray-500">无人机</p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs bg-green-100 text-green-800">
                    已匹配
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  寻找无人机应用开发合作伙伴，重点在农业和工业巡检领域...
                </p>
                <Link href="/dashboard/demands/2" className="text-sm text-blue-600 hover:underline">
                  查看详情
                </Link>
              </div>
              
              <div className="text-center">
                <Link href="/dashboard/demands" className="text-sm text-blue-600 hover:underline">
                  查看全部需求
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>最新匹配</CardTitle>
            <CardDescription>
              系统为您找到的最新匹配结果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">智慧城市解决方案</h3>
                  <span className="text-sm text-gray-500">昨天</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-medium">上海科技有限公司</p>
                    <p className="text-sm text-gray-600">匹配度: 92%</p>
                  </div>
                  <Link href="/dashboard/matches/1" className="text-sm text-blue-600 hover:underline">
                    查看详情
                  </Link>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">无人机应用开发</h3>
                  <span className="text-sm text-gray-500">3天前</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-medium">北京航空科技有限公司</p>
                    <p className="text-sm text-gray-600">匹配度: 87%</p>
                  </div>
                  <Link href="/dashboard/matches/2" className="text-sm text-blue-600 hover:underline">
                    查看详情
                  </Link>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/dashboard/matches" className="text-sm text-blue-600 hover:underline">
                  查看全部匹配
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>企业行业分布</CardTitle>
            <CardDescription>
              所有企业按行业分类的统计
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">图表加载中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
