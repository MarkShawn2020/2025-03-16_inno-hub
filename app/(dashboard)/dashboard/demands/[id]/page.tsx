import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db/drizzle';
import { demands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BarChart2, Calendar, CreditCard, Loader2, Trash2 } from 'lucide-react';
import { DemandStatusBadge } from '../components/demand-status-badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { unstable_noStore } from 'next/cache';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/UserAvatar';
import DeleteDemandButton from '../components/delete-demand-button';
import { getUser } from '@/lib/db/queries';

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
  const mockDate = new Date();
  return {
    id,
    title: `测试需求 ${id}`,
    description: '这是一个测试需求，用于调试页面显示',
    status: 'new',
    createdAt: mockDate,
    budget: 100000,
    timeline: '3个月',
    cooperationType: '技术合作',
    submitter: {
      id: 1,
      name: '测试用户',
      email: 'test@example.com',
      passwordHash: '[已加密]',
      role: 'member',
      createdAt: mockDate,
      updatedAt: mockDate,
      deletedAt: null
    },
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
    matchResults: []
  };
}

// 简化版的获取需求函数
async function getDemand(id: number) {
  console.log(`===== 尝试获取需求 ID: ${id} =====`);
  
  try {
    // 先尝试获取基本需求信息
    const demand = await db.query.demands.findFirst({
      where: eq(demands.id, id),
    });
    
    console.log('数据库查询结果:', demand ? `找到需求: ${demand.title}` : '需求不存在');
    
    if (!demand) {
      console.log(`警告: 数据库中不存在ID为${id}的需求，返回模拟数据以便调试`);
      return createMockDemand(id);
    }
    
    // 尝试获取关联数据
    try {
      const fullDemand = await db.query.demands.findFirst({
        where: eq(demands.id, id),
        with: {
          modules: true,
          submitter: true,
          matchResults: {
            with: {
              company: true,
            },
          },
        },
      });
      
      if (fullDemand) {
        console.log(`关联数据加载成功 - 模块数: ${fullDemand.modules.length}`);
        
        if (!fullDemand.submitter) {
          console.warn('警告: 找不到需求的提交者信息，使用默认值');
          const mockDate = new Date();
          fullDemand.submitter = {
            id: 0,
            name: '未知用户',
            email: 'unknown@example.com',
            passwordHash: '[已加密]',
            role: 'member',
            createdAt: mockDate,
            updatedAt: mockDate,
            deletedAt: null
          };
        }
        
        return fullDemand;
      }
    } catch (error) {
      console.error('加载关联数据出错:', error);
    }
    
    // 如果关联数据获取失败，添加空的关联数据
    const mockDate = new Date();
    return {
      ...demand,
      submitter: {
        id: 0,
        name: '未知用户',
        email: 'unknown@example.com',
        passwordHash: '[已加密]',
        role: 'member',
        createdAt: mockDate,
        updatedAt: mockDate,
        deletedAt: null
      },
      modules: [],
      matchResults: []
    };
  } catch (error) {
    console.error('获取需求数据时出错:', error);
    // 出错时返回模拟数据，确保页面不会崩溃
    return createMockDemand(id);
  }
}

export default async function DemandPage({ params }: DemandPageProps) {
  unstable_noStore() // opt out before we even get to the try/catch

  // 获取当前登录用户
  const currentUser = await getUser();

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
                <span className="text-gray-500 text-sm">
                  提交于 {formatRelativeTime(demand.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/demands/${demand.id}/edit`}>
                <Button variant="outline">编辑需求</Button>
              </Link>
              <Link href={`/dashboard/demands/${demand.id}/matches`}>
                <Button>查看匹配结果</Button>
              </Link>
              {currentUser && demand.submitter && currentUser.id === demand.submitter.id && (
                <DeleteDemandButton demandId={demand.id} title={demand.title} />
              )}
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

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>提交人</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>提交人:</span>
                <div className="flex items-center gap-1">
                  <UserAvatar 
                    user={demand.submitter} 
                    className="h-5 w-5 ring-1 ring-gray-100"
                    fallbackClassName="text-xs"
                    showBorder={false}
                  />
                  <span>{demand.submitter.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
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