import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db/drizzle';
import { demands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { use } from 'react';
import { useUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BarChart2, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { DemandStatusBadge } from '../components/demand-status-badge';
import { formatDate } from '@/lib/utils';

interface DemandPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: DemandPageProps): Promise<Metadata> {
  const demand = await getDemand(parseInt(params.id));

  if (!demand) {
    return {
      title: '需求不存在 | 商机匹配平台',
    };
  }

  return {
    title: `${demand.title} | 商机匹配平台`,
    description: demand.description.substring(0, 160),
  };
}

async function getDemand(id: number) {
  try {
    const { userPromise } = useUser();
    const user = use(userPromise);

    if (!user) {
      return null;
    }

    const demand = await db.query.demands.findFirst({
      where: eq(demands.id, id),
      with: {
        modules: true,
        matchResults: {
          with: {
            company: true,
          },
        },
      },
    });

    if (!demand || demand.submittedBy !== user.id) {
      return null;
    }

    return demand;
  } catch (error) {
    console.error('获取需求信息时出错:', error);
    return null;
  }
}

export default function DemandPage({ params }: DemandPageProps) {
  const demand = use(getDemand(parseInt(params.id)));

  if (!demand) {
    notFound();
  }

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
            <Link href={`/dashboard/demands/${demand.id}/edit`}>
              <Button variant="outline">编辑需求</Button>
            </Link>
            <Link href={`/dashboard/demands/${demand.id}/matches`}>
              <Button>查看匹配结果</Button>
            </Link>
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
              <div className="text-2xl font-bold">{demand.matchResults.length}</div>
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
                {demand.modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{module.moduleName}</h4>
                      <span className="text-xs text-gray-500">
                        权重: {module.weight * 100}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{module.description}</p>
                    <Progress value={module.weight * 100} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 