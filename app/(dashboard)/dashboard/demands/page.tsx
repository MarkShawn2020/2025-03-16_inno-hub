import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, AlertTriangle, InfoIcon } from 'lucide-react';
import { DemandStatusBadge } from './components/demand-status-badge';
import { formatDate } from '@/lib/utils';
import { getDemandsForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { demands } from '@/lib/db/schema';
import { unstable_noStore } from 'next/cache';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/UserAvatar';
import { deleteDemand } from './actions';
import DeleteDemandButton from './components/delete-demand-button';
import { DemandWordCloud } from './components/demand-word-cloud';
import { getCurrentUser, obfuscateSensitiveInfo, hasPermission } from '@/lib/auth/utils';

export const metadata: Metadata = {
  title: '企业需求库 | 商机共振平台',
  description: '浏览企业需求及商机信息',
};

// 获取公开的需求，不包含敏感信息
async function getPublicDemands() {
  unstable_noStore();
  return db.query.demands.findMany({
    orderBy: [demands.createdAt],
    with: {
      matchResults: true,
      submitter: true // 包含所有用户字段，而不仅仅是id和name
    }
  });
}

export default async function DemandsPage() {
  unstable_noStore();
  
  // 获取当前用户（如果已登录）
  const currentUser = await getCurrentUser();
  const isLoggedIn = !!currentUser;

  // 根据登录状态获取不同的数据
  const allDemands = isLoggedIn 
    ? await getDemandsForUser() 
    : await getPublicDemands();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">企业需求库</h1>
        
        {isLoggedIn ? (
          <Link href="/dashboard/demands/new">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              发布需求
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
            <AlertTriangle className="h-4 w-4" />
            <Link href="/sign-in" className="underline font-medium">登录</Link>
            <span>后可发布需求并获取匹配结果</span>
          </div>
        )}
      </div>

      <DemandWordCloud demands={allDemands} />

      {allDemands.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无需求记录</h3>
          <p className="text-gray-500 mb-6">
            系统中还没有任何企业需求，点击"发布需求"按钮添加第一个需求
          </p>
          {isLoggedIn && (
            <Link href="/dashboard/demands/new">
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                提交第一个需求
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  需求标题
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  提交时间
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  状态
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  匹配企业数
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  提交人
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {allDemands.map((demand) => {
                const isOwner = hasPermission(demand.submitter?.id, currentUser?.id);
                
                return (
                  <tr key={demand.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      <Link
                        href={isLoggedIn ? `/dashboard/demands/${demand.id}` : `/sign-in?redirect=/dashboard/demands/${demand.id}`}
                        className="hover:text-orange-500 hover:underline flex items-center gap-1"
                      >
                        {demand.title}
                        {!isLoggedIn && <InfoIcon className="h-3 w-3 text-orange-500" />}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(demand.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <DemandStatusBadge status={demand.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {demand.matchResults.length}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {isLoggedIn && demand.submitter ? (
                          <>
                            <UserAvatar 
                              user={{
                                name: demand.submitter?.name || '',
                                email: demand.submitter?.email || `user-${demand.submitter?.id || 'unknown'}@example.com`,
                              }}
                              className="h-6 w-6 ring-1 ring-gray-100" 
                              fallbackClassName="text-xs"
                              showBorder={false}
                            />
                            <span>{demand.submitter?.name || '未知用户'}</span>
                          </>
                        ) : (
                          <span>{demand.submitter?.name ? obfuscateSensitiveInfo(demand.submitter.name, false) : '未知用户'}</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {isLoggedIn ? (
                          <>
                            <Link href={`/dashboard/demands/${demand.id}`}>
                              <Button variant="outline" size="sm">
                                查看详情
                              </Button>
                            </Link>
                            <Link href={`/dashboard/demands/${demand.id}/matches`}>
                              <Button size="sm">查看匹配</Button>
                            </Link>
                            {isOwner && (
                              <DeleteDemandButton demandId={demand.id} title={demand.title} />
                            )}
                          </>
                        ) : (
                          <Link href={`/sign-in?redirect=/dashboard/demands/${demand.id}`}>
                            <Button size="sm">
                              登录查看详情
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {!isLoggedIn && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-2">需要更多功能？</h3>
          <p className="text-gray-600 mb-4">登录后可发布需求、查看匹配结果，并与合作伙伴进行洽谈</p>
          <Link href="/sign-in">
            <Button>登录或注册</Button>
          </Link>
        </div>
      )}
    </div>
  );
} 