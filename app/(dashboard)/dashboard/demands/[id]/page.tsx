import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db/drizzle';
import { demands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BarChart2, Calendar, CreditCard, Loader2, Shield, Users, Building, Lock } from 'lucide-react';
import { DemandStatusBadge } from '../components/demand-status-badge';
import { formatDate } from '@/lib/utils';
import { unstable_noStore } from 'next/cache';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/UserAvatar';
import { getUser } from '@/lib/db/queries';
import MatchButton from './components/match-button';
import DeleteButton from './delete-button';

interface DemandPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 定义需求数据类型
interface DemandModule {
  id: number;
  moduleName: string;
  description: string;
  weight: number;
  demandId: number;
  createdAt: Date;
}

interface MatchResult {
  id: number;
  score: number;
  company: {
    id: number;
    name: string;
    category?: string | null;
    isEastRisingPark?: boolean;
    logo?: string | null;
  };
}

interface DemandData {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  budget: number | null;
  timeline: string | null;
  cooperationType: string | null;
  submitter?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  modules?: DemandModule[];
  matchResults?: MatchResult[];
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
function createMockDemand(id: number): DemandData {
  const mockDate = new Date();
  return {
    id,
    title: `测试需求 ${id}`,
    description: '这是一个测试需求，用于调试页面显示',
    status: 'new',
    createdAt: mockDate,
    updatedAt: mockDate,
    budget: 100000,
    timeline: '3个月',
    cooperationType: '技术合作',
    submitter: {
      id: 1,
      name: '测试用户',
      email: 'test@example.com',
    },
    modules: [
      {
        id: 1,
        moduleName: '模块1',
        description: '测试模块描述',
        weight: 0.5,
        demandId: id,
        createdAt: mockDate,
      }
    ],
    matchResults: []
  };
}

// 简化版的获取需求函数
async function getDemand(id: number): Promise<DemandData | null> {
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
      
      console.log(
        `已加载关联数据, 模块数量: ${fullDemand?.modules?.length || 0}, ` +
        `匹配结果数量: ${fullDemand?.matchResults?.length || 0}, ` +
        `提交者: ${fullDemand?.submitter?.name || '未找到'}`
      );
      
      return fullDemand as unknown as DemandData;
    } catch (error) {
      console.error(`加载关联数据时出错:`, error);
      console.log(`尝试返回基础需求数据...`);
      return demand as unknown as DemandData;
    }
  } catch (error) {
    console.error(`获取需求数据时出错:`, error);
    console.log(`返回模拟数据以便调试...`);
    return createMockDemand(id);
  }
}

export default async function DemandPage({ params }: DemandPageProps) {
  unstable_noStore(); // opt out before we even get to the try/catch

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
    
    if (!demand) {
      notFound();
    }
    
    console.log('成功获取需求数据，准备渲染页面');

    // 获取当前用户
    const user = await getUser();
    
    // 检查用户是否是需求的提交者
    const isOwner = user && demand.submitter && user.id === demand.submitter.id;

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
              </div>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <>
                  <Link href={`/dashboard/demands/${demand.id}/edit`}>
                    <Button variant="outline">编辑需求</Button>
                  </Link>
                  <MatchButton 
                    demandId={demand.id} 
                    isOwner={isOwner} 
                    currentStatus={demand.status}
                  />
                </>
              )}
              {!isOwner && (
                <Button 
                  variant="outline" 
                  disabled
                  className="cursor-not-allowed"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  您不是此需求的所有者
                </Button>
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
                {isOwner ? (
                  <Link href={`/dashboard/demands/${demand.id}/matches`}>
                    <Button variant="outline" size="sm">查看详情</Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                    <Lock className="mr-2 h-4 w-4" />
                    权限受限
                  </Button>
                )}
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
                    <span>预算: {formatBudget(demand.budget)}</span>
                  </div>
                )}
                {demand.timeline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>时间线: {demand.timeline}</span>
                  </div>
                )}
                {demand.cooperationType && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>合作类型: {demand.cooperationType}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>需求描述</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{demand.description}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>需求分解</CardTitle>
                <CardDescription>系统自动分解的需求模块</CardDescription>
              </CardHeader>
              <CardContent>
                {demand.modules && demand.modules.length > 0 ? (
                  <div className="space-y-4">
                    {demand.modules.map((module) => (
                      <div key={module.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{module.moduleName}</h3>
                          <span className="text-sm text-gray-500">权重: {module.weight}</span>
                        </div>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">暂无需求模块信息</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>需求提交者</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {demand.submitter && (
                    <UserAvatar 
                      user={{
                        name: demand.submitter.name || undefined,
                        email: demand.submitter.email
                      }}
                    />
                  )}
                  <div>
                    <p className="font-medium">{demand.submitter?.name || '未知用户'}</p>
                    <p className="text-sm text-gray-500">{demand.submitter?.email || ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 匹配结果摘要 - 非所有者只能看简要信息 */}
            {demand.matchResults && demand.matchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>匹配摘要</CardTitle>
                  <CardDescription>
                    {isOwner ? '系统推荐的匹配企业' : '匹配企业简要信息'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {demand.matchResults.slice(0, 3).map((match) => (
                      <div key={match.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{match.company.name}</span>
                        </div>
                        {isOwner && (
                          <span className="text-sm text-gray-500">
                            匹配度: {Math.round(match.score * 100)}%
                          </span>
                        )}
                      </div>
                    ))}
                    {demand.matchResults.length > 3 && (
                      <div className="text-sm text-center mt-2">
                        {isOwner ? (
                          <Link href={`/dashboard/demands/${demand.id}/matches`} className="text-blue-600 hover:underline">
                            查看全部 {demand.matchResults.length} 家匹配企业
                          </Link>
                        ) : (
                          <p className="text-gray-500">共匹配到 {demand.matchResults.length} 家企业</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 需求控制按钮 - 仅所有者可见 */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>需求操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <DeleteButton 
                      demandId={demand.id}
                      demandTitle={demand.title} 
                    />
                  </div>
                </CardContent>
              </Card>
            )}
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