import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db/drizzle';
import { demands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BarChart2, Calendar, CreditCard, Loader2, User } from 'lucide-react';
import { DemandStatusBadge } from '../components/demand-status-badge';
import { formatDate } from '@/lib/utils';
import { unstable_noStore } from 'next/cache';
import DeleteDemandButton from './delete-button';
import { getDemandById } from '@/lib/db/queries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DemandPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: DemandPageProps): Promise<Metadata> {
  // 基本元数据
  return {
    title: '需求详情 | 商机匹配平台',
  };
}

/**
 * 初始化一个空的模拟需求数据
 * 这样即使数据库中没有对应需求，页面也能渲染出内容以便进行调试
 */
function createMockDemand(id: number) {
  return {
    id,
    title: `测试需求 ${id}`,
    description: '这是一个测试需求，用于调试页面显示',
    status: 'new',
    createdAt: new Date(),
    budget: 100000,
    timeline: '3个月',
    cooperationType: '技术合作',
    modules: [
      {
        id: 1,
        moduleName: '模块1',
        description: '测试模块描述',
        weight: 0.5,
      },
      {
        id: 2,
        moduleName: '模块2',
        description: '测试模块描述2',
        weight: 0.5,
      }
    ],
    matchResults: [],
    submitter: {
      id: 1,
      name: '测试用户',
      email: 'test@example.com'
    }
  };
}

// 更新获取需求函数，使用新的查询函数
async function getDemand(id: number) {
  console.log(`===== 尝试获取需求 ID: ${id} =====`);
  
  try {
    // 尝试使用新的查询函数获取需求详情
    const demand = await getDemandById(id);
    
    if (!demand) {
      console.log(`警告: 数据库中不存在ID为${id}的需求，返回模拟数据以便调试`);
      return createMockDemand(id);
    }
    
    return demand;
  } catch (error) {
    console.error('获取需求数据时出错:', error);
    // 出错时返回模拟数据，确保页面不会崩溃
    return createMockDemand(id);
  }
}

export default async function DemandPage({ params }: DemandPageProps) {
  unstable_noStore() // opt out before we even get to the try/catch


  try {
    // 必须先await params再访问其属性
    const resolvedParams = await params;
    console.log('路由参数:', resolvedParams);
    
    // 确保params.id是安全的数字
    const id = parseInt(resolvedParams.id);
    console.log(`解析后的ID: ${id}, 类型: ${typeof id}`);
    
    if (isNaN(id)) {
      console.log(`ID参数无效: "${resolvedParams.id}"`);
      notFound();
    }

    console.log(`正在获取需求数据，ID: ${id}`);
    const demand = await getDemand(id);
    
    console.log('成功获取需求数据，准备渲染页面');

    const matchingProgress = 
      demand.status === 'new' ? 15 :
      demand.status === 'matching' ? 50 :
      demand.status === 'matched' ? 100 : 0;

    // 格式化预算显示
    const formatBudget = (budget: number | null) => {
      if (!budget) return '未设置';
      if (budget >= 10000000) {
        return `${(budget / 10000000).toFixed(2)}千万`;
      }
      if (budget >= 10000) {
        return `${(budget / 10000).toFixed(0)}万`;
      }
      return `${budget}元`;
    };

    return (
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Link href="/dashboard/demands" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回需求列表
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{demand.title}</h1>
              <div className="flex items-center gap-3">
                <DemandStatusBadge status={demand.status} />
                <span className="text-sm text-gray-500">
                  提交于 {formatDate(demand.createdAt)}
                </span>
                {demand.submitter && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span>提交人:</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {demand.submitter.name ? demand.submitter.name.charAt(0).toUpperCase() : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{demand.submitter.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/demands/${demand.id}/edit`}>
                <Button variant="outline">编辑需求</Button>
              </Link>
              <Link href={`/dashboard/demands/${demand.id}/matches`}>
                <Button>查看匹配结果</Button>
              </Link>
              <DeleteDemandButton demandId={demand.id} demandTitle={demand.title} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">匹配进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={matchingProgress} className="h-2" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>需求解析</span>
                  <span>匹配中</span>
                  <span>完成</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">已匹配企业</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{demand.matchResults?.length || 0}</div>
                <Link href={`/dashboard/demands/${demand.id}/matches`}>
                  <Button variant="outline" size="sm">查看详情</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">项目信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demand.budget && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">预算:</span>
                    <span>{formatBudget(demand.budget)}</span>
                  </div>
                )}
                {demand.timeline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">工期:</span>
                    <span>{demand.timeline}</span>
                  </div>
                )}
                {demand.cooperationType && (
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">合作类型:</span>
                    <span>{demand.cooperationType}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>需求描述</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {demand.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>智能模块分解</CardTitle>
                <CardDescription>
                  我们的智能系统已将您的需求分解为以下模块
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demand.modules?.map((module, index) => (
                    <div key={module.id || index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{module.moduleName}</h4>
                        <span className="text-xs text-gray-500">
                          权重: {(module.weight || 0) * 100}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{module.description}</p>
                      <Progress value={(module.weight || 0) * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('页面渲染错误:', error);
    // 发生错误时显示简单的错误页面
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-red-500">页面加载错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p>加载需求详情时出现问题。请尝试刷新页面或返回需求列表。</p>
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-xs">
              {error?.message || '未知错误'}
            </pre>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/demands">
              <Button>返回需求列表</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
} 