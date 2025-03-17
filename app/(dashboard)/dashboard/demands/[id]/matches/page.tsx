import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db/drizzle';
import { demands, matchResults } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Mail, Phone, Lock, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getUser } from '@/lib/db/queries';
import { unstable_noStore } from 'next/cache';

// 定义匹配详情的类型
interface MatchDetails {
  matchReasons?: string[];
  matchedModules?: Array<{
    moduleName: string;
    score: number;
    reason: string;
  }>;
  overallScore?: number;
}

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
  
  // 获取当前用户
  const user = await getUser();
  
  // 当前没有用户登录
  if (!user) {
    redirect('/sign-in');
  }
  
  // 检查用户是否是需求的提交者
  const isOwner = user.id === demand.submitter?.id;
  
  // 如果不是提交者，重定向到需求详情页
  if (!isOwner) {
    return (
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <Link href={`/dashboard/demands/${demand.id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回需求详情
          </Link>
          <h1 className="text-2xl font-bold mb-2">{demand.title}</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center mt-4">
            <Shield className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">权限受限</h3>
              <p className="text-sm text-yellow-700 mt-1">
                您不是此需求的发布者，无法查看详细的匹配结果。请联系需求所有者获取详细信息。
              </p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-gray-600">
              此需求已为所有者匹配到 {demand.matchResults.length} 家企业
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {demand.matchResults.slice(0, 6).map((match) => (
                <div key={match.id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Building className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">{match.company.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {match.company.category && (
                      <div className="mt-1">行业：{match.company.category}</div>
                    )}
                    {match.company.isEastRisingPark && (
                      <div className="mt-1 text-green-600">东升园区企业</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {demand.matchResults.length > 6 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                显示前6家企业，共匹配到 {demand.matchResults.length} 家企业
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href={`/dashboard/demands/${demand.id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回需求详情
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
                      <h2 className="text-lg font-semibold">{match.company.name}</h2>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{match.company.category || '行业未知'}</span>
                        {match.company.subCategory && (
                          <>
                            <span className="mx-1">·</span>
                            <span>{match.company.subCategory}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      匹配度 {Math.round(match.score * 100)}%
                    </div>
                    {match.company.isEastRisingPark && (
                      <div className="mt-1 text-xs text-gray-500">东升园区企业</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">匹配理由</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {((match.matchDetails as MatchDetails)?.matchReasons || []).map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
                
                {(match.matchDetails as MatchDetails)?.matchedModules && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">模块匹配详情</h3>
                    <div className="space-y-3">
                      {((match.matchDetails as MatchDetails).matchedModules || []).map((moduleMatch, index) => (
                        <div key={index} className="border rounded p-3 bg-white">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-medium text-sm">{moduleMatch.moduleName}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              匹配度 {Math.round(moduleMatch.score * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{moduleMatch.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100">
                {match.company.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">企业简介</h3>
                    <p className="text-sm text-gray-700">{match.company.description}</p>
                  </div>
                )}
                
                {Array.isArray(match.company.advantageTags) && match.company.advantageTags.length > 0 && (
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