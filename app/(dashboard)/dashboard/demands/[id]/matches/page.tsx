import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db/drizzle';
import { demands, matchResults } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Mail, Phone } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { getUser } from '@/lib/db/queries';
import { unstable_noStore } from 'next/cache';

interface MatchesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: MatchesPageProps): Promise<Metadata> {

  const resolvedParams = await params;
  const demand = await getDemand(parseInt(resolvedParams.id));

  if (!demand) {
    return {
      title: '需求不存在 | 商机匹配平台',
    };
  }

  return {
    title: `${demand.title} - 匹配结果 | 商机匹配平台`,
    description: `查看《${demand.title}》的企业匹配结果`,
  };
}

async function getDemand(id: number) {
  unstable_noStore(); // 确保不缓存结果
  
  try {
    // 先获取需求基本信息和匹配结果
    const demand = await db.query.demands.findFirst({
      where: eq(demands.id, id),
      with: {
        submitter: true, // 添加提交者信息加载
        matchResults: {
          orderBy: [desc(matchResults.score)],
          with: {
            company: true,
          },
        },
      },
    });

    // 如果找不到需求，直接返回null
    if (!demand) {
      console.log(`找不到ID为${id}的需求`);
      return null;
    }

    console.log(`成功找到需求: ${demand.title}, 匹配结果数量: ${demand.matchResults.length}`);
    
    // 获取当前用户
    const user = await getUser();
    
    // 当前没有用户登录
    if (!user) {
      console.log(`没有用户登录，无法查看需求匹配结果`);
      return null;
    }
    
    // 检查权限 - 暂时放宽限制，允许任何已登录用户查看匹配结果
    // 如果要严格检查，可以取消下面这行注释
    // if (demand.submittedBy !== user.id) {
    //   console.log(`用户无权查看此需求的匹配结果: 用户ID ${user.id}, 需求提交者ID ${demand.submittedBy}`);
    //   return null;
    // }

    return demand;
  } catch (error) {
    console.error('获取需求匹配结果时出错:', error);
    return null;
  }
}

export default async function MatchesPage({ params }: MatchesPageProps) {
  const resolvedParams = await params;
  const demand = await getDemand(parseInt(resolvedParams.id));

  if (!demand) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/dashboard/demands" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回需求列表
        </Link>
        <h1 className="text-2xl font-bold mb-2">{demand.title} - 匹配结果</h1>
        <p className="text-gray-600">
          基于您的需求，系统已为您匹配到 {demand.matchResults.length} 家企业
        </p>
      </div>

      {demand.matchResults.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无匹配结果</h3>
          <p className="text-gray-500 mb-6">
            系统正在为您匹配合适的企业，请稍后再查看
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {demand.matchResults.map((match) => (
            <div key={match.id} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 relative">
                      {match.company.logo ? (
                        <Image
                          src={match.company.logo}
                          alt={match.company.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {match.company.name}
                        {match.company.isEastRisingPark && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                            东升园区企业
                          </span>
                        )}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="truncate">
                          {match.company.category} {match.company.subCategory ? `/ ${match.company.subCategory}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      匹配度: {Math.floor(match.score * 100)}%
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      更新于 {formatRelativeTime(match.company.lastUpdated)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">企业简介</h4>
                  <p className="text-sm text-gray-900">
                    {match.company.description || '暂无企业简介'}
                  </p>
                </div>

                {!!match.company.advantageTags && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">企业优势</h4>
                    <div className="flex flex-wrap gap-2">
                      {(match.company.advantageTags as string[]).map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {match.company.contactName && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">联系人:</span>
                        {match.company.contactName}
                      </div>
                    )}
                    {match.company.contactPhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {match.company.contactPhone}
                      </div>
                    )}
                  </div>
                  <div>
                    <Link href={`/dashboard/demands/${demand.id}/matches/${match.id}/contact`}>
                      <Button>联系企业</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 